"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

type ReminderRecurrence = "none" | "daily" | "weekly" | "monthly" | "yearly";

const RECURRENCE_OPTIONS: ReminderRecurrence[] = [
  "none",
  "daily",
  "weekly",
  "monthly",
  "yearly",
];

function parseTagsInput(value: string) {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((tag) => tag.toLowerCase())
    .filter((tag, index, arr) => arr.indexOf(tag) === index);
}

export default function EditReminderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [recurrence, setRecurrence] = useState<ReminderRecurrence>("none");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadReminder() {
      if (!id) return;

      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("reminders")
        .select("id, title, date, note, tags, recurrence")
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;

      if (fetchError || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setTitle(data.title);
      setDate(data.date);
      setNote(data.note ?? "");
      setTagsInput((data.tags ?? []).join(", "));
      setRecurrence((data.recurrence as ReminderRecurrence | null) ?? "none");
      setLoading(false);
    }

    loadReminder();

    return () => {
      cancelled = true;
    };
  }, [id, supabase]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }

    if (!date) {
      setError("Date is required.");
      return;
    }

    setSaving(true);
    try {
      const { error: updateError } = await supabase
        .from("reminders")
        .update({
          title: trimmedTitle,
          date,
          note: note.trim() || null,
          tags: parseTagsInput(tagsInput),
          recurrence,
          recurring: recurrence !== "none",
        })
        .eq("id", id);

      if (updateError) {
        setError("Could not save changes. Please try again.");
        return;
      }

      router.push("/reminders");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white p-4 text-black dark:bg-black dark:text-zinc-50">
        <p>Loading...</p>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-white p-4 text-black dark:bg-black dark:text-zinc-50">
        <p>Reminder not found.</p>
        <Link href="/reminders" className="mt-3 inline-block underline">
          Back to reminders
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white p-4 text-black dark:bg-black dark:text-zinc-50">
      <section className="mx-auto w-full max-w-xl">
        <h1 className="text-2xl font-semibold tracking-tight">Edit reminder</h1>

        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Mansi's birthday"
              required
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Date</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Note (optional)</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Any details worth remembering..."
              className="min-h-28 rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tags (optional)</span>
            <input
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              placeholder="e.g. birthday, gift, plan ahead"
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
            />
          </label>

          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Recurring</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {RECURRENCE_OPTIONS.map((option) => {
                const active = recurrence === option;
                const label = option[0].toUpperCase() + option.slice(1);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRecurrence(option)}
                    className={[
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                        : "border-zinc-200 bg-white text-black dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

          <div className="mt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-black px-4 py-2.5 text-white disabled:opacity-60 dark:bg-white dark:text-black"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            <Link
              href="/reminders"
              className="rounded-xl border border-zinc-200 px-4 py-2.5 dark:border-zinc-800"
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}

