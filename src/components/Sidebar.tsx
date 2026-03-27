"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, User } from "lucide-react";

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
    href: "/profile",
    label: "Profile",
    Icon: User,
    matches: (pathname) => pathname.startsWith("/profile"),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black md:block">
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
    </aside>
  );
}

