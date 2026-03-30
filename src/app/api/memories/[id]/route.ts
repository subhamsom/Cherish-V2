import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type MemoryType = "text" | "voice" | "photo" | "gift" | "occasion";

const MEMORY_SELECT =
  "id, title, content, type, tags, liked, pinned, audio_url, image_url, memory_date, created_at";

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

export async function GET(request: Request, context: unknown) {
  const req = request as unknown as NextRequest;
  const params = (context as { params?: unknown }).params as unknown;
  const id =
    params && typeof (params as { then?: unknown }).then === "function"
      ? (await params as { id?: string }).id
      : (params as { id?: string } | undefined)?.id;
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

  const { data, error } = await supabaseAuth
    .from("memories")
    .select(MEMORY_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Could not load memory", details: error.message },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Memory not found" }, { status: 404 });
  }

  return NextResponse.json({ memory: data }, { status: 200 });
}

export async function PUT(
  request: Request,
  context: unknown,
) {
  const req = request as unknown as NextRequest;
  const body = await request.json();
  const { title, details, type, tags, liked, pinned, audio_url, image_url, memory_date } = body as {
    title?: string;
    details?: string | null;
    type?: MemoryType;
    tags?: string[] | null;
    liked?: boolean;
    pinned?: boolean;
    audio_url?: string | null;
    image_url?: string | null;
    memory_date?: string;
  };

  const params = (context as { params?: unknown }).params as unknown;
  const id =
    params && typeof (params as { then?: unknown }).then === "function"
      ? (await params as { id?: string }).id
      : (params as { id?: string } | undefined)?.id;
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

  const updates: Record<string, unknown> = {};

  const hasTitle = typeof title === "string";
  const hasDetails = details !== undefined;

  if (hasTitle) {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    }
    updates.title = trimmedTitle;
  }

  if (hasDetails || hasTitle) {
    const trimmedDetails = typeof details === "string" ? details.trim() : null;
    const contentCandidate =
      trimmedDetails || (typeof updates.title === "string" ? updates.title : null);
    if (contentCandidate) {
      updates.content = contentCandidate;
    }
  }

  if (type) {
    updates.type = type;
  }

  if (tags !== undefined) {
    updates.tags = tags ?? null;
  }

  if (typeof liked === "boolean") {
    updates.liked = liked;
  }

  if (typeof pinned === "boolean") {
    updates.pinned = pinned;
  }

  if (audio_url !== undefined) {
    updates.audio_url = audio_url;
  }

  if (image_url !== undefined) {
    updates.image_url = image_url;
  }

  if (memory_date !== undefined) {
    const md = String(memory_date).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(md)) {
      return NextResponse.json({ error: "Invalid memory_date (use YYYY-MM-DD)" }, { status: 400 });
    }
    updates.memory_date = md;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const update = await supabaseAdmin
    .from("memories")
    .update(updates)
    .eq("id", id)
    .eq("partner_id", partnerId)
    .select(MEMORY_SELECT)
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

export async function PATCH(request: Request, context: unknown) {
  return PUT(request, context);
}

export async function DELETE(
  request: Request,
  context: unknown,
) {
  const req = request as unknown as NextRequest;
  const params = (context as { params?: unknown }).params as unknown;
  const id =
    params && typeof (params as { then?: unknown }).then === "function"
      ? (await params as { id?: string }).id
      : (params as { id?: string } | undefined)?.id;
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

