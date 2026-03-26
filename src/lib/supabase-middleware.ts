import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.",
    );
  }

  return { url, anonKey };
}

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

/**
 * Supabase session middleware helper for Next.js App Router.
 *
 * This follows the `@supabase/ssr` "updateSession" pattern:
 * - create the client
 * - call `supabase.auth.getUser()` immediately (refresh/validate)
 * - ensure refreshed cookies flow back via the returned response
 */
export async function updateSession(req: NextRequest): Promise<{
  supabase: SupabaseClient;
  user: { id: string } | null;
  supabaseResponse: NextResponse;
  cookiesToSet: CookieToSet[];
}> {
  const { url, anonKey } = getSupabaseConfig();

  let supabaseResponse = NextResponse.next({ request: req });
  let cookiesToSetAll: CookieToSet[] = [];

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSetAll = cookiesToSet as CookieToSet[];

        // Update the incoming request cookies so subsequent code sees the
        // refreshed session during this same middleware run.
        cookiesToSet.forEach(({ name, value }) => {
          req.cookies.set(name, value);
        });

        // Return the refreshed cookies to the browser.
        supabaseResponse = NextResponse.next({ request: req });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    supabase,
    user: user ? { id: user.id } : null,
    supabaseResponse,
    cookiesToSet: cookiesToSetAll,
  };
}

