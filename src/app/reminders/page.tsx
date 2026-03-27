"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { formatDate } from "@/lib/formatDate";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  List,
  MoreVertical,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";

type Reminder = {
  id: string;
  title: string;
  date: string;
  note: string | null;
  tags: string[] | null;
  recurrence: "none" | "daily" | "weekly" | "monthly" | "yearly" | null;
  recurring: boolean | null;
  completed: boolean | null;
};

type CalendarCell = {
  date: Date;
  inCurrentMonth: boolean;
  dateKey: string;
};

function toDateKey(date: Date) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfMonthUTC(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function monthLabel(date: Date) {
  return date.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function buildCalendarGrid(month: Date): CalendarCell[] {
  const firstDay = startOfMonthUTC(month);
  const start = new Date(firstDay);
  const dayOfWeek = firstDay.getUTCDay();
  start.setUTCDate(firstDay.getUTCDate() - dayOfWeek);

  const cells: CalendarCell[] = [];
  for (let index = 0; index < 42; index += 1) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    cells.push({
      date,
      inCurrentMonth: date.getUTCMonth() === month.getUTCMonth(),
      dateKey: toDateKey(date),
    });
  }

  return cells;
}

function ReminderCard({
  reminder,
  onToggleDone,
  onDelete,
}: {
  reminder: Reminder;
  onToggleDone: (id: string, done: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleDone() {
    setBusy(true);
    try {
      await onToggleDone(reminder.id, Boolean(reminder.completed));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await onDelete(reminder.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-medium">{reminder.title}</h3>
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">{formatDate(reminder.date)}</p>
        </div>
        <div className="relative flex items-center gap-1">
          <button
            type="button"
            onClick={handleDone}
            disabled={busy}
            aria-label={reminder.completed ? "Mark as not done" : "Mark as done"}
            className={[
              "rounded-lg border p-2 transition-colors",
              reminder.completed
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300",
            ].join(" ")}
          >
            <Check size={16} />
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Reminder options"
            className="rounded-lg border border-zinc-300 p-2 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen ? (
            <div className="absolute right-0 top-10 z-10 min-w-36 rounded-xl border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <Link
                href={`/reminders/${reminder.id}/edit`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Pencil size={14} />
                Edit
              </Link>
              <button
                type="button"
                onClick={async () => {
                  setMenuOpen(false);
                  await handleDelete();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {(reminder.tags ?? []).map((tag) => (
          <span
            key={`${reminder.id}-${tag}`}
            className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
          >
            {tag}
          </span>
        ))}

        {((reminder.recurrence && reminder.recurrence !== "none") || reminder.recurring) ? (
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
            {!reminder.recurrence || reminder.recurrence === "none"
              ? "Recurring"
              : `${reminder.recurrence[0].toUpperCase()}${reminder.recurrence.slice(1)}`}
          </span>
        ) : null}
      </div>
    </article>
  );
}

function ReminderSection({
  title,
  reminders,
  collapsed,
  onToggle,
  onToggleDone,
  onDelete,
}: {
  title: string;
  reminders: Reminder[];
  collapsed: boolean;
  onToggle: () => void;
  onToggleDone: (id: string, done: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <section className="mt-5">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-xl border border-zinc-200 px-3 py-2 text-left dark:border-zinc-800"
      >
        <span className="font-medium">
          {title} ({reminders.length})
        </span>
        {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
      </button>

      {!collapsed ? (
        reminders.length ? (
          <div className="mt-3 grid gap-2">
            {reminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onToggleDone={onToggleDone}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">No reminders here.</p>
        )
      ) : null}
    </section>
  );
}

export default function RemindersPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [showPast, setShowPast] = useState(false);
  const [collapse, setCollapse] = useState({ due: false, upcoming: false, past: false });
  const [month, setMonth] = useState(startOfMonthUTC(new Date()));
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadReminders() {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (authError || !user) {
        setError("You must be signed in.");
        setLoading(false);
        return;
      }

      const { data: partner, error: partnerError } = await supabase
        .from("partners")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (partnerError || !partner) {
        setError("Could not load partner data. Complete onboarding first.");
        setLoading(false);
        return;
      }

      const { data, error: remindersError } = await supabase
        .from("reminders")
        .select("id, title, date, note, tags, recurrence, recurring, completed")
        .eq("partner_id", partner.id)
        .order("date", { ascending: true });

      if (cancelled) return;

      if (remindersError) {
        setError("Could not load reminders.");
        setLoading(false);
        return;
      }

      setReminders(data ?? []);
      setLoading(false);
    }

    loadReminders();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const todayKey = toDateKey(new Date());

  const due = reminders.filter((reminder) => !reminder.completed && reminder.date <= todayKey);
  const upcoming = reminders.filter((reminder) => !reminder.completed && reminder.date > todayKey);
  const past = reminders.filter((reminder) => Boolean(reminder.completed));

  const remindersByDate = reminders.reduce<Record<string, Reminder[]>>((acc, reminder) => {
    const key = reminder.date;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(reminder);
    return acc;
  }, {});

  const calendarCells = buildCalendarGrid(month);
  const selectedDateReminders = selectedDateKey ? (remindersByDate[selectedDateKey] ?? []) : [];

  async function toggleDone(id: string, done: boolean) {
    const { error: updateError } = await supabase
      .from("reminders")
      .update({ completed: !done })
      .eq("id", id);

    if (updateError) return;

    setReminders((prev) =>
      prev.map((reminder) => (reminder.id === id ? { ...reminder, completed: !done } : reminder)),
    );
  }

  async function deleteReminder(id: string) {
    const { error: deleteError } = await supabase.from("reminders").delete().eq("id", id);
    if (deleteError) return;
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
  }

  return (
    <main className="min-h-screen bg-white p-4 text-black dark:bg-black dark:text-zinc-50">
      <section className="mx-auto w-full max-w-xl">
        <header className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Reminders</h1>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl border border-zinc-200 p-1 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setView("list")}
                className={[
                  "rounded-lg p-2",
                  view === "list"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-zinc-600 dark:text-zinc-300",
                ].join(" ")}
                aria-label="List view"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => setView("calendar")}
                className={[
                  "rounded-lg p-2",
                  view === "calendar"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-zinc-600 dark:text-zinc-300",
                ].join(" ")}
                aria-label="Calendar view"
              >
                <Calendar size={16} />
              </button>
            </div>

            <Link
              href="/reminders/new"
              className="rounded-xl bg-black p-2.5 text-white dark:bg-white dark:text-black"
              aria-label="Add reminder"
            >
              <Plus size={18} />
            </Link>
          </div>
        </header>

        {loading ? <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">Loading...</p> : null}
        {error ? <p className="mt-6 text-sm text-red-600 dark:text-red-400">{error}</p> : null}

        {!loading && !error && reminders.length === 0 ? (
          <p className="mt-8 text-zinc-600 dark:text-zinc-300">
            No reminders yet. Add a birthday or anniversary.
          </p>
        ) : null}

        {!loading && !error && reminders.length > 0 && view === "list" ? (
          <>
            <ReminderSection
              title="Due"
              reminders={due}
              collapsed={collapse.due}
              onToggle={() => setCollapse((prev) => ({ ...prev, due: !prev.due }))}
              onToggleDone={toggleDone}
              onDelete={deleteReminder}
            />
            <ReminderSection
              title="Upcoming"
              reminders={upcoming}
              collapsed={collapse.upcoming}
              onToggle={() => setCollapse((prev) => ({ ...prev, upcoming: !prev.upcoming }))}
              onToggleDone={toggleDone}
              onDelete={deleteReminder}
            />

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowPast((prev) => !prev)}
                className="text-sm text-zinc-600 underline dark:text-zinc-300"
              >
                {showPast ? "Hide past" : "Show past"}
              </button>
            </div>

            {showPast ? (
              <ReminderSection
                title="Past"
                reminders={past}
                collapsed={collapse.past}
                onToggle={() => setCollapse((prev) => ({ ...prev, past: !prev.past }))}
                onToggleDone={toggleDone}
                onDelete={deleteReminder}
              />
            ) : null}
          </>
        ) : null}

        {!loading && !error && reminders.length > 0 && view === "calendar" ? (
          <section className="mt-5 rounded-2xl border border-zinc-200 p-3 dark:border-zinc-800">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setMonth(
                    (prev) => new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() - 1, 1)),
                  )
                }
                className="rounded-lg border border-zinc-200 px-2 py-1 text-sm dark:border-zinc-700"
              >
                Prev
              </button>
              <p className="font-medium">{monthLabel(month)}</p>
              <button
                type="button"
                onClick={() =>
                  setMonth(
                    (prev) => new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() + 1, 1)),
                  )
                }
                className="rounded-lg border border-zinc-200 px-2 py-1 text-sm dark:border-zinc-700"
              >
                Next
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-500 dark:text-zinc-400">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
              {calendarCells.map((cell) => {
                const hasReminders = Boolean(remindersByDate[cell.dateKey]?.length);
                const selected = selectedDateKey === cell.dateKey;
                return (
                  <button
                    key={cell.dateKey}
                    type="button"
                    onClick={() => setSelectedDateKey(cell.dateKey)}
                    className={[
                      "flex h-11 flex-col items-center justify-center rounded-lg border text-xs",
                      cell.inCurrentMonth
                        ? "border-zinc-200 text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
                        : "border-zinc-100 text-zinc-400 dark:border-zinc-900 dark:text-zinc-600",
                      selected ? "bg-black text-white dark:bg-white dark:text-black" : "",
                    ].join(" ")}
                  >
                    <span>{cell.date.getUTCDate()}</span>
                    {hasReminders ? (
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-current" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            {selectedDateKey ? (
              <div className="mt-4 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <p className="text-sm font-medium">{formatDate(selectedDateKey)}</p>
                {selectedDateReminders.length ? (
                  <div className="mt-2 grid gap-2">
                    {selectedDateReminders.map((reminder) => (
                      <ReminderCard
                        key={reminder.id}
                        reminder={reminder}
                        onToggleDone={toggleDone}
                        onDelete={deleteReminder}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    No reminders on this date.
                  </p>
                )}
              </div>
            ) : null}
          </section>
        ) : null}
      </section>
    </main>
  );
}

