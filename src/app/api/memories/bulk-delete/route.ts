import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { ids } = body as { ids: string[] };

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No memory ids provided" }, { status: 400 });
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

  const partner = await supabaseAuth
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const partnerId = partner.data?.id;
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
    .eq("partner_id", partnerId)
    .in("id", ids)
    .select("id");

  const deletedIds: string[] =
    deleted.data?.map((d) => d.id) ?? [];

  if (deleted.error) {
    return NextResponse.json(
      { error: "Could not delete memories", details: deleted.error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ deletedIds }, { status: 200 });
}

