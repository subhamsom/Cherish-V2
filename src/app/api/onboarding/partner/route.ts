import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, photo_url } = body as {
    name: string;
    photo_url?: string | null;
  };

  const res = NextResponse.json({});

  // Read the authenticated user from the session cookies.
  const supabaseAuth = createServerSupabaseClient(req, res);
  const {
    data: { user },
    error: userError,
  } = await supabaseAuth.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  if (!user.email) {
    return NextResponse.json(
      { error: "Missing user email" },
      { status: 500 },
    );
  }

  if (!name || !name.trim()) {
    return NextResponse.json(
      { error: "Partner name is required" },
      { status: 400 },
    );
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const userMetadata = user.user_metadata as Record<string, unknown> | null;
  const userName = (userMetadata?.name as string | undefined) ?? null;
  const userFullName = (userMetadata?.full_name as string | undefined) ?? null;
  const avatarUrl = (userMetadata?.avatar_url as string | undefined) ?? null;

  // Ensure the FK target exists: `partners.user_id` -> `users.id`.
  const upsertUser = await supabaseAdmin
    .from("users")
    .upsert(
      {
        id: user.id,
        email: user.email,
        name: userName ?? userFullName,
        avatar_url: avatarUrl,
      },
      { onConflict: "id" },
    )
    .select("id")
    .single();

  if (upsertUser.error) {
    return NextResponse.json(
      { error: "Could not save user", details: upsertUser.error.message },
      { status: 500 },
    );
  }

  const upsertPartner = await supabaseAdmin
    .from("partners")
    .upsert(
      {
        user_id: user.id,
        name: name.trim(),
        photo_url: photo_url ?? null,
      },
      { onConflict: "user_id" },
    )
    .select("id, user_id, name, photo_url")
    .single();

  if (upsertPartner.error) {
    return NextResponse.json(
      { error: "Could not save partner", details: upsertPartner.error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ partner: upsertPartner.data });
}

