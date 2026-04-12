import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow the OAuth callback to complete sign-in.
  if (pathname === "/auth/callback") return NextResponse.next();

  // Allow Next.js internals/static assets.
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt"
  ) {
    return NextResponse.next();
  }

  const supabaseResponse = NextResponse.next({ request: req });
  const cookiesToSet: Array<{
    name: string;
    value: string;
    options: Record<string, unknown>;
  }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(nextCookiesToSet) {
          nextCookiesToSet.forEach(({ name, value, options }) => {
            cookiesToSet.push({
              name,
              value,
              options: (options ?? {}) as Record<string, unknown>,
            });
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Landing + static UI previews are public; everything else requires auth.
    if (pathname === "/" || pathname.startsWith("/preview/")) {
      return NextResponse.next();
    }

    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Authenticated users: redirect based on whether a partner exists.
  if (pathname === "/" || pathname === "/home" || pathname === "/onboarding") {
    const {
      data: partner,
      error: partnerError,
    } = await supabase
      .from("partners")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (partnerError) {
      console.error("Middleware partner check failed", partnerError);
    }

    let redirectPath: string | null = null;

    if (pathname === "/") {
      redirectPath = partner ? "/home" : "/onboarding";
    } else if (pathname === "/home" && !partner) {
      redirectPath = "/onboarding";
    } else if (pathname === "/onboarding" && partner) {
      redirectPath = "/home";
    }

    if (redirectPath) {
      const redirectUrl = new URL(redirectPath, req.url);
      const redirectResponse = NextResponse.redirect(redirectUrl);

      // Preserve refreshed cookies on redirect response.
      cookiesToSet.forEach(({ name, value, options }) => {
        redirectResponse.cookies.set(
          name,
          value,
          options as Parameters<typeof redirectResponse.cookies.set>[2],
        );
      });

      return redirectResponse;
    }
  }

  // Keep the refreshed cookies.
  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};

