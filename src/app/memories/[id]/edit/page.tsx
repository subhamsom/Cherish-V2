"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { isoDateFromCreatedAt, todayIsoDateLocal } from "@/lib/formatDate";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

const ACCENT = "#FF6B6C";

function formatDateLabel(isoDate: string) {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "Choose date";
  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function normalizeTag(raw: string) {
  return raw.trim().replace(/\s+/g, " ").toLowerCase();
}

type Memory = {
  id: string;
  title: string | null;
  content: string;
  type: string;
  tags: string[] | null;
  memory_date?: string | null;
  created_at?: string | null;
};

export default function EditMemoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const titleRef = useRef<HTMLInputElement | null>(null);
  const detailsRef = useRef<HTMLTextAreaElement | null>(null);

  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [memoryDate, setMemoryDate] = useState(todayIsoDateLocal);
  const [details, setDetails] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [reminderDateSet, setReminderDateSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("memories")
        .select("id, title, content, type, tags, memory_date, created_at")
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
      setMemoryDate(
        data?.memory_date?.trim() ||
          (data?.created_at ? isoDateFromCreatedAt(data.created_at) : todayIsoDateLocal()),
      );
      setDetails(data?.content ?? "");
      setTags((data?.tags as string[] | null) ?? []);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, supabase]);

  useEffect(() => {
    titleRef.current?.focus();
  }, [loading]);

  useEffect(() => {
    const textarea = detailsRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.max(220, textarea.scrollHeight)}px`;
  }, [details]);

  useEffect(() => {
    let cancelled = false;
    async function loadReminderDates() {
      const response = await fetch("/api/reminders");
      const json = await response.json().catch(() => ({}));
      if (cancelled || !response.ok || !Array.isArray(json.reminders)) return;
      const next = new Set<string>();
      for (const reminder of json.reminders as Array<{ date?: string }>) {
        const iso = String(reminder.date ?? "").trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) next.add(iso);
      }
      setReminderDateSet(next);
    }
    void loadReminderDates();
    return () => {
      cancelled = true;
    };
  }, []);

  function commitTag() {
    const next = normalizeTag(tagInput);
    if (!next) return;
    setTags((prev) => (prev.includes(next) ? prev : [...prev, next]));
    setTagInput("");
  }

  function handleBack() {
    if (!memory || submitting) {
      router.push("/home");
      return;
    }
    const baselineTags = new Set((memory.tags ?? []).map((tag) => normalizeTag(tag)));
    const currentTags = new Set(tags.map((tag) => normalizeTag(tag)));
    const tagsChanged =
      baselineTags.size !== currentTags.size ||
      Array.from(baselineTags).some((tag) => !currentTags.has(tag));
    const isDirty =
      title.trim() !== (memory.title ?? "").trim() ||
      details.trim() !== memory.content.trim() ||
      memoryDate.trim() !==
        (memory.memory_date?.trim() ||
          (memory.created_at ? isoDateFromCreatedAt(memory.created_at) : todayIsoDateLocal())) ||
      tagsChanged ||
      tagInput.trim().length > 0;
    if (!isDirty) {
      router.push("/home");
      return;
    }
    setDiscardOpen(true);
  }

  const canSave = title.trim().length > 0 && !submitting;

  async function onSave() {
    setError(null);
    const md = memoryDate.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(md)) {
      setError("Please choose a valid date.");
      return;
    }
    if (!canSave || !id) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/memories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          details: details.trim() || null,
          type: "text",
          tags: tags.length ? tags : null,
          memory_date: md,
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
      <main className="min-h-dvh bg-[#f7f7f8] p-4">
        <p className="text-sm text-zinc-600">Memory not found.</p>
      </main>
    );
  }

  const reminderDates = Array.from(reminderDateSet)
    .map((iso) => new Date(`${iso}T00:00:00`))
    .filter((d) => !Number.isNaN(d.getTime()));

  return (
    <main className="relative flex min-h-dvh flex-col bg-[#f7f7f8] text-zinc-800">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200/80 bg-[#f7f7f8]/95 px-3 py-3 backdrop-blur-sm">
        <button
          type="button"
          onClick={handleBack}
          className="flex size-10 items-center justify-center rounded-full text-zinc-700"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-serif text-lg tracking-tight text-zinc-800">Edit moment</h1>
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          className="rounded-full px-4 py-1.5 text-sm font-medium text-white transition-colors disabled:bg-zinc-300 disabled:text-zinc-500"
          style={{ backgroundColor: canSave ? ACCENT : undefined }}
        >
          {submitting ? "Saving..." : "Save"}
        </button>
      </header>

      <section className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-40 pt-5">
        <input
          ref={titleRef}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add title"
          aria-label="Title"
          className="w-full border-0 bg-transparent p-0 font-serif text-[2.15rem] leading-[1.1] text-zinc-700 outline-hidden placeholder:text-zinc-500"
        />

        <div className="mt-3">
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full px-1 py-1 text-sm text-zinc-500"
                />
              }
            >
              <CalendarIcon className="size-4" />
              <span>{formatDateLabel(memoryDate)}</span>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-2">
              <Calendar
                mode="single"
                selected={new Date(`${memoryDate}T00:00:00`)}
                onSelect={(value) => {
                  if (!value) return;
                  const nextIso = value.toISOString().slice(0, 10);
                  setMemoryDate(nextIso);
                  setDateOpen(false);
                }}
                modifiers={{ hasReminder: reminderDates }}
                modifiersStyles={{
                  hasReminder: {
                    backgroundImage: `radial-gradient(circle at 50% 92%, ${ACCENT} 2px, transparent 2.5px)`,
                    backgroundRepeat: "no-repeat",
                  },
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Textarea
          ref={detailsRef}
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          placeholder="What do you want to remember?"
          aria-label="Details"
          className="mt-4 min-h-[220px] resize-none border-0 bg-transparent p-0 text-lg leading-7 text-zinc-700 shadow-none outline-hidden placeholder:text-zinc-500 focus-visible:ring-0"
        />

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </section>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-[#f7f7f8]/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-sm">
        {tags.length > 0 ? (
          <div className="mb-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setTags((prev) => prev.filter((existing) => existing !== tag))}
                className="rounded-full bg-zinc-200 px-3 py-1 text-xs text-zinc-700"
                aria-label={`Remove ${tag}`}
              >
                {tag}
              </button>
            ))}
          </div>
        ) : null}
        <input
          value={tagInput}
          onChange={(event) => setTagInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "," || event.key === "Enter") {
              event.preventDefault();
              commitTag();
            }
          }}
          onBlur={commitTag}
          placeholder="Tags (optional)"
          className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-hidden focus:border-zinc-400"
        />
      </footer>

      <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Discard this moment?</DialogTitle>
            <DialogDescription>
              Your changes have not been saved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-transparent p-0 pt-2">
            <Button variant="outline" onClick={() => setDiscardOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                setDiscardOpen(false);
                router.push("/home");
              }}
              style={{ backgroundColor: ACCENT }}
            >
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

