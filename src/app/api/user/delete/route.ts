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

export async function POST(req: NextRequest) {
  const res = NextResponse.json({});
  const supabaseAuth = createServerSupabaseClient(req, res);
  const {
    data: { user },
    error: userError,
  } = await supabaseAuth.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = createServiceRoleClient();

  const deletedPublicUser = await supabaseAdmin
    .from("users")
    .delete()
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (deletedPublicUser.error) {
    return NextResponse.json(
      { error: "Could not delete user data", details: deletedPublicUser.error.message },
      { status: 500 },
    );
  }

  const deleteAuthUser = await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (deleteAuthUser.error) {
    return NextResponse.json(
      { error: "Could not delete auth account", details: deleteAuthUser.error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

