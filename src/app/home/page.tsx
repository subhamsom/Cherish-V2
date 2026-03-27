import { redirect } from "next/navigation";
import Link from "next/link";
import { Settings } from "lucide-react";
import { createServerComponentSupabaseClient } from "@/lib/supabase-server";
import MemoryListClient from "./MemoryListClient";

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

  console.time("[home] fetchPartner");
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

    if (error) {
      throw error;
    }
    partner = data;
  } catch (error) {
    console.timeEnd("[home] fetchPartner");
    console.error("[home] fetchPartner failed:", error);
    return (
      <main>
        <h1>Cherish</h1>
        <p>Could not load partner right now. Please refresh.</p>
      </main>
    );
  }
  console.timeEnd("[home] fetchPartner");

  if (!partner) {
    redirect("/onboarding");
  }

  console.time("[home] fetchMemories");
  let memories:
    | Array<{
        id: string;
        title: string | null;
        content: string;
        type: string;
        tags: string[] | null;
        liked: boolean | null;
        pinned: boolean | null;
        created_at: string | null;
      }>
    | null = null;
  try {
    const memoryResult = await withTimeout(
      supabase
        .from("memories")
        .select("id, title, content, type, tags, liked, pinned, created_at")
        .eq("partner_id", partner.id)
        .order("created_at", { ascending: false })
        .limit(20),
      "fetchMemories",
    );
    const { data, error } = memoryResult as {
      data: Array<{
        id: string;
        title: string | null;
        content: string;
        type: string;
        tags: string[] | null;
        liked: boolean | null;
        pinned: boolean | null;
        created_at: string | null;
      }> | null;
      error: unknown;
    };

    if (error) {
      throw error;
    }
    memories = data;
  } catch (error) {
    console.timeEnd("[home] fetchMemories");
    console.error("[home] fetchMemories failed:", error);
    return (
      <main className="p-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Could not load memories right now. Please refresh.</p>
      </main>
    );
  }
  console.timeEnd("[home] fetchMemories");

  return (
    <main className="p-4">
      <header className="mb-3 flex items-center justify-end md:hidden">
        <Link
          href="/settings"
          className="inline-flex rounded-lg border border-zinc-200 p-2 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
          aria-label="Settings"
        >
          <Settings size={16} />
        </Link>
      </header>
      <MemoryListClient initialMemories={memories ?? []} />
    </main>
  );
}

