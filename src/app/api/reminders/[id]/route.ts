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

export async function PUT(request: Request, context: unknown) {
  const req = request as unknown as NextRequest;
  const id = (context as { params?: { id?: string } }).params?.id;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const body = await request.json();
  const {
    title,
    date,
    note,
    tags,
    recurrence,
    reminder_time,
    type,
    completed,
  } = body as {
    title?: string;
    date?: string;
    note?: string | null;
    tags?: string[] | null;
    recurrence?: ReminderRecurrence | null;
    reminder_time?: string | null;
    type?: "gift" | "occasion";
    completed?: boolean;
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

  const updates: Record<string, unknown> = {};

  if (typeof title === "string") {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    }
    updates.title = trimmedTitle;
  }

  if (typeof date === "string") {
    updates.date = date;
  }

  if (typeof note === "string" || note === null) {
    updates.note = typeof note === "string" ? note.trim() || null : null;
  }

  if (Array.isArray(tags) || tags === null) {
    updates.tags = Array.isArray(tags)
      ? tags
          .map((tag) => tag.trim())
          .filter(Boolean)
          .map((tag) => tag.toLowerCase())
          .filter((tag, index, arr) => arr.indexOf(tag) === index)
      : [];
  }

  if (recurrence) {
    updates.recurrence =
      recurrence === "daily" ||
      recurrence === "weekly" ||
      recurrence === "monthly" ||
      recurrence === "yearly"
        ? recurrence
        : "none";
    updates.recurring = updates.recurrence !== "none";
  }

  if (typeof reminder_time === "string") {
    updates.reminder_time = reminder_time;
  }

  if (type) {
    updates.type = type;
  }

  if (typeof completed === "boolean") {
    updates.completed = completed;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const supabaseAdmin = createServiceRoleClient();
  const updated = await supabaseAdmin
    .from("reminders")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(
      "id, user_id, partner_id, title, date, note, tags, recurrence, reminder_time, type, completed, created_at, updated_at",
    )
    .maybeSingle();

  if (updated.error) {
    return NextResponse.json(
      { error: "Could not update reminder", details: updated.error.message },
      { status: 500 },
    );
  }

  if (!updated.data) {
    return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
  }

  return NextResponse.json({ reminder: updated.data }, { status: 200 });
}

export async function DELETE(request: Request, context: unknown) {
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
  const deleted = await supabaseAdmin
    .from("reminders")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (deleted.error) {
    return NextResponse.json(
      { error: "Could not delete reminder", details: deleted.error.message },
      { status: 500 },
    );
  }

  if (!deleted.data) {
    return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

