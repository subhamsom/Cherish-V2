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

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { name, photo_url, relationship_start_date, bio } = body as {
    name?: string;
    photo_url?: string | null;
    relationship_start_date?: string | null;
    bio?: string | null;
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
  const upsertPartner = await supabaseAdmin
    .from("partners")
    .upsert(
      {
        user_id: user.id,
        name: trimmedName,
        photo_url: photo_url ?? null,
        relationship_start_date: relationship_start_date ?? null,
        bio: bio ?? null,
      },
      { onConflict: "user_id" },
    )
    .select("id, user_id, name, photo_url, relationship_start_date, bio, updated_at")
    .maybeSingle();

  if (upsertPartner.error) {
    return NextResponse.json(
      { error: "Could not update partner", details: upsertPartner.error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ partner: upsertPartner.data }, { status: 200 });
}

