import Link from "next/link";
import { redirect } from "next/navigation";
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
        content: string;
        type: string;
        created_at: string | null;
      }>
    | null = null;
  try {
    const memoryResult = await withTimeout(
      supabase
        .from("memories")
        .select("id, content, type, created_at")
        .eq("partner_id", partner.id)
        .order("created_at", { ascending: false })
        .limit(20),
      "fetchMemories",
    );
    const { data, error } = memoryResult as {
      data: Array<{
        id: string;
        content: string;
        type: string;
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
      <main>
        <header>
          <h1>Cherish</h1>
          <p>Partner: {partner.name}</p>
        </header>
        <p>Could not load memories right now. Please refresh.</p>
      </main>
    );
  }
  console.timeEnd("[home] fetchMemories");

  return (
    <main>
      <header>
        <h1>Cherish</h1>
        <p>Partner: {partner.name}</p>
        <form action="/auth/signout" method="post">
          <button type="submit">Sign out</button>
        </form>
      </header>

      <section>
        <Link href="/memories/new">Add Memory</Link>
      </section>

      <section>
        <h2>Recent Memories</h2>
        {!memories || memories.length === 0 ? (
          <p>No memories yet. Add your first one.</p>
        ) : (
          <ul>
            {memories.map((memory) => (
              <li key={memory.id}>
                <p>{memory.content}</p>
                <p>Type: {memory.type}</p>
                <p>
                  Created:{" "}
                  {memory.created_at
                    ? new Date(memory.created_at).toLocaleString()
                    : "-"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

