import { formatMemoryDate, isoDateFromCreatedAt } from "@/lib/formatDate";

/** Row shape from `memories` list queries (matches /home). */
export type MobileHomeDbMemory = {
  id: string;
  title: string | null;
  content: string;
  type: string;
  tags: string[] | null;
  liked: boolean | null;
  pinned: boolean | null;
  audio_url: string | null;
  image_url: string | null;
  memory_date: string;
  created_at: string | null;
};

export type MobileHomeFeedMemory = {
  id: string;
  kind: "text" | "voice" | "photo" | "gift";
  title: string;
  excerpt?: string;
  tags: string[];
  dateLabel: string;
  durationSec?: number;
  priceLabel?: string;
  /** Supabase Storage object path in the `memories` bucket (not a public https URL). */
  imageStoragePath: string | null;
  /** Same as `imageStoragePath`, for voice playback. */
  audioStoragePath: string | null;
  likedDefault: boolean;
};

function trimNorm(s: string | null | undefined): string {
  return (s ?? "").trim();
}

function memoryDescriptionBody(memory: MobileHomeDbMemory): string | null {
  const title = trimNorm(memory.title);
  const raw = memory.content ?? "";
  const contentNorm = raw.trim();
  if (!contentNorm) return null;
  if (contentNorm === title) return null;

  if (!title) {
    return raw;
  }

  const lines = raw.split(/\r?\n/);
  const firstLineTrimmed = lines[0]?.trim() ?? "";
  if (firstLineTrimmed === title) {
    const rest = lines.slice(1).join("\n").replace(/^\r?\n+/, "");
    const restTrim = rest.trim();
    if (!restTrim || restTrim === title) return null;
    return rest;
  }

  return raw;
}

const CARD_TITLE_MAX = 60;
const CARD_EXCERPT_MAX = 150;

function cardTitle(memory: MobileHomeDbMemory): string {
  const t = trimNorm(memory.title);
  if (t) return t.length <= CARD_TITLE_MAX ? t : `${t.slice(0, CARD_TITLE_MAX)}…`;
  const c = trimNorm(memory.content);
  if (c) return c.length <= CARD_TITLE_MAX ? c : `${c.slice(0, CARD_TITLE_MAX)}…`;
  return "Memory";
}

function cardExcerpt(memory: MobileHomeDbMemory): string | undefined {
  const body = memoryDescriptionBody(memory);
  if (body === null) return undefined;
  if (body.length <= CARD_EXCERPT_MAX) return body;
  return `${body.slice(0, CARD_EXCERPT_MAX)}…`;
}

function displayDateLabel(memory: MobileHomeDbMemory): string {
  const raw = memory.memory_date?.trim();
  if (raw) return formatMemoryDate(raw);
  if (memory.created_at) return formatMemoryDate(isoDateFromCreatedAt(memory.created_at));
  return "";
}

export function dbMemoryTypeToKind(type: string): MobileHomeFeedMemory["kind"] {
  if (type === "voice" || type === "photo" || type === "gift") return type;
  return "text";
}

export function mapDbMemoriesToMobileHomeFeed(
  rows: MobileHomeDbMemory[],
): MobileHomeFeedMemory[] {
  return rows.map((m) => {
    const kind = dbMemoryTypeToKind(m.type);
    const tags = (m.tags ?? []).filter(Boolean).slice(0, 4);
    return {
      id: m.id,
      kind,
      title: cardTitle(m),
      excerpt: cardExcerpt(m),
      tags,
      dateLabel: displayDateLabel(m),
      imageStoragePath: m.image_url,
      audioStoragePath: m.audio_url,
      likedDefault: Boolean(m.liked),
    };
  });
}

function effectiveYyyyMmDd(m: MobileHomeDbMemory): string | null {
  const raw = m.memory_date?.trim();
  if (raw) return raw;
  if (m.created_at) return isoDateFromCreatedAt(m.created_at);
  return null;
}

/** Inclusive rolling window: today and the six prior local calendar days. */
function isInLast7LocalDays(yyyyMmDd: string, now: Date): boolean {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyyMmDd.trim());
  if (!parts) return false;
  const y = Number(parts[1]);
  const mo = Number(parts[2]) - 1;
  const d = Number(parts[3]);
  const memoryDay = new Date(y, mo, d);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
  return memoryDay >= start && memoryDay <= end;
}

export function weeklyActivityStats(
  memories: MobileHomeDbMemory[],
  now: Date = new Date(),
): { total: number; voice: number; photo: number } {
  let total = 0;
  let voice = 0;
  let photo = 0;
  for (const m of memories) {
    const day = effectiveYyyyMmDd(m);
    if (!day || !isInLast7LocalDays(day, now)) continue;
    total++;
    if (m.type === "voice") voice++;
    else if (m.type === "photo") photo++;
  }
  return { total, voice, photo };
}

export function greetingFirstNameFromUser(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}): string {
  const meta = user.user_metadata ?? null;
  const full =
    (meta?.full_name as string | undefined) ?? (meta?.name as string | undefined) ?? "";
  const first = full.trim().split(/\s+/)[0];
  if (first) return first;
  const local = user.email?.split("@")[0]?.trim();
  if (local) return local;
  return "there";
}
