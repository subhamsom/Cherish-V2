import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type MemoryType = "text" | "voice" | "photo" | "gift" | "occasion";

async function getPartnerIdOrThrow(
  supabaseAuth: ReturnType<typeof createServerSupabaseClient>,
  userId: string,
) {
  const partner = await supabaseAuth
    .from("partners")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (partner.error || !partner.data?.id) return null;
  return partner.data.id;
}

export async function PUT(
  request: Request,
  context: unknown,
) {
  const req = request as unknown as NextRequest;
  const body = await request.json();
  const { title, details, type, tags } = body as {
    title: string;
    details?: string | null;
    type: MemoryType;
    tags?: string[] | null;
  };

  const id = (context as { params?: { id?: string } }).params?.id;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
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

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const partnerId = await getPartnerIdOrThrow(supabaseAuth, user.id);
  if (!partnerId) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  const trimmedTitle = title.trim();
  const trimmedDetails = typeof details === "string" ? details.trim() : null;
  const content = trimmedDetails || trimmedTitle;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const update = await supabaseAdmin
    .from("memories")
    .update({
      title: trimmedTitle,
      content,
      type,
      tags: tags ?? null,
    })
    .eq("id", id)
    .eq("partner_id", partnerId)
    .select("id, title, content, type, tags, created_at")
    .maybeSingle();

  if (update.error) {
    return NextResponse.json(
      { error: "Could not save memory", details: update.error.message },
      { status: 500 },
    );
  }

  if (!update.data) {
    return NextResponse.json({ error: "Memory not found" }, { status: 404 });
  }

  return NextResponse.json({ memory: update.data }, { status: 200 });
}

export async function DELETE(
  request: Request,
  context: unknown,
) {
  const req = request as unknown as NextRequest;
  const id = (context as { params?: { id?: string } }).params?.id;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
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

  const partnerId = await getPartnerIdOrThrow(supabaseAuth, user.id);
  if (!partnerId) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const deleted = await supabaseAdmin
    .from("memories")
    .delete()
    .eq("id", id)
    .eq("partner_id", partnerId)
    .select("id")
    .maybeSingle();

  if (deleted.error) {
    return NextResponse.json(
      { error: "Could not delete memory", details: deleted.error.message },
      { status: 500 },
    );
  }

  if (!deleted.data) {
    return NextResponse.json({ error: "Memory not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

