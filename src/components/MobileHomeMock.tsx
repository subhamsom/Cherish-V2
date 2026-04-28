"use client";

import {
  Bell,
  Home,
  Plus,
  Search,
  User,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MobileHomeFeedMemory } from "@/lib/mobileHomeFeedFromDb";
import { MemoryCard } from "@/components/cherish/cards/MemoryCard";
import { ReminderCard } from "@/components/cherish/cards/ReminderCard";
import { TagPill } from "@/components/cherish/common/TagPill";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import type { MobileHomeUpcomingReminder } from "@/lib/resolveSignedInMobileHome";

const SIGN_URL_TTL_SEC = 60 * 60;

function isAbsoluteHttpUrl(s: string) {
  return /^https?:\/\//i.test(s.trim());
}

const ACCENT = "#FF6B6C";
const HOME_SCROLL_KEY = "cherish:home:scroll-top";

const DEMO_FEED: MobileHomeFeedMemory[] = [
  {
    id: "1",
    kind: "text",
    title: "She remembered the joke from three years ago",
    excerpt:
      "We were in line for coffee and she quoted it word for word. I almost dropped my cup.",
    tags: ["grateful", "funny"],
    dateLabel: "4 Apr 2026",
    imageStoragePath: null,
    audioStoragePath: null,
    likedDefault: true,
  },
  {
    id: "2",
    kind: "voice",
    title: "Late-night porch — no script, just us",
    durationSec: 47,
    tags: ["romantic"],
    dateLabel: "2 Apr 2026",
    imageStoragePath: null,
    audioStoragePath: null,
    likedDefault: false,
  },
  {
    id: "3",
    kind: "photo",
    title: "Sunset walk before the storm rolled in",
    excerpt: "Ten minutes of orange sky. We didn’t check our phones once.",
    tags: ["peaceful", "milestone"],
    dateLabel: "28 Mar 2026",
    imageStoragePath: null,
    audioStoragePath: null,
    likedDefault: false,
  },
  {
    id: "4",
    kind: "gift",
    title: "Handwritten playlist on the kitchen counter",
    excerpt: "Every song had a sticky note. I’m still working through side B.",
    tags: ["happy", "grateful"],
    dateLabel: "15 Mar 2026",
    priceLabel: "$24",
    imageStoragePath: null,
    audioStoragePath: null,
    likedDefault: false,
  },
];

export type MobileHomeMockProps = {
  /**
   * When provided (including an empty array), replaces the built-in demo feed.
   * Map DB rows with `mapDbMemoriesToMobileHomeFeed` on the server.
   */
  memoriesFromDb?: MobileHomeFeedMemory[];
  upcomingReminders?: MobileHomeUpcomingReminder[];
  totalMemoryCount?: number;
  partnerName?: string;
  greetingName?: string;
  weeklyStats?: { total: number; voice: number; photo: number };
  /** Explains that the list is real account data (helps avoid confusing preview with production UI). */
  liveDataBanner?: boolean;
  /** When true, profile, FAB, and bottom tabs navigate to real app routes (use on /home and signed-in preview). */
  appNavigation?: boolean;
};

const profileBtnClass =
  "flex size-11 items-center justify-center rounded-full bg-white text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2";

const fabClass =
  "absolute bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-4 z-30 flex size-14 items-center justify-center rounded-2xl bg-[#FF6B6C] text-white shadow-[0_12px_32px_rgb(255_107_108_/_0.4)] transition-transform hover:-translate-y-0.5 hover:bg-[#E85E5F] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B6C]";

const navInactiveClass =
  "flex flex-1 flex-col items-center gap-1 py-3 text-zinc-400 transition-colors hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2";

