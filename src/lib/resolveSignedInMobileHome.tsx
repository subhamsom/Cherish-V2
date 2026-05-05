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
  | { kind: "ready"; partnerName: string }
  | { kind: "no_partner" };

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

  const partner = await withTimeout(
    supabase
      .from("partners")
      .select("id, name")
      .eq("user_id", user.id)
      .maybeSingle(),
    "fetchPartner",
  );

  if (partner.error || !partner.data) {
    return { kind: "no_partner" };
  }

  return { kind: "ready", partnerName: partner.data.name };
}
