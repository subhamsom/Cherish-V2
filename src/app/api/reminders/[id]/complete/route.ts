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

export async function POST(request: Request, context: unknown) {
  const req = request as unknown as NextRequest;
  const id = (context as { params?: { id?: string } }).params?.id;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
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

  const supabaseAdmin = createServiceRoleClient();

  const existing = await supabaseAdmin
    .from("reminders")
    .select("id, completed")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing.error) {
    return NextResponse.json(
      { error: "Could not fetch reminder", details: existing.error.message },
      { status: 500 },
    );
  }

  if (!existing.data) {
    return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
  }

  const nextCompleted = !Boolean(existing.data.completed);
  const updated = await supabaseAdmin
    .from("reminders")
    .update({ completed: nextCompleted })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, completed")
    .maybeSingle();

  if (updated.error) {
    return NextResponse.json(
      { error: "Could not update reminder", details: updated.error.message },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      id,
      completed: Boolean(updated.data?.completed),
    },
    { status: 200 },
  );
}

