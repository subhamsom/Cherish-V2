"use client";

import Link from "next/link";
import { Lora } from "next/font/google";
import { useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { useScrollChromeHidden } from "@/components/ScrollChromeProvider";

const cherishWordmark = Lora({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400"],
});

export default function MobileTopBar() {
  const chromeHidden = useScrollChromeHidden();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [initial, setInitial] = useState("?");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user) return;
      const meta = (user.user_metadata as Record<string, unknown> | null) ?? null;
      const fullName =
        (meta?.full_name as string | undefined) ?? (meta?.name as string | undefined);
      const label = (fullName ?? user.email ?? "?").trim();
      setInitial(label.charAt(0).toUpperCase() || "?");
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  return (
    <header
      className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-3 md:hidden"
      style={{
        transform: chromeHidden ? "translateY(-100%)" : "translateY(0)",
        transition: "transform 200ms ease",
      }}
    >
      <Link
        href="/account"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-sm font-medium text-[var(--foreground)]"
        aria-label="Account"
      >
        {initial}
      </Link>
      <span
        className={`${cherishWordmark.className} text-sm text-[var(--muted-foreground)]`}
      >
        Cherish
      </span>
      <span className="h-8 w-8 shrink-0" aria-hidden />
    </header>
  );
}
