import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const BUCKET = "profiles";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

function extForMime(mime: string): string | null {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return null;
}

async function ensureProfilesBucket(admin: ReturnType<typeof createClient>) {
  const { data: buckets, error: listError } = await admin.storage.listBuckets();
  if (listError) return;
  const exists = buckets?.some((b) => b.name === BUCKET || b.id === BUCKET);
  if (exists) return;
  await admin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_BYTES,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });
}

export async function POST(request: Request, context: unknown) {
  const req = request as unknown as NextRequest;
  const partnerId = (context as { params?: { id?: string } }).params?.id;
  if (!partnerId) {
    return NextResponse.json({ error: "Missing partner id" }, { status: 400 });
  }

  const res = NextResponse.json({});
  const supabaseAuth = createServerSupabaseClient(req, res);
  const {
    data: { user },
    error: userError,
  } = await supabaseAuth.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const partnerRow = await supabaseAuth
    .from("partners")
    .select("id, user_id")
    .eq("id", partnerId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (partnerRow.error || !partnerRow.data) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file field required" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Invalid type. Use JPEG, PNG, or WebP." },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 413 });
  }

  const ext = extForMime(file.type);
  if (!ext) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
  }

  const objectPath = `${user.id}/${partnerId}.${ext}`;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  await ensureProfilesBucket(supabaseAdmin);

  const upload = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(objectPath, file, {
      contentType: file.type,
      upsert: true,
    });

  if (upload.error) {
    const msg = upload.error.message.toLowerCase();
    if (msg.includes("bucket not found")) {
      await supabaseAdmin.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: MAX_BYTES,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      });
      const retry = await supabaseAdmin.storage.from(BUCKET).upload(objectPath, file, {
        contentType: file.type,
        upsert: true,
      });
      if (retry.error) {
        return NextResponse.json(
          { error: "Upload failed", details: retry.error.message },
          { status: 500 },
        );
      }
    } else {
      return NextResponse.json(
        { error: "Upload failed", details: upload.error.message },
        { status: 500 },
      );
    }
  }

  const { data: publicData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(objectPath);
  const photoUrl = publicData.publicUrl;

  const updated = await supabaseAdmin
    .from("partners")
    .update({ photo_url: photoUrl })
    .eq("id", partnerId)
    .eq("user_id", user.id)
    .select("photo_url")
    .maybeSingle();

  if (updated.error || !updated.data) {
    return NextResponse.json(
      { error: "Could not update partner photo", details: updated.error?.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ photo_url: updated.data.photo_url }, { status: 200 });
}
