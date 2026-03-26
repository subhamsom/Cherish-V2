import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, details, type, tags } = body as {
    title: string;
    details?: string | null;
    type: "text" | "voice" | "photo" | "gift" | "occasion";
    tags?: string[] | null;
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
      content: trimmedDetails || trimmedTitle,
      tags: tags ?? null,
    })
    .select("id, user_id, partner_id, type, title, content, tags, created_at")
    .maybeSingle();

  if (insert.error) {
    return NextResponse.json(
      { error: "Could not save memory", details: insert.error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ memory: insert.data }, { status: 201 });
}