export default function MobileHomeMock({
  memoriesFromDb,
  upcomingReminders = [],
  totalMemoryCount,
  partnerName,
  greetingName = "Sam",
  weeklyStats,
  appNavigation = false,
}: MobileHomeMockProps = {}) {
  const router = useRouter();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const feed = memoriesFromDb ?? DEMO_FEED;
  const [activeTag, setActiveTag] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [signedImageUrls, setSignedImageUrls] = useState<Record<string, string>>({});

  const stats =
    weeklyStats ??
    (memoriesFromDb === undefined
      ? { total: 4, voice: 2, photo: 1 }
      : { total: 0, voice: 0, photo: 0 });
  const partnerFirstName = (partnerName ?? greetingName).trim().split(/\s+/)[0] ?? greetingName;

  const topTags = useMemo(() => {
    const freq = new Map<string, number>();
    for (const memory of feed) {
      for (const tag of memory.tags) {
        const cleaned = tag.trim();
        if (!cleaned) continue;
        freq.set(cleaned, (freq.get(cleaned) ?? 0) + 1);
      }
    }
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag]) => tag);
  }, [feed]);

  const tagPills = useMemo(() => ["all", ...topTags], [topTags]);

  const visible = useMemo(() => {
    const byTag =
      activeTag === "all" ? feed : feed.filter((m) => m.tags.includes(activeTag));
    const q = searchQuery.trim().toLowerCase();
    if (!q) return byTag;
    return byTag.filter((m) => {
      if (m.title.toLowerCase().includes(q)) return true;
      if (m.excerpt?.toLowerCase().includes(q)) return true;
      if (m.dateLabel.toLowerCase().includes(q)) return true;
      return m.tags.some((t) => t.toLowerCase().includes(q));
    });
  }, [feed, activeTag, searchQuery]);

  useEffect(() => {
    let cancelled = false;
    const toSign = feed.filter(
      (m) => m.imageStoragePath?.trim() && !isAbsoluteHttpUrl(m.imageStoragePath),
    );
    if (toSign.length === 0) {
      setSignedImageUrls({});
      return;
    }

    const supabase = createBrowserSupabaseClient();
    void Promise.all(
      toSign.map(async (memory) => {
        const ref = memory.imageStoragePath?.trim() ?? "";
        if (!ref) return null;
        const { data, error } = await supabase.storage
          .from("memories")
          .createSignedUrl(ref, SIGN_URL_TTL_SEC);
        if (error || !data?.signedUrl) return null;
        return [memory.id, data.signedUrl] as const;
      }),
    ).then((pairs) => {
      if (cancelled) return;
      const next: Record<string, string> = {};
      for (const pair of pairs) {
        if (!pair) continue;
        next[pair[0]] = pair[1];
      }
      setSignedImageUrls(next);
    });

    return () => {
      cancelled = true;
    };
  }, [feed]);

  useEffect(() => {
    const container = mainContentRef.current;
    if (!container) return;

    const savedTop = sessionStorage.getItem(HOME_SCROLL_KEY);
    if (!savedTop) return;

    const parsed = Number(savedTop);
    if (!Number.isFinite(parsed)) return;

    // Wait one frame so content can lay out before restoring scroll.
    requestAnimationFrame(() => {
      container.scrollTop = parsed;
    });
  }, []);

  const persistHomeScrollPosition = () => {
    const container = mainContentRef.current;
    if (!container) return;
    sessionStorage.setItem(HOME_SCROLL_KEY, String(container.scrollTop));
  };

  return (
    <div className="flex h-dvh justify-center bg-[#fafafa]">
      <div
        className="relative flex h-dvh w-full max-w-[390px] flex-col overflow-hidden bg-[#fafafa] text-zinc-900 md:my-8 md:h-[844px] md:rounded-[2.25rem] md:shadow-[0_24px_64px_rgb(24_24_27_/_0.12)]"
        style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-linear-to-b from-[#FF6B6C]/[0.04] to-transparent"
          aria-hidden
        />

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:px-3 focus:py-2 focus:text-white focus:shadow-md"
          style={{ backgroundColor: ACCENT }}
        >
          Skip to main content
        </a>

        {/* Header */}
        <header className="relative z-10 flex items-center justify-between px-4 pb-2 pt-[max(12px,env(safe-area-inset-top))]">
          {appNavigation ? (
            <Link
              href="/profile"
              aria-label="Open profile"
              className={profileBtnClass}
              style={{ outlineColor: ACCENT }}
            >
              <UserRound className="size-6 text-zinc-700" strokeWidth={1.75} aria-hidden />
            </Link>
          ) : (
            <button
              type="button"
              aria-label="Open profile"
              className={profileBtnClass}
              style={{ outlineColor: ACCENT }}
            >
              <UserRound className="size-6 text-zinc-700" strokeWidth={1.75} aria-hidden />
            </button>
          )}
          <p className="text-sm font-semibold tracking-tight text-zinc-800">
            Memories
          </p>
          <span className="size-11" aria-hidden />
        </header>

        <div
          id="main-content"
          ref={mainContentRef}
          className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-40"
        >
          {/* Hero */}
          <section className="shrink-0 px-0 pt-1">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
              {totalMemoryCount ?? stats.total} moments · for {partnerFirstName}
            </p>
            <h1 className="mt-1 font-serif text-4xl leading-tight font-bold text-zinc-900">
              Your little archive.
            </h1>
          </section>

          {/* Search */}
          <div className="relative shrink-0">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search memories, notes, tags..."
              aria-label="Search memories"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-[100px] border-0 bg-white pl-10 pr-4 text-[15px] text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B6C]/35"
            />
          </div>

          {/* Tag pills */}
          <div className="shrink-0 py-0.5">
            <div
              className="-mx-1 flex min-h-10 items-center gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="tablist"
              aria-label="Filter by most used tags"
            >
              {tagPills.map((tag) => {
                const selected = activeTag === tag;
                return (
                  <TagPill
                    key={tag}
                    label={tag === "all" ? "All" : tag}
                    selected={selected}
                    onClick={() => setActiveTag(tag)}
                  />
                );
              })}
            </div>
          </div>

          {/* Next Up */}
          <section aria-label="Upcoming reminders" className="flex shrink-0 flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-base font-bold uppercase tracking-widest text-zinc-900">
                NEXT UP
              </h2>
              {appNavigation ? (
                <Link
                  href="/reminders"
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
                >
                  See all →
                </Link>
              ) : null}
            </div>
            {upcomingReminders.length === 0 ? (
              <p className="rounded-2xl bg-white p-4 text-sm text-zinc-500 shadow-sm">
                No reminders in the next 7 days.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {upcomingReminders.map((reminder) => {
                  const today = new Date();
                  const tomorrow = new Date(today);
                  tomorrow.setDate(today.getDate() + 1);
                  const reminderDate = new Date(`${reminder.date}T00:00:00`);
                  const urgent =
                    reminderDate.toDateString() === today.toDateString() ||
                    reminderDate.toDateString() === tomorrow.toDateString();

                  return (
                    <ReminderCard
                      key={reminder.id}
                      id={reminder.id}
                      title={reminder.title}
                      note={reminder.note ?? undefined}
                      date={reminder.date}
                      reminderTime={reminder.reminder_time ?? undefined}
                      urgent={urgent}
                      onClick={
                        appNavigation
                          ? () => {
                              router.push("/reminders");
                            }
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            )}
          </section>

          {/* Feed */}
          <section
            aria-label="Recent memories"
            className="flex shrink-0 flex-col gap-3"
          >
            <h2 className="font-serif text-base font-bold text-zinc-900">
              RECENT MOMENTS
            </h2>
            {visible.length === 0 ? (
              <p className="rounded-2xl bg-white p-6 text-center text-sm text-zinc-500 shadow-sm">
                {searchQuery.trim()
                  ? "No memories match your search."
                  : activeTag === "all"
                    ? "No memories yet."
                    : "Nothing for this tag yet."}
              </p>
            ) : (
              visible.map((memory) => {
                const imageRef = memory.imageStoragePath?.trim() ?? "";
                const resolvedImageUrl = imageRef
                  ? isAbsoluteHttpUrl(imageRef)
                    ? imageRef
                    : signedImageUrls[memory.id]
                  : undefined;
                return (
                  <MemoryCard
                    key={memory.id}
                    title={memory.title}
                    content={memory.excerpt}
                    memoryDate={memory.dateLabel}
                    tags={memory.tags}
                    imageUrl={resolvedImageUrl}
                    onClick={
                      appNavigation
                        ? () => {
                            persistHomeScrollPosition();
                            router.push(`/memories/${memory.id}`);
                          }
                        : undefined
                    }
                  />
                );
              })
            )}
          </section>
        </div>

        {appNavigation ? (
          <Link
            href="/memories/new"
            aria-label="Add memory"
            className={fabClass}
          >
            <Plus className="size-7" strokeWidth={2.5} aria-hidden />
          </Link>
        ) : (
          <button type="button" aria-label="Add memory" className={fabClass}>
            <Plus className="size-7" strokeWidth={2.5} aria-hidden />
          </button>
        )}

        <nav
          className="absolute bottom-0 left-0 right-0 z-20 bg-white/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgb(24_24_27_/_0.08)] backdrop-blur-xl"
          aria-label="Primary"
        >
          <ul className="flex items-stretch justify-around pt-1">
            <li className="flex flex-1">
              <span className="flex flex-1 flex-col items-center gap-1 py-3 text-zinc-800" aria-current="page">
                <Home className="size-[22px]" strokeWidth={2.25} aria-hidden />
                <span className="text-xs font-semibold">Home</span>
                <span className="h-1 w-1 rounded-full" style={{ backgroundColor: ACCENT }} />
              </span>
            </li>
            <li className="flex flex-1">
              {appNavigation ? (
                <Link
                  href="/reminders"
                  className={`flex flex-1 ${navInactiveClass}`}
                  style={{ outlineColor: ACCENT }}
                >
                  <Bell className="size-[22px]" strokeWidth={1.75} aria-hidden />
                  <span className="text-xs">Reminders</span>
                </Link>
              ) : (
                <button
                  type="button"
                  className={`flex flex-1 ${navInactiveClass}`}
                  style={{ outlineColor: ACCENT }}
                >
                  <Bell className="size-[22px]" strokeWidth={1.75} aria-hidden />
                  <span className="text-xs">Reminders</span>
                </button>
              )}
            </li>
            <li className="flex flex-1">
              {appNavigation ? (
                <Link
                  href="/partner"
                  className={`flex flex-1 ${navInactiveClass}`}
                  style={{ outlineColor: ACCENT }}
                >
                  <User className="size-[22px]" strokeWidth={1.75} aria-hidden />
                  <span className="text-xs">Partner</span>
                </Link>
              ) : (
                <button
                  type="button"
                  className={`flex flex-1 ${navInactiveClass}`}
                  style={{ outlineColor: ACCENT }}
                >
                  <User className="size-[22px]" strokeWidth={1.75} aria-hidden />
                  <span className="text-xs">Partner</span>
                </button>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
