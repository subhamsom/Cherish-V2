"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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

export default function NewReminderPage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [recurrence, setRecurrence] = useState<ReminderRecurrence>("none");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("You must be signed in.");
        return;
      }

      const { data: partner, error: partnerError } = await supabase
        .from("partners")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (partnerError || !partner) {
        setError("Could not find your partner profile. Complete onboarding first.");
        return;
      }

      const payload = {
        user_id: user.id,
        partner_id: partner.id,
        type: "occasion",
        title: trimmedTitle,
        date,
        note: note.trim() || null,
        tags: parseTagsInput(tagsInput),
        recurrence,
        reminder_time: new Date().toISOString(),
        recurring: recurrence !== "none",
      };

      console.log("[reminders:new] payload", payload);

      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseJson = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.log("[reminders:new] save failed response", {
          status: response.status,
          body: responseJson,
        });
        setError("Could not save reminder. Please try again.");
        return;
      }

      router.push("/reminders");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-white p-4 text-black dark:bg-black dark:text-zinc-50">
      <section className="mx-auto w-full max-w-xl">
        <h1 className="text-2xl font-semibold tracking-tight">Add reminder</h1>

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
              {saving ? "Saving..." : "Save reminder"}
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

