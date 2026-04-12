"use client";

import {
  Bell,
  Camera,
  Heart,
  Home,
  Plus,
  Search,
  User,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { MobileHomeFeedMemory } from "@/lib/mobileHomeFeedFromDb";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

const SIGN_URL_TTL_SEC = 60 * 60;

function isAbsoluteHttpUrl(s: string) {
  return /^https?:\/\//i.test(s.trim());
}

const ACCENT = "#FF6B6C";
const ACCENT_SOFT = "rgb(255 107 108 / 0.08)";

const FILTER_PILLS = [
  { id: "all" as const, label: "All" },
  { id: "text" as const, label: "Text" },
  { id: "photo" as const, label: "Photo" },
  { id: "voice" as const, label: "Voice" },
  { id: "gift" as const, label: "Gifts" },
];

type FilterId = (typeof FILTER_PILLS)[number]["id"];

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

function buildInitialLiked(list: MobileHomeFeedMemory[]): Record<string, boolean> {
  const next: Record<string, boolean> = {};
  for (const m of list) {
    next[m.id] = m.likedDefault;
  }
  return next;
}

function WaveformMock() {
  const heights = [40, 72, 48, 88, 36, 64, 52, 96, 44, 56, 38, 78];
  return (
    <div
      className="flex h-12 items-center justify-center gap-0.5 rounded-xl px-2"
      style={{ backgroundColor: ACCENT_SOFT }}
      aria-hidden
    >
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-1 rounded-full bg-[#FF6B6C]/70"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

function PhotoAreaPlaceholder() {
  return (
    <>
      <div className="absolute inset-0 bg-linear-to-br from-zinc-200 via-zinc-100 to-zinc-50" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Camera
          className="size-10 text-zinc-400"
          strokeWidth={1.25}
          aria-hidden
        />
      </div>
    </>
  );
}

/**
 * `image_url` in the DB is a storage path in the private `memories` bucket — same as Home,
 * we need a time-limited signed URL before `<img>` can load it.
 */
function SignedMemoryImage({
  storageRef,
  title,
}: {
  storageRef: string | null;
  title: string;
}) {
  const trimmed = storageRef?.trim() ?? "";
  const [src, setSrc] = useState<string | null>(() =>
    trimmed && isAbsoluteHttpUrl(trimmed) ? trimmed : null,
  );
  const [showPlaceholder, setShowPlaceholder] = useState(!trimmed);

  useEffect(() => {
    if (!trimmed) {
      setSrc(null);
      setShowPlaceholder(true);
      return;
    }
    if (isAbsoluteHttpUrl(trimmed)) {
      setSrc(trimmed);
      setShowPlaceholder(false);
      return;
    }

    let cancelled = false;
    setShowPlaceholder(false);
    setSrc(null);

    const supabase = createBrowserSupabaseClient();
    void supabase.storage
      .from("memories")
      .createSignedUrl(trimmed, SIGN_URL_TTL_SEC)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data?.signedUrl) {
          setShowPlaceholder(true);
          return;
        }
        setSrc(data.signedUrl);
      });

    return () => {
      cancelled = true;
    };
  }, [trimmed]);

  if (!trimmed || showPlaceholder) {
    return <PhotoAreaPlaceholder />;
  }

  if (!src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-100">
        <span className="text-xs text-zinc-400">Loading…</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- signed Supabase URL from createSignedUrl
    <img
      src={src}
      alt={title}
      className="absolute inset-0 h-full w-full object-cover"
      onError={() => setShowPlaceholder(true)}
    />
  );
}

function SignedMemoryAudio({ storageRef }: { storageRef: string }) {
  const trimmed = storageRef.trim();
  const [src, setSrc] = useState<string | null>(() =>
    isAbsoluteHttpUrl(trimmed) ? trimmed : null,
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!trimmed) {
      setSrc(null);
      setFailed(true);
      return;
    }
    if (isAbsoluteHttpUrl(trimmed)) {
      setSrc(trimmed);
      setFailed(false);
      return;
    }

    let cancelled = false;
    setSrc(null);
    setFailed(false);

    const supabase = createBrowserSupabaseClient();
    void supabase.storage
      .from("memories")
      .createSignedUrl(trimmed, SIGN_URL_TTL_SEC)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data?.signedUrl) {
          setFailed(true);
          return;
        }
        setSrc(data.signedUrl);
      });

    return () => {
      cancelled = true;
    };
  }, [trimmed]);

  if (failed || !trimmed) {
    return (
      <p className="text-xs text-zinc-500">
        Could not load this recording. Open the memory from Home to try again.
      </p>
    );
  }

  if (!src) {
    return (
      <div className="flex h-12 items-center rounded-xl bg-zinc-100 px-3">
        <span className="text-xs text-zinc-400">Loading audio…</span>
      </div>
    );
  }

  return (
    <audio controls preload="metadata" className="h-10 w-full" src={src} />
  );
}

