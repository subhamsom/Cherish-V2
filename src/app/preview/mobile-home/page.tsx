import { redirect } from "next/navigation";
import MobileHomeMock from "@/components/MobileHomeMock";
import {
  greetingFirstNameFromUser,
  mapDbMemoriesToMobileHomeFeed,
  weeklyActivityStats,
  type MobileHomeDbMemory,
} from "@/lib/mobileHomeFeedFromDb";
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

export default async function PreviewMobileHomePage() {
  const supabase = await createServerComponentSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await withTimeout(supabase.auth.getUser(), "getUser");

  if (userError || !user) {
    return <MobileHomeMock />;
  }

  let partner: { id: string; name: string } | null = null;
  try {
    const partnerResult = await withTimeout(
      supabase
        .from("partners")
        .select("id, name")
        .eq("user_id", user.id)
        .maybeSingle(),
      "fetchPartner",
    );
    const { data, error } = partnerResult as {
      data: { id: string; name: string } | null;
      error: unknown;
    };
    if (error) throw error;
    partner = data;
  } catch {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-zinc-100 p-4">
        <p className="max-w-sm text-center text-sm text-zinc-600">
          Could not load partner for this preview. Try again from Home after
          onboarding.
        </p>
      </main>
    );
  }

  if (!partner) {
    redirect("/onboarding");
  }

  let rows: MobileHomeDbMemory[] = [];
  try {
    const memoryResult = await withTimeout(
      supabase
        .from("memories")
        .select(
          "id, title, content, type, tags, liked, pinned, audio_url, image_url, memory_date, created_at",
        )
        .eq("partner_id", partner.id)
        .order("memory_date", { ascending: false })
        .order("created_at", { ascending: false }),
      "fetchMemories",
    );
    const { data, error } = memoryResult as {
      data: MobileHomeDbMemory[] | null;
      error: unknown;
    };
    if (error) throw error;
    rows = data ?? [];
  } catch {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-zinc-100 p-4">
        <p className="max-w-sm text-center text-sm text-zinc-600">
          Could not load memories for this preview. Please refresh.
        </p>
      </main>
    );
  }

  const feed = mapDbMemoriesToMobileHomeFeed(rows);
  const stats = weeklyActivityStats(rows);
  const greetingName = greetingFirstNameFromUser(user);

  return (
    <MobileHomeMock
      memoriesFromDb={feed}
      greetingName={greetingName}
      weeklyStats={stats}
      liveDataBanner
    />
  );
}
