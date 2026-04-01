"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Camera, Calendar, Gift, Mic, Type } from "lucide-react";
import { todayIsoDateLocal } from "@/lib/formatDate";

const MEMORY_TYPES = [
  { value: "text", label: "Text", Icon: Type },
  { value: "voice", label: "Voice", Icon: Mic },
  { value: "photo", label: "Photo", Icon: Camera },
  { value: "gift", label: "Gift", Icon: Gift },
  { value: "occasion", label: "Occasion", Icon: Calendar },
] as const;

const PRESET_TAGS = [
  "happy",
  "romantic",
  "grateful",
  "funny",
  "milestone",
  "difficult",
  "peaceful",
  "excited",
] as const;

type MemoryType = (typeof MEMORY_TYPES)[number]["value"];
type PresetTag = (typeof PRESET_TAGS)[number];

function autoTitleFromText(raw: string): string {
  const text = raw.trim();
  if (!text) return "";
  const dotIndex = text.indexOf(".");
  const base =
    dotIndex === -1 ? text.slice(0, 60) : text.slice(0, Math.min(dotIndex + 1, 60));
  return base.length < text.length && base.length === 60 ? `${base}…` : base;
}

function inferTypeFromContext(
  hasVoice: boolean,
  hasPhoto: boolean,
  tags: string[],
): MemoryType {
  if (hasVoice) return "voice";
  if (hasPhoto) return "photo";
  const lower = tags.map((t) => t.toLowerCase());
  if (lower.includes("gift")) return "gift";
  if (lower.includes("occasion")) return "occasion";
  return "text";
}

export default function NewMemoryPage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const [title, setTitle] = useState("");
  const [memoryDate, setMemoryDate] = useState(todayIsoDateLocal);
  const [details, setDetails] = useState("");
  const [type, setType] = useState<MemoryType>("text");
  const [tags, setTags] = useState<PresetTag[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleTag(tag: PresetTag) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmedDetails = details.trim();

    const md = memoryDate.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(md)) {
      setError("Please choose a valid date.");
      return;
    }

    setSubmitting(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("You must be signed in.");
        return;
      }

      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: autoTitleFromText(trimmedDetails || title),
          details: trimmedDetails ? trimmedDetails : null,
          type: inferTypeFromContext(false, false, tags),
          tags: tags.length ? tags : null,
          memory_date: md,
        }),
      });

      const json = (await res.json()) as {
        error?: string;
        details?: string;
      };

      if (!res.ok) {
        setError(json.error ?? "Could not save memory. Please try again.");
        return;
      }

      router.push("/home");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-black">
      <section className="w-full max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Add a memory
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Capture the moment—so you can feel it again later.
        </p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Title
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Our first walk in the rain"
              required
              className="border border-zinc-200 rounded-lg px-3 py-2 bg-white text-black dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Date</span>
            <input
              type="date"
              value={memoryDate}
              onChange={(e) => setMemoryDate(e.target.value)}
              className="border border-zinc-200 rounded-lg px-3 py-2 bg-white text-black dark:bg-zinc-900 dark:text-zinc-50 dark:border-zinc-800"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Details (optional)
            </span>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="The little things worth remembering..."
              className="border border-zinc-200 rounded-lg px-3 py-2 bg-white text-black dark:bg-zinc-900 dark:text-zinc-50 min-h-[120px]"
            />
          </label>

          <div>
            <div className="flex gap-2 overflow-x-auto">
              {MEMORY_TYPES.map((t) => {
                const Icon = t.Icon;
                const active = type === t.value;

                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    aria-pressed={active}
                    className={[
                      "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg border transition-colors",
                      active
                        ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                        : "bg-white text-black border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900",
                    ].join(" ")}
                  >
                    <Icon size={18} />
                    <span className="text-xs font-medium">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-2">
              How did it feel?
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESET_TAGS.map((tag) => {
                const active = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    aria-pressed={active}
                    className={[
                      "px-3 py-1.5 rounded-full text-sm border transition-colors",
                      active
                        ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                        : "bg-white text-black border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900",
                    ].join(" ")}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}

          <div className="flex items-center gap-3 mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-3 rounded-lg bg-black text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {submitting ? "Saving..." : "Save this memory"}
            </button>

            <Link
              href="/home"
              className="px-5 py-3 rounded-lg border border-zinc-200 bg-white text-black hover:bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}

