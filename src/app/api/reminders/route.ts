import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

type ReminderRecurrence = "none" | "daily" | "weekly" | "monthly" | "yearly";

function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

async function getPartnerIdOrThrow(
  supabaseAuth: ReturnType<typeof createServerSupabaseClient>,
  userId: string,
) {
  const partner = await supabaseAuth
    .from("partners")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (partner.error || !partner.data?.id) return null;
  return partner.data.id;
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

  const partnerId = await getPartnerIdOrThrow(supabaseAuth, user.id);
  if (!partnerId) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  const supabaseAdmin = createServiceRoleClient();
  const reminders = await supabaseAdmin
    .from("reminders")
    .select(
      "id, user_id, partner_id, title, date, note, tags, recurrence, reminder_time, type, completed, created_at, updated_at",
    )
    .eq("user_id", user.id)
    .eq("partner_id", partnerId)
    .order("date", { ascending: true });

  if (reminders.error) {
    return NextResponse.json(
      { error: "Could not fetch reminders", details: reminders.error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ reminders: reminders.data ?? [] }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("[api/reminders][POST] parsed body", body);
  const {
    title,
    date,
    note,
    tags,
    recurrence,
    partner_id,
    user_id,
    type,
  } = body as {
    title: string;
    date: string;
    note?: string | null;
    tags?: string[] | null;
    recurrence?: ReminderRecurrence | null;
    partner_id?: string | null;
    user_id?: string | null;
    type?: "gift" | "occasion" | null;
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

  const trimmedTitle = title?.trim();
  if (!trimmedTitle) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  const partnerIdFromAuth = await getPartnerIdOrThrow(supabaseAuth, user.id);
  if (!partnerIdFromAuth) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  // Always enforce authenticated ownership even if client passes user_id/partner_id.
  const finalUserId = user.id;
  const finalPartnerId = partner_id ?? partnerIdFromAuth;

  if (finalUserId !== user.id || finalPartnerId !== partnerIdFromAuth || (user_id && user_id !== user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const allowedRecurrence: ReminderRecurrence =
    recurrence === "daily" ||
    recurrence === "weekly" ||
    recurrence === "monthly" ||
    recurrence === "yearly"
      ? recurrence
      : "none";

  const normalizedTags = Array.isArray(tags)
    ? tags
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => tag.toLowerCase())
        .filter((tag, index, arr) => arr.indexOf(tag) === index)
    : [];

  const supabaseAdmin = createServiceRoleClient();
  const insert = await supabaseAdmin
    .from("reminders")
    .insert({
      user_id: finalUserId,
      partner_id: finalPartnerId,
      title: trimmedTitle,
      date,
      note: typeof note === "string" ? note.trim() || null : null,
      tags: normalizedTags,
      recurrence: allowedRecurrence,
      reminder_time: new Date().toISOString(),
      type: type ?? "occasion",
      recurring: allowedRecurrence !== "none",
    })
    .select(
      "id, user_id, partner_id, title, date, note, tags, recurrence, reminder_time, type, completed, created_at, updated_at",
    )
    .maybeSingle();

  if (insert.error) {
    console.log("[api/reminders][POST] supabase insert error", insert.error);
    return NextResponse.json(
      { error: "Could not create reminder", details: insert.error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ reminder: insert.data }, { status: 201 });
}

