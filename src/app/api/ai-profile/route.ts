import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const res = NextResponse.json({});
  const supabase = createServerSupabaseClient(req, res);

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: partner, error: partnerError } = await supabase
    .from("partners")
    .select("id, name, pronoun, ai_cards, ai_generated_at, ai_memory_count")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (partnerError) {
    return NextResponse.json(
      { error: "Could not load partner", details: partnerError.message },
      { status: 500 },
    );
  }

  if (!partner) {
    return NextResponse.json({ error: "No partner found" }, { status: 404 });
  }

  const { data: memories, error: memoriesError } = await supabase
    .from("memories")
    .select("title, content, memory_date")
    .eq("user_id", session.user.id)
    .order("memory_date", { ascending: true });

  if (memoriesError) {
    return NextResponse.json(
      { error: "Could not load memories", details: memoriesError.message },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { partner, memoryCount: memories?.length ?? 0 },
    { status: 200 },
  );
}
