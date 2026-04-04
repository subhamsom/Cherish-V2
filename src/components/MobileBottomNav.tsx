"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, User } from "lucide-react";
import { useScrollChromeHidden } from "@/components/ScrollChromeProvider";
import { useRemindersDue } from "@/components/RemindersDueBadgeBridge";

const ITEMS = [
  {
    href: "/home",
    label: "Home",
    Icon: Home,
    match: (p: string) => p.startsWith("/home") || p.startsWith("/memories"),
  },
  {
    href: "/reminders",
    label: "Reminders",
    Icon: Bell,
    match: (p: string) => p.startsWith("/reminders"),
  },
  {
    href: "/partner",
    label: "Partner",
    Icon: User,
    match: (p: string) => p.startsWith("/partner") || p.startsWith("/profile"),
  },
] as const;

export default function MobileBottomNav() {
  const pathname = usePathname();
  const chromeHidden = useScrollChromeHidden();
  const { hasDueIncompleteReminders } = useRemindersDue();

  const showReminderDot =
    hasDueIncompleteReminders && !pathname.startsWith("/reminders");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        transform: chromeHidden ? "translateY(100%)" : "translateY(0)",
        transition: "transform 200ms ease",
      }}
      aria-label="Primary"
    >
      <ul className="flex w-full items-stretch justify-evenly pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href} className="flex flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="flex flex-1 flex-col items-center gap-1 py-3"
              >
                <span className="relative inline-flex">
                  <Icon
                    aria-hidden
                    className={
                      active
                        ? "text-[var(--foreground)]"
                        : "text-[var(--muted-foreground)]"
                    }
                    size={22}
                  />
                  {href === "/reminders" && showReminderDot ? (
                    <span
                      className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-600"
                      aria-hidden
                    />
                  ) : null}
                </span>
                <span
                  className={
                    active
                      ? "text-xs font-medium text-[var(--foreground)]"
                      : "text-xs text-[var(--muted-foreground)]"
                  }
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
