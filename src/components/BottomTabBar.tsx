"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, Settings, User } from "lucide-react";

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
  {
    href: "/settings",
    label: "Settings",
    Icon: Settings,
    matches: (pathname) => pathname.startsWith("/settings"),
  },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-black/95 md:hidden">
      <ul className="mx-auto flex max-w-xl items-center justify-around px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        {NAV_ITEMS.map((item) => {
          const active = item.matches(pathname);
          const Icon = item.Icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={[
                  "mx-1 flex flex-col items-center justify-center rounded-xl px-2 py-2 text-xs transition-colors",
                  active
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900",
                ].join(" ")}
              >
                <Icon size={18} />
                <span className="mt-1">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

