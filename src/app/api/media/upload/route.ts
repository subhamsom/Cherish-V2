import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const MAX_MEMORY_AUDIO_BYTES = 10 * 1024 * 1024;
const MAX_MEMORY_IMAGE_BYTES = 20 * 1024 * 1024;

function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  if (parts.length < 2) return "bin";
  return parts[parts.length - 1].toLowerCase();
}

function sanitizeBaseName(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^.]+$/, "");
  return withoutExt.replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 60) || "upload";
}

async function uploadWithBucketRecovery(
  supabaseAdmin: ReturnType<typeof createClient>,
  bucket: string,
  path: string,
  file: File,
  upsert: boolean,
) {
  const firstAttempt = await supabaseAdmin.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert,
  });

  if (!firstAttempt.error) {
    return firstAttempt;
  }

  const message = firstAttempt.error.message.toLowerCase();
  if (!message.includes("bucket not found")) {
    return firstAttempt;
  }

  const createBucket = await supabaseAdmin.storage.createBucket(bucket, {
    public: false,
  });

  if (createBucket.error && !createBucket.error.message.toLowerCase().includes("already exists")) {
    return firstAttempt;
  }

  return await supabaseAdmin.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert,
  });
}

export async function POST(req: NextRequest) {
  const res = NextResponse.json({});
  const supabaseAuth = createServerSupabaseClient(req, res);
  const {
    data: { user },
    error: userError,
  } = await supabaseAuth.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const type = formData.get("type");
  const memoryId = formData.get("memory_id");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (type !== "memory" && type !== "profile") {
    return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });
  }

  const isAudio = file.type.startsWith("audio/");
  const isImage = file.type.startsWith("image/");

  if (!isAudio && !isImage) {
    return NextResponse.json({ error: "Only audio or image files are allowed" }, { status: 400 });
  }

  if (type === "memory") {
    if (isAudio && file.size > MAX_MEMORY_AUDIO_BYTES) {
      return NextResponse.json({ error: "Audio file too large (max 10MB)" }, { status: 413 });
    }
    if (isImage && file.size > MAX_MEMORY_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image file too large (max 20MB)" }, { status: 413 });
    }
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const extension = getFileExtension(file.name);
  const baseName = sanitizeBaseName(file.name);
  const uniqueSuffix = Date.now();

  let bucket = "";
  let path = "";

  if (type === "memory") {
    if (typeof memoryId !== "string" || !memoryId.trim()) {
      return NextResponse.json({ error: "memory_id is required for memory uploads" }, { status: 400 });
    }
    bucket = "memories";
    path = `${user.id}/${memoryId}/${baseName}-${uniqueSuffix}.${extension}`;
  } else {
    bucket = "profiles";
    path = `${user.id}/photo.${extension}`;
  }

  const upload = await uploadWithBucketRecovery(
    supabaseAdmin,
    bucket,
    path,
    file,
    type === "profile",
  );

  if (upload.error) {
    return NextResponse.json(
      { error: "Upload failed", details: upload.error.message, bucket },
      { status: 500 },
    );
  }

  const signed = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, 60 * 60);

  return NextResponse.json(
    {
      url: signed.data?.signedUrl ?? null,
      path,
      size: file.size,
      bucket,
    },
    { status: 200 },
  );
}
