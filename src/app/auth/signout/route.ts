import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/", req.url));
  const supabase = createServerSupabaseClient(req, res);

  await supabase.auth.signOut();
  return res;
}

