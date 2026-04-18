import { redirect } from "next/navigation";
import MobileHomeMock from "@/components/MobileHomeMock";
import {
  greetingFirstNameFromUser,
  mapDbMemoriesToMobileHomeFeed,
  weeklyActivityStats,
} from "@/lib/mobileHomeFeedFromDb";
import { loadPartnerMemoriesForUser } from "@/lib/loadPartnerMemories";
import { createServerComponentSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

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

export default async function HomePage() {
  const supabase = await createServerComponentSupabaseClient();

  console.time("[home] getUser");
  const {
    data: { user },
    error: userError,
  } = await withTimeout(supabase.auth.getUser(), "getUser");
  console.timeEnd("[home] getUser");

  if (userError) {
    console.error("[home] getUser error:", userError);
    redirect("/");
  }

  if (!user) {
    redirect("/");
  }

  const loaded = await loadPartnerMemoriesForUser(supabase, user.id);

  if (!loaded.ok) {
    if (loaded.reason === "no_partner") {
      redirect("/onboarding");
    }
    if (loaded.reason === "partner_fetch") {
      console.error("[home] fetchPartner failed");
      return (
        <main className="flex min-h-dvh items-center justify-center p-4">
          <p className="max-w-sm text-center text-sm text-zinc-600">
            Could not load partner right now. Please refresh.
          </p>
        </main>
      );
    }
    console.error("[home] fetchMemories failed");
    return (
      <main className="flex min-h-dvh items-center justify-center p-4">
        <p className="max-w-sm text-center text-sm text-zinc-600">
          Could not load memories right now. Please refresh.
        </p>
      </main>
    );
  }

  const feed = mapDbMemoriesToMobileHomeFeed(loaded.rows);
  const stats = weeklyActivityStats(loaded.rows);
  const greetingName = greetingFirstNameFromUser(user);

  return (
    <MobileHomeMock
      memoriesFromDb={feed}
      greetingName={greetingName}
      weeklyStats={stats}
      appNavigation
    />
  );
}
