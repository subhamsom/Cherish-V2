"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { Camera, Calendar, Gift, Mic, Type } from "lucide-react";

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

type Memory = {
  id: string;
  title: string | null;
  content: string;
  type: string;
  tags: string[] | null;
};

export default function EditMemoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [type, setType] = useState<MemoryType>("text");
  const [tags, setTags] = useState<PresetTag[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleTag(tag: PresetTag) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("memories")
        .select("id, title, content, type, tags")
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        console.error("Memory fetch failed:", error);
        setMemory(null);
        setLoading(false);
        return;
      }

      setMemory(data);
      setTitle(data?.title ?? "");
      setDetails(data?.content ?? "");
      setType((data?.type as MemoryType) ?? "text");
      setTags((data?.tags as PresetTag[] | null) ?? []);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, supabase]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const trimmedDetails = details.trim();

    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }

    setSubmitting(true);
    try {
      if (!id) return;

      const res = await fetch(`/api/memories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          details: trimmedDetails ? trimmedDetails : null,
          type,
          tags: tags.length ? tags : null,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Could not save changes. Please try again.");
        return;
      }

      router.push("/home");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main style={{ padding: 16 }}>
        <p>Loading...</p>
      </main>
    );
  }

  if (!memory) {
    return (
      <main style={{ padding: 16 }}>
        <p>Memory not found.</p>
        <Link href="/home">Go home</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-black">
      <section className="w-full max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Edit memory
        </h1>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Title
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border border-zinc-200 rounded-lg px-3 py-2 bg-white text-black dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Details (optional)
            </span>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
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

          {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-3 rounded-lg bg-black text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {submitting ? "Saving..." : "Save changes"}
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

