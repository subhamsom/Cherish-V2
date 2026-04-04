"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

type NavItem = {
  href: string;
  label: string;
  Icon: typeof Home;
  matches: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/home",
    label: "Home",
    Icon: Home,
    matches: (pathname) => pathname.startsWith("/home") || pathname.startsWith("/memories"),
  },
  {
    href: "/reminders",
    label: "Reminders",
    Icon: Bell,
    matches: (pathname) => pathname.startsWith("/reminders"),
  },
  {
    href: "/partner",
    label: "Partner",
    Icon: User,
    matches: (pathname) => pathname.startsWith("/partner") || pathname.startsWith("/profile"),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [displayName, setDisplayName] = useState("You");

  useEffect(() => {
    let cancelled = false;
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user) return;
      const meta = (user.user_metadata as Record<string, unknown> | null) ?? null;
      const fullName = (meta?.full_name as string | undefined) ?? (meta?.name as string | undefined);
      setDisplayName(fullName ?? user.email ?? "You");
    }
    void loadUser();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const initial = displayName.trim().charAt(0).toUpperCase() || "Y";

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black md:block">
      <div className="flex h-full flex-col">
        <div className="px-6 py-6">
          <p className="text-xl font-semibold tracking-tight">Cherish</p>
        </div>
        <nav className="px-3">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = item.matches(pathname);
              const Icon = item.Icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={[
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900",
                    ].join(" ")}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto border-t border-zinc-200 p-3 dark:border-zinc-800">
          <Link
            href="/account"
            className="flex items-center justify-center rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            aria-label="Account"
            title={displayName}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-sm font-medium dark:bg-zinc-800">
              {initial}
            </span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
