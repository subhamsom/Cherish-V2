import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const MEMORY_LIST_SELECT =
  "id, title, content, type, tags, liked, pinned, audio_url, image_url, memory_date, created_at";

export async function GET(req: NextRequest) {
  const res = NextResponse.json({});
  const supabaseAuth = createServerSupabaseClient(req, res);
  const {
    data: { user },
    error: userError,
  } = await supabaseAuth.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const partner = await supabaseAuth
    .from("partners")
    .select("id, user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (partner.error) {
    return NextResponse.json({ error: "Could not find partner" }, { status: 500 });
  }

  const partnerId = partner.data?.id;
  if (!partnerId) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  const { data, error } = await supabaseAuth
    .from("memories")
    .select(MEMORY_LIST_SELECT)
    .eq("partner_id", partnerId)
    .order("memory_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Could not load memories", details: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: data ?? [] }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, details, type, tags, audio_url, image_url, memory_date } = body as {
    title: string;
    details?: string | null;
    type: "text" | "voice" | "photo" | "gift" | "occasion";
    tags?: string[] | null;
    audio_url?: string | null;
    image_url?: string | null;
    memory_date?: string;
  };

  const res = NextResponse.json({});

  // Read the authenticated user from session cookies.
  const supabaseAuth = createServerSupabaseClient(req, res);
  const {
    data: { user },
    error: userError,
  } = await supabaseAuth.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trimmedTitle = title?.trim();
  const trimmedDetails = typeof details === "string" ? details.trim() : null;

  if (!trimmedTitle) {
    return NextResponse.json({ error: "Memory title is required" }, { status: 400 });
  }

  if (!type) {
    return NextResponse.json({ error: "Memory type is required" }, { status: 400 });
  }

  let resolvedMemoryDate: string | undefined;
  if (memory_date !== undefined && memory_date !== null && String(memory_date).trim() !== "") {
    const md = String(memory_date).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(md)) {
      return NextResponse.json({ error: "Invalid memory_date (use YYYY-MM-DD)" }, { status: 400 });
    }
    resolvedMemoryDate = md;
  }

  // Fetch the user's partner first (required by FK constraints).
  const partner = await supabaseAuth
    .from("partners")
    .select("id, user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (partner.error) {
    return NextResponse.json(
      { error: "Could not find partner", details: partner.error.message },
      { status: 500 },
    );
  }

  const partnerId = partner.data?.id;
  if (!partnerId) {
    return NextResponse.json(
      { error: "Partner not found" },
      { status: 404 },
    );
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const insert = await supabaseAdmin
    .from("memories")
    .insert({
      user_id: user.id,
      partner_id: partnerId,
      type,
      title: trimmedTitle,
      // `content` is NOT NULL + has a length constraint; details are optional.
      // If details are missing, fall back to title so the insert succeeds.
      content: trimmedDetails ?? null,
      tags: tags ?? null,
      audio_url: audio_url ?? null,
      image_url: image_url ?? null,
      ...(resolvedMemoryDate ? { memory_date: resolvedMemoryDate } : {}),
    })
    .select(
      "id, user_id, partner_id, type, title, content, tags, audio_url, image_url, memory_date, created_at",
    )
    .maybeSingle();

  if (insert.error) {
    return NextResponse.json(
      { error: "Could not save memory", details: insert.error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ memory: insert.data }, { status: 201 });
}