export type MobileHomeMockProps = {
  /**
   * When provided (including an empty array), replaces the built-in demo feed.
   * Map DB rows with `mapDbMemoriesToMobileHomeFeed` on the server.
   */
  memoriesFromDb?: MobileHomeFeedMemory[];
  greetingName?: string;
  weeklyStats?: { total: number; voice: number; photo: number };
  /** Explains that the list is real account data (helps avoid confusing preview with production UI). */
  liveDataBanner?: boolean;
};

export default function MobileHomeMock({
  memoriesFromDb,
  greetingName = "Sam",
  weeklyStats,
  liveDataBanner = false,
}: MobileHomeMockProps = {}) {
  const feed = memoriesFromDb ?? DEMO_FEED;
  const [filter, setFilter] = useState<FilterId>("all");
  const [liked, setLiked] = useState(() => buildInitialLiked(feed));

  const stats =
    weeklyStats ??
    (memoriesFromDb === undefined
      ? { total: 4, voice: 2, photo: 1 }
      : { total: 0, voice: 0, photo: 0 });

  const visible =
    filter === "all" ? feed : feed.filter((m) => m.kind === filter);

  return (
    <div className="flex min-h-dvh justify-center bg-zinc-100 max-md:bg-zinc-50">
      <div
        className="relative flex min-h-dvh w-full max-w-[390px] flex-col overflow-hidden bg-zinc-50 text-zinc-900 md:my-8 md:min-h-[780px] md:max-h-[844px] md:rounded-[2.25rem] md:shadow-[0_24px_64px_rgb(24_24_27_/_0.12)]"
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
          <button
            type="button"
            aria-label="Open profile"
            className="flex size-11 items-center justify-center rounded-full bg-white text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ outlineColor: ACCENT }}
          >
            <UserRound className="size-6 text-zinc-700" strokeWidth={1.75} aria-hidden />
          </button>
          <p className="text-sm font-semibold tracking-tight text-zinc-800">
            Memories
          </p>
          <span className="size-11" aria-hidden />
        </header>

        <div
          id="main-content"
          className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-40"
        >
          {/* Hero: greeting + stats echoing title / date / richness of the journal */}
          <section className="shrink-0 rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-zinc-500">Good morning</p>
            <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-zinc-900">
              {greetingName}
            </h1>
            {liveDataBanner ? (
              <p className="mt-1 text-xs text-zinc-500">
                Signed-in preview: showing memories from your account (same data
                as Home).
              </p>
            ) : null}
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              Your entries can be{" "}
              <span className="font-medium text-zinc-800">written</span>,{" "}
              <span className="font-medium text-zinc-800">spoken</span>, or{" "}
              <span className="font-medium text-zinc-800">shown in a photo</span>
              — each with a date, tags, and a heart when it matters.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className="rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{
                  color: ACCENT,
                  backgroundColor: "white",
                  boxShadow: "0 1px 6px rgb(24 24 27 / 0.08)",
                }}
              >
                {stats.total} this week
              </span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                {stats.voice} voice · {stats.photo} photo
              </span>
            </div>
          </section>

          {/* Search */}
          <div className="relative shrink-0">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
              aria-hidden
            />
            <input
              type="search"
              placeholder="search memories"
              aria-label="Search memories"
              className="h-11 w-full rounded-[100px] border-0 bg-white pl-10 pr-4 text-[15px] text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B6C]/35"
            />
          </div>

          {/* Filters: outer wrapper must not use overflow-x — in a column flex+min-h-0 parent,
              overflow other than visible can make the flex item's min-height collapse to 0. */}
          <div className="shrink-0 py-0.5">
            <div
              className="-mx-1 flex min-h-10 items-center gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="tablist"
              aria-label="Filter by memory type"
            >
              {FILTER_PILLS.map(({ id, label }) => {
                const selected = filter === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setFilter(id)}
                    className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border px-4 text-sm font-semibold leading-none shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={
                      selected
                        ? {
                            backgroundColor: ACCENT,
                            borderColor: ACCENT,
                            color: "#ffffff",
                            outlineColor: ACCENT,
                            fontSize: "0.875rem",
                          }
                        : {
                            backgroundColor: "#ffffff",
                            borderColor: "rgb(228 228 231)",
                            color: "#3f3f46",
                            outlineColor: ACCENT,
                            fontSize: "0.875rem",
                          }
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feed */}
          <section
            aria-label="Recent memories"
            className="flex shrink-0 flex-col gap-3"
          >
            <h2 className="text-lg font-semibold italic tracking-tight text-zinc-900">
              Recent memories
            </h2>
            {visible.length === 0 ? (
              <p className="rounded-2xl bg-white p-6 text-center text-sm text-zinc-500 shadow-sm">
                Nothing for this filter yet.
              </p>
            ) : (
              visible.map((memory) => {
                const isLiked = liked[memory.id] ?? false;
                const hasMeta =
                  memory.durationSec != null || memory.priceLabel != null;
                return (
                  <article
                    key={memory.id}
                    className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_rgb(24_24_27_/_0.08)]"
                  >
                    {memory.kind === "photo" ? (
                      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
                        <SignedMemoryImage
                          storageRef={memory.imageStoragePath}
                          title={memory.title}
                        />
                      </div>
                    ) : null}

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          {hasMeta ? (
                            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                              {memory.durationSec != null ? (
                                <span className="text-zinc-400">
                                  · {memory.durationSec}s
                                </span>
                              ) : null}
                              {memory.priceLabel != null ? (
                                <span className="text-zinc-400">
                                  · {memory.priceLabel}
                                </span>
                              ) : null}
                            </div>
                          ) : null}
                          <h3
                            className={`text-[15px] font-semibold leading-snug text-zinc-900 ${hasMeta ? "mt-1.5" : ""}`}
                          >
                            {memory.title}
                          </h3>
                        </div>
                      </div>

                      {memory.kind === "voice" ? (
                        <div className="mt-3 space-y-2">
                          {memory.audioStoragePath?.trim() ? (
                            <SignedMemoryAudio
                              storageRef={memory.audioStoragePath}
                            />
                          ) : (
                            <>
                              <WaveformMock />
                              <p className="text-xs text-zinc-500">
                                Demo waveform — add a voice memory on Home to hear
                                your recording here.
                              </p>
                            </>
                          )}
                        </div>
                      ) : null}

                      {memory.excerpt ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-600">
                          {memory.excerpt}
                        </p>
                      ) : null}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {memory.tags.filter(Boolean).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center justify-between pt-3">
                        <time className="text-xs font-medium text-zinc-500">
                          {memory.dateLabel}
                        </time>
                        <button
                          type="button"
                          onClick={() =>
                            setLiked((prev) => ({
                              ...prev,
                              [memory.id]: !isLiked,
                            }))
                          }
                          aria-label={
                            isLiked ? "Unlike memory" : "Like memory"
                          }
                          aria-pressed={isLiked}
                          className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2"
                          style={{
                            color: isLiked ? ACCENT : "#71717a",
                            outlineColor: ACCENT,
                          }}
                        >
                          <Heart
                            className="size-5"
                            strokeWidth={2}
                            fill={isLiked ? "currentColor" : "none"}
                            aria-hidden
                          />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        </div>

        <button
          type="button"
          aria-label="Add memory"
          className="absolute bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-4 z-20 flex size-14 items-center justify-center rounded-2xl bg-[#FF6B6C] text-white shadow-[0_12px_32px_rgb(255_107_108_/_0.4)] transition-transform hover:-translate-y-0.5 hover:bg-[#E85E5F] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B6C]"
        >
          <Plus className="size-7" strokeWidth={2.5} aria-hidden />
        </button>

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
              <button
                type="button"
                className="flex flex-1 flex-col items-center gap-1 py-3 text-zinc-400 transition-colors hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ outlineColor: ACCENT }}
              >
                <Bell className="size-[22px]" strokeWidth={1.75} aria-hidden />
                <span className="text-xs">Reminders</span>
              </button>
            </li>
            <li className="flex flex-1">
              <button
                type="button"
                className="flex flex-1 flex-col items-center gap-1 py-3 text-zinc-400 transition-colors hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ outlineColor: ACCENT }}
              >
                <User className="size-[22px]" strokeWidth={1.75} aria-hidden />
                <span className="text-xs">Partner</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
