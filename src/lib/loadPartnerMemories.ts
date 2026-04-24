import type { SupabaseClient } from "@supabase/supabase-js";
import type { MobileHomeDbMemory } from "@/lib/mobileHomeFeedFromDb";

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

export type LoadPartnerMemoriesResult =
  | { ok: true; partner: { id: string; name: string }; rows: MobileHomeDbMemory[] }
  | {
      ok: false;
      reason: "partner_fetch" | "no_partner" | "memories_fetch";
    };

/**
 * Loads the signed-in user's partner row and that partner's memories (same query as legacy Home).
 */
export async function loadPartnerMemoriesForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<LoadPartnerMemoriesResult> {
  let partner: { id: string; name: string } | null = null;
  try {
    const partnerResult = await withTimeout(
      supabase
        .from("partners")
        .select("id, name")
        .eq("user_id", userId)
        .maybeSingle(),
      "fetchPartner",
    );
    const { data, error: partnerError } = partnerResult as {
      data: { id: string; name: string } | null;
      error: unknown;
    };

    if (partnerError) {
      return { ok: false, reason: "partner_fetch" };
    }
    partner = data;
  } catch {
    return { ok: false, reason: "partner_fetch" };
  }

  if (!partner) {
    return { ok: false, reason: "no_partner" };
  }

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
    const { data, error: memError } = memoryResult as {
      data: MobileHomeDbMemory[] | null;
      error: unknown;
    };

    if (memError) {
      return { ok: false, reason: "memories_fetch" };
    }

    return { ok: true, partner, rows: data ?? [] };
  } catch {
    return { ok: false, reason: "memories_fetch" };
  }
}
