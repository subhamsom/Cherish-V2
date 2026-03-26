import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const redirectUrl = new URL("/", req.url);

  const { error } = await supabase.auth.exchangeCodeForSession(req.url);

  if (error) {
    console.error("Supabase OAuth callback error:", error);
  }

  // After exchanging the auth code for a session, send the user back to the app.
  return NextResponse.redirect(redirectUrl);
}

