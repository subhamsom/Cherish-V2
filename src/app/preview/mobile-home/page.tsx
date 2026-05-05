import { redirect } from "next/navigation";
import MobileHomeMock from "@/components/MobileHomeMock";
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

  const partner = await withTimeout(
    supabase
      .from("partners")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle(),
    "fetchPartner",
  );

  if (partner.error || !partner.data) {
    redirect("/onboarding");
  }

  return <MobileHomeMock appNavigation />;
}
