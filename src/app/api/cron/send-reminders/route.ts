import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { buildReminderEmail, type ReminderEmailItem } from "@/lib/reminderEmail";

const LOG_PREFIX = "[cron/send-reminders]";

type DueReminder = {
  id: string;
  user_id: string;
  title: string;
  date: string;
  note: string | null;
};

function toFirstName(name: string): string {
  const word = name.trim().split(" ")[0] || name.trim() || "there";
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error(`${LOG_PREFIX} CRON_SECRET is not set`);
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const todayKey = new Date().toISOString().slice(0, 10);
    console.log(`${LOG_PREFIX} Running for date: ${todayKey}`);

    const { data: reminders, error: remindersError } = await supabase
      .from("reminders")
      .select("id, user_id, title, date, note")
      .eq("date", todayKey)
      .not("completed", "eq", true)
      .is("notified_at", null);

    if (remindersError) {
      throw new Error(remindersError.message);
    }

    const dueReminders = (reminders ?? []) as DueReminder[];
    console.log(`${LOG_PREFIX} Found ${dueReminders.length} due reminders`);

    if (dueReminders.length === 0) {
      return NextResponse.json({ sent: 0, message: "No reminders due today" }, { status: 200 });
    }

    const groupedByUser: Record<string, DueReminder[]> = {};
    for (const reminder of dueReminders) {
      if (!groupedByUser[reminder.user_id]) {
        groupedByUser[reminder.user_id] = [];
      }
      groupedByUser[reminder.user_id].push(reminder);
    }

    console.log(`${LOG_PREFIX} Grouped reminders for ${Object.keys(groupedByUser).length} users`);

    let emailsSent = 0;
    const notifiedIds: string[] = [];

    for (const [userId, userReminders] of Object.entries(groupedByUser)) {
      console.log(`${LOG_PREFIX} Processing user ${userId} with ${userReminders.length} reminders`);

      const { data: user, error: userError } = await supabase
        .from("users")
        .select("email, name")
        .eq("id", userId)
        .maybeSingle();

      if (userError) {
        console.error(`${LOG_PREFIX} Failed to fetch user ${userId}:`, userError.message);
        continue;
      }

      if (!user?.email) {
        console.error(`${LOG_PREFIX} No email for user ${userId}, skipping`);
        continue;
      }

      const firstName = toFirstName(user.name ?? "");
      const emailItems: ReminderEmailItem[] = userReminders.map((reminder) => ({
        title: reminder.title,
        date: reminder.date,
        note: reminder.note,
      }));

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Cherish <onboarding@resend.dev>",
          to: [user.email],
          subject: "Don't let this one slip.",
          html: buildReminderEmail(firstName, emailItems),
        }),
      });

      if (!resendResponse.ok) {
        const resendBody = await resendResponse.text().catch(() => "");
        console.error(
          `${LOG_PREFIX} Resend failed for user ${userId} (${user.email}):`,
          resendResponse.status,
          resendBody,
        );
        continue;
      }

      console.log(`${LOG_PREFIX} Email sent successfully to ${user.email}`);
      emailsSent += 1;
      notifiedIds.push(...userReminders.map((reminder) => reminder.id));
    }

    if (notifiedIds.length > 0) {
      const { error: updateError } = await supabase
        .from("reminders")
        .update({ notified_at: new Date().toISOString() })
        .in("id", notifiedIds);

      if (updateError) {
        throw new Error(updateError.message);
      }

      console.log(`${LOG_PREFIX} Marked ${notifiedIds.length} reminders as notified`);
    }

    console.log(
      `${LOG_PREFIX} Complete: ${emailsSent} emails sent, ${dueReminders.length} reminders processed`,
    );

    return NextResponse.json(
      { sent: emailsSent, reminders: dueReminders.length },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(LOG_PREFIX, error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
