import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

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

  const { data, error } = await supabaseAuth
    .from("partners")
    .select("id, user_id, name, photo_url, relationship_start_date, bio, pronoun, ai_cards, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Could not load partner", details: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ partner: data }, { status: 200 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { name, photo_url, relationship_start_date, bio, pronoun } = body as {
    name?: string;
    photo_url?: string | null;
    relationship_start_date?: string | null;
    bio?: string | null;
    pronoun?: string | null;
  };

  const res = NextResponse.json({});
  const supabaseAuth = createServerSupabaseClient(req, res);
  const {
    data: { user },
    error: userError,
  } = await supabaseAuth.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trimmedName = name?.trim();
  if (!trimmedName) {
    return NextResponse.json({ error: "Partner name is required" }, { status: 400 });
  }

  const supabaseAdmin = createServiceRoleClient();

  let resolvedPhotoUrl: string | null | undefined = photo_url;
  if (resolvedPhotoUrl === undefined) {
    const existing = await supabaseAdmin
      .from("partners")
      .select("photo_url")
      .eq("user_id", user.id)
      .maybeSingle();
    resolvedPhotoUrl = existing.data?.photo_url ?? null;
  } else {
    resolvedPhotoUrl = resolvedPhotoUrl ?? null;
  }

  const upsertPartner = await supabaseAdmin
    .from("partners")
    .upsert(
      {
        user_id: user.id,
        name: trimmedName,
        photo_url: resolvedPhotoUrl,
        relationship_start_date: relationship_start_date ?? null,
        bio: bio ?? null,
        pronoun: pronoun ?? null,
      },
      { onConflict: "user_id" },
    )
    .select("id, user_id, name, photo_url, relationship_start_date, bio, pronoun, updated_at")
    .maybeSingle();

  if (upsertPartner.error) {
    return NextResponse.json(
      { error: "Could not update partner", details: upsertPartner.error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ partner: upsertPartner.data }, { status: 200 });
}

export async function PATCH(req: NextRequest) {
  return PUT(req);
}

