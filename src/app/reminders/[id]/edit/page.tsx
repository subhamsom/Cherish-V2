"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { todayIsoDateLocal } from "@/lib/formatDate";
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

type Reminder = {
  id: string;
  title: string;
  date: string;
  note: string | null;
  tags: string[] | null;
};

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

export default function EditReminderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const titleRef = useRef<HTMLInputElement | null>(null);
  const noteRef = useRef<HTMLTextAreaElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [original, setOriginal] = useState<Reminder | null>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayIsoDateLocal);
  const [note, setNote] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [discardOpen, setDiscardOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = title.trim().length > 0 && !submitting;

  useEffect(() => {
    let cancelled = false;
    async function loadReminder() {
      setLoading(true);
      const response = await fetch("/api/reminders");
      const json = await response.json().catch(() => ({}));
      if (cancelled || !response.ok || !Array.isArray(json.reminders)) {
        setLoading(false);
        return;
      }
      const found = (json.reminders as Reminder[]).find((item) => item.id === id) ?? null;
      setOriginal(found);
      setTitle(found?.title ?? "");
      setDate(found?.date ?? todayIsoDateLocal());
      setNote(found?.note ?? "");
      setTags((found?.tags ?? []).map((tag) => normalizeTag(tag)));
      setLoading(false);
    }
    void loadReminder();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!loading) {
      titleRef.current?.focus();
    }
  }, [loading]);

  useEffect(() => {
    const textarea = noteRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.max(220, textarea.scrollHeight)}px`;
  }, [note]);

  function commitTag() {
    const next = normalizeTag(tagInput);
    if (!next) return;
    setTags((prev) => (prev.includes(next) ? prev : [...prev, next]));
    setTagInput("");
  }

  async function onSave() {
    if (!canSave || !id) return;
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          date,
          note: note.trim() || null,
          tags: tags.length ? tags : null,
          recurrence: "none",
          type: "occasion",
        }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(json.error ?? "Could not save reminder.");
        return;
      }
      router.push("/reminders");
    } finally {
      setSubmitting(false);
    }
  }

  function handleBack() {
    if (!original || submitting) {
      router.push("/reminders");
      return;
    }
    const baselineTags = new Set((original.tags ?? []).map((tag) => normalizeTag(tag)));
    const currentTags = new Set(tags.map((tag) => normalizeTag(tag)));
    const tagsChanged =
      baselineTags.size !== currentTags.size ||
      Array.from(baselineTags).some((tag) => !currentTags.has(tag));

    const isDirty =
      title.trim() !== original.title.trim() ||
      date !== original.date ||
      note.trim() !== (original.note ?? "").trim() ||
      tagsChanged ||
      tagInput.trim().length > 0;

    if (!isDirty) {
      router.push("/reminders");
      return;
    }
    setDiscardOpen(true);
  }

  if (loading) {
    return (
      <main className="min-h-dvh bg-[#f7f7f8] p-4">
        <p className="text-sm text-zinc-500">Loading...</p>
      </main>
    );
  }

  if (!original) {
    return (
      <main className="min-h-dvh bg-[#f7f7f8] p-4">
        <p className="text-sm text-zinc-600">Reminder not found.</p>
      </main>
    );
  }

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
        <h1 className="font-serif text-lg tracking-tight text-zinc-800">Edit reminder</h1>
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
              <span>{formatDateLabel(date)}</span>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-2">
              <Calendar
                mode="single"
                selected={new Date(`${date}T00:00:00`)}
                onSelect={(value) => {
                  if (!value) return;
                  setDate(value.toISOString().slice(0, 10));
                  setDateOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Textarea
          ref={noteRef}
          value={note}
          onChange={(event) => setNote(event.target.value)}
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
            <DialogTitle>Discard this reminder?</DialogTitle>
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
                router.push("/reminders");
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
