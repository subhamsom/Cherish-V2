import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import MobileHomeMock from "@/components/MobileHomeMock";
import { mapDbMemoriesToMobileHomeFeed, weeklyActivityStats } from "@/lib/mobileHomeFeedFromDb";
import { localDateToIso } from "@/lib/formatDate";
import { loadPartnerMemoriesForUser } from "@/lib/loadPartnerMemories";
import { createServerComponentSupabaseClient } from "@/lib/supabase-server";

const QUERY_TIMEOUT_MS = 8000;

async function withTimeout<T>(
  promiseLike: PromiseLike<T>,
  label: string,
): Promise<T> {
  return await Promise.race([
    Promise.resolve(promiseLike),
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${label} timed out after ${QUERY_TIMEOUT_MS}ms`));
      }, QUERY_TIMEOUT_MS);
    }),
  ]);
}

export type SignedInMobileHomeResult =
  | { kind: "anonymous" }
  | { kind: "content"; node: ReactNode };

export type MobileHomeUpcomingReminder = {
  id: string;
  title: string;
  note: string | null;
  date: string;
  reminder_time: string | null;
  completed: boolean | null;
};

/**
 * Shared feed for `/` (when signed in) and `/home`.
 * Returns `anonymous` when there is no session — callers choose landing vs redirect.
 */
export async function resolveSignedInMobileHome(): Promise<SignedInMobileHomeResult> {
  const supabase = await createServerComponentSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await withTimeout(supabase.auth.getUser(), "getUser");

  if (userError) {
    console.error("[home] getUser error:", userError);
    return { kind: "anonymous" };
  }

  if (!user) {
    return { kind: "anonymous" };
  }

  const loaded = await loadPartnerMemoriesForUser(supabase, user.id);

  if (!loaded.ok) {
    if (loaded.reason === "no_partner") {
      redirect("/onboarding");
    }
    if (loaded.reason === "partner_fetch") {
      console.error("[home] fetchPartner failed");
      return {
        kind: "content",
        node: (
          <main className="flex min-h-dvh items-center justify-center p-4">
            <p className="max-w-sm text-center text-sm text-zinc-600">
              Could not load partner right now. Please refresh.
            </p>
          </main>
        ),
      };
    }
    console.error("[home] fetchMemories failed");
    return {
      kind: "content",
      node: (
        <main className="flex min-h-dvh items-center justify-center p-4">
          <p className="max-w-sm text-center text-sm text-zinc-600">
            Could not load memories right now. Please refresh.
          </p>
        </main>
      ),
    };
  }

  const feed = mapDbMemoriesToMobileHomeFeed(loaded.rows);
  const stats = weeklyActivityStats(loaded.rows);
  const today = new Date();
  const startIso = localDateToIso(
    new Date(today.getFullYear(), today.getMonth(), today.getDate()),
  );
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  end.setDate(end.getDate() + 7);
  const endIso = localDateToIso(end);

  const { data: upcomingRemindersData, error: upcomingReminderError } = await withTimeout(
    supabase
      .from("reminders")
      .select("id, title, note, date, reminder_time, completed")
      .eq("user_id", user.id)
      .eq("partner_id", loaded.partner.id)
      .eq("completed", false)
      .gte("date", startIso)
      .lte("date", endIso)
      .order("date", { ascending: true }),
    "fetchUpcomingReminders",
  );

  if (upcomingReminderError) {
    console.error("[home] fetchUpcomingReminders failed:", upcomingReminderError);
  }

  const upcomingReminders: MobileHomeUpcomingReminder[] = (upcomingRemindersData ??
    []) as MobileHomeUpcomingReminder[];

  return {
    kind: "content",
    node: (
      <MobileHomeMock
        memoriesFromDb={feed}
        upcomingReminders={upcomingReminders}
        totalMemoryCount={loaded.rows.length}
        partnerName={loaded.partner.name}
        weeklyStats={stats}
        appNavigation
      />
    ),
  };
}
