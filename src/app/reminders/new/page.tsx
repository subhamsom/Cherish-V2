"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { todayIsoDateLocal } from "@/lib/formatDate";
import { ReminderCaptureFooter } from "@/components/cherish/ReminderCaptureFooter";
import { TimePickerPopover } from "@/components/cherish/TimePickerPopover";
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

export default function NewReminderPage() {
  const router = useRouter();
  const titleRef = useRef<HTMLInputElement | null>(null);
  const noteRef = useRef<HTMLTextAreaElement | null>(null);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayIsoDateLocal);
  const [note, setNote] = useState("");
  const [reminderTime, setReminderTime] = useState<string | null>(null);
  const [repeatYearly, setRepeatYearly] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [discardOpen, setDiscardOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = title.trim().length > 0 && !submitting;
  const isDirty =
    title.trim().length > 0 ||
    note.trim().length > 0 ||
    tagInput.trim().length > 0 ||
    tags.length > 0 ||
    reminderTime !== null ||
    repeatYearly === true;

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

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
    if (!canSave) return;
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          date,
          note: note.trim() || null,
          tags: tags.length ? tags : null,
          reminder_time: reminderTime ? `${date}T${reminderTime}:00` : null,
          recurrence: repeatYearly ? "yearly" : "none",
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
    if (!isDirty || submitting) {
      router.push("/reminders");
      return;
    }
    setDiscardOpen(true);
  }

  return (
    <main className="relative flex min-h-dvh flex-col bg-[#fafafa] text-zinc-800">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200/80 bg-[#fafafa]/95 px-3 py-3 backdrop-blur-sm">
        <button
          type="button"
          onClick={handleBack}
          className="flex size-10 items-center justify-center rounded-full text-zinc-700"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-serif text-lg tracking-tight text-zinc-800">New reminder</h1>
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

        <div className="mt-2">
          <TimePickerPopover value={reminderTime} onChange={setReminderTime} />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-zinc-600">Repeat yearly</span>
          <button
            type="button"
            onClick={() => setRepeatYearly((prev) => !prev)}
            className={[
              "relative h-6 w-11 rounded-full transition-colors",
              repeatYearly ? "bg-[#FF6B6C]" : "bg-zinc-200",
            ].join(" ")}
            aria-pressed={repeatYearly}
            aria-label="Toggle repeat yearly"
          >
            <span
              className={[
                "absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all",
                repeatYearly ? "left-[1.35rem]" : "left-0.5",
              ].join(" ")}
            />
          </button>
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

      <ReminderCaptureFooter
        tags={tags}
        tagInput={tagInput}
        setTagInput={setTagInput}
        onCommitTag={commitTag}
        onRemoveTag={(tag) => setTags((prev) => prev.filter((existing) => existing !== tag))}
      />

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
