"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/formatDate";
import {
  Calendar,
  Check,
  List,
  MoreVertical,
  Plus,
  Trash2,
  Pencil,
  Settings,
  X,
} from "lucide-react";

type Reminder = {
  id: string;
  user_id: string;
  partner_id: string;
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

type ReminderFilter = "all" | "due" | "upcoming" | "past";
type ReminderFormMode = "create" | "edit";

const FILTERS: Array<{ id: ReminderFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "due", label: "Due" },
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
];

const RECURRENCE_OPTIONS: Array<NonNullable<Reminder["recurrence"]>> = [
  "none",
  "daily",
  "weekly",
  "monthly",
  "yearly",
];

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

function parseTagsInput(value: string) {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((tag) => tag.toLowerCase())
    .filter((tag, index, arr) => arr.indexOf(tag) === index);
}

function recurrenceLabel(recurrence: Reminder["recurrence"]) {
  if (!recurrence || recurrence === "none") return "Recurring";
  return `${recurrence[0].toUpperCase()}${recurrence.slice(1)}`;
}

function notePreview(note: string | null, maxChars = 110) {
  if (!note) return null;
  const collapsed = note.replace(/\s+/g, " ").trim();
  if (collapsed.length <= maxChars) return collapsed;
  return `${collapsed.slice(0, maxChars)}...`;
}

function reminderStatus(reminder: Reminder, todayKey: string): "due" | "upcoming" | "past" {
  if (reminder.completed) return "past";
  if (reminder.date <= todayKey) return "due";
  return "upcoming";
}

function ReminderFormModal({
  mode,
  reminder,
  open,
  submitting,
  onClose,
  onSubmit,
}: {
  mode: ReminderFormMode;
  reminder: Reminder | null;
  open: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    date: string;
    note: string;
    tags: string[];
    recurrence: NonNullable<Reminder["recurrence"]>;
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [recurrence, setRecurrence] = useState<NonNullable<Reminder["recurrence"]>>("none");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (mode === "edit" && reminder) {
      setTitle(reminder.title);
      setDate(reminder.date);
      setNote(reminder.note ?? "");
      setTagsInput((reminder.tags ?? []).join(", "));
      setRecurrence(reminder.recurrence ?? "none");
      return;
    }
    setTitle("");
    setDate("");
    setNote("");
    setTagsInput("");
    setRecurrence("none");
  }, [open, mode, reminder]);

  if (!open) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

    await onSubmit({
      title: trimmedTitle,
      date,
      note: note.trim(),
      tags: parseTagsInput(tagsInput),
      recurrence,
    });
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/40 p-4" onClick={onClose}>
      <div
        className="mx-auto mt-6 w-full max-w-xl rounded-2xl bg-white p-4 dark:bg-zinc-950 max-h-[92vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{mode === "create" ? "Add Reminder" : "Edit Reminder"}</h2>
          <button type="button" onClick={onClose} className="rounded-lg border p-1.5">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm">Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Mansi's birthday"
              className="rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm">Date</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm">Note (optional)</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Any details worth remembering..."
              className="min-h-24 rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm">Tags (optional)</span>
            <input
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              placeholder="e.g. birthday, gift, plan ahead"
              className="rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
            />
          </label>

          <div>
            <p className="text-sm">Recurring</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {RECURRENCE_OPTIONS.map((option) => {
                const active = recurrence === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRecurrence(option)}
                    className={[
                      "rounded-full border px-3 py-1.5 text-sm",
                      active
                        ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                        : "border-zinc-200 dark:border-zinc-800",
                    ].join(" ")}
                  >
                    {option[0].toUpperCase()}
                    {option.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

          <div className="mt-2 flex items-center gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-black px-4 py-2.5 text-white disabled:opacity-60 dark:bg-white dark:text-black"
            >
              {submitting ? "Saving..." : mode === "create" ? "Save reminder" : "Save changes"}
            </button>
            <button type="button" onClick={onClose} className="rounded-xl border px-4 py-2.5">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReminderCard({
  reminder,
  onOpenDetails,
  todayKey,
}: {
  reminder: Reminder;
  onOpenDetails: (reminder: Reminder) => void;
  todayKey: string;
}) {
  const status = reminderStatus(reminder, todayKey);

  return (
    <button
      type="button"
      onClick={() => onOpenDetails(reminder)}
      className="w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3 text-left dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium">{reminder.title}</h3>
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">{formatDate(reminder.date)}</p>
          {reminder.note ? <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 truncate">{notePreview(reminder.note)}</p> : null}
        </div>
        <span
          className={[
            "rounded-full px-2 py-0.5 text-xs",
            status === "due"
              ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
              : status === "upcoming"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
          ].join(" ")}
        >
          {status[0].toUpperCase()}
          {status.slice(1)}
        </span>
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
            {recurrenceLabel(reminder.recurrence)}
          </span>
        ) : null}
      </div>
    </button>
  );
}

export default function RemindersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [activeFilter, setActiveFilter] = useState<ReminderFilter>("all");
  const [month, setMonth] = useState(startOfMonthUTC(new Date()));
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [detailReminder, setDetailReminder] = useState<Reminder | null>(null);
  const [detailMenuOpen, setDetailMenuOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<ReminderFormMode>("create");
  const [formSubmitting, setFormSubmitting] = useState(false);

  async function loadReminders() {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/reminders");
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError("Could not load reminders.");
      setLoading(false);
      return;
    }
    setReminders((json.reminders as Reminder[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadReminders();
  }, []);

  useEffect(() => {
    if (!detailReminder) {
      setDetailMenuOpen(false);
    }
  }, [detailReminder]);

  const todayKey = toDateKey(new Date());

  const filteredReminders = reminders.filter((reminder) => {
    const status = reminderStatus(reminder, todayKey);
    if (activeFilter === "all") return true;
    return status === activeFilter;
  });

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

  async function toggleDone(id: string) {
    const response = await fetch(`/api/reminders/${id}/complete`, { method: "POST" });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) return;
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === id ? { ...reminder, completed: Boolean(json.completed) } : reminder,
      ),
    );
    setDetailReminder(null);
    setDetailMenuOpen(false);
  }

  async function deleteReminder(id: string) {
    const confirmed = window.confirm("Delete this reminder?");
    if (!confirmed) return;
    const response = await fetch(`/api/reminders/${id}`, { method: "DELETE" });
    if (!response.ok) return;
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
    setDetailReminder((prev) => (prev?.id === id ? null : prev));
    setDetailMenuOpen(false);
  }

  async function submitReminderForm(payload: {
    title: string;
    date: string;
    note: string;
    tags: string[];
    recurrence: NonNullable<Reminder["recurrence"]>;
  }) {
    setFormSubmitting(true);
    try {
      if (formMode === "create") {
        const response = await fetch("/api/reminders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) return;
      } else if (detailReminder) {
        const response = await fetch(`/api/reminders/${detailReminder.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) return;
      }
      setFormOpen(false);
      setDetailReminder(null);
      setDetailMenuOpen(false);
      await loadReminders();
    } finally {
      setFormSubmitting(false);
    }
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
              href="/settings"
              className="rounded-xl border border-zinc-200 p-2.5 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300 md:hidden"
              aria-label="Settings"
            >
              <Settings size={18} />
            </Link>

            <button
              type="button"
              onClick={() => {
                setFormMode("create");
                setFormOpen(true);
                setDetailMenuOpen(false);
              }}
              className="rounded-xl bg-black p-2.5 text-white dark:bg-white dark:text-black"
              aria-label="Add reminder"
            >
              <Plus size={18} />
            </button>
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
          <section className="mt-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {FILTERS.map((filter) => {
                const active = activeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveFilter(filter.id)}
                    className={[
                      "rounded-full border px-3 py-1.5 text-sm",
                      active
                        ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                        : "border-zinc-200 dark:border-zinc-800",
                    ].join(" ")}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            {filteredReminders.length ? (
              <div className="grid gap-2">
                {filteredReminders.map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onOpenDetails={(item) => setDetailReminder(item)}
                    todayKey={todayKey}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No reminders in this filter.</p>
            )}
          </section>
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
                const dayReminders = remindersByDate[cell.dateKey] ?? [];
                const hasReminders = Boolean(dayReminders.length);
                const selected = selectedDateKey === cell.dateKey;
                const dayStatus =
                  dayReminders.find((item) => reminderStatus(item, todayKey) === "due")
                    ? "due"
                    : dayReminders.find((item) => reminderStatus(item, todayKey) === "upcoming")
                      ? "upcoming"
                      : dayReminders.length
                        ? "past"
                        : null;
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
                      <span
                        className={[
                          "mt-1 inline-block h-1.5 w-1.5 rounded-full",
                          dayStatus === "due"
                            ? "bg-red-500"
                            : dayStatus === "upcoming"
                              ? "bg-blue-500"
                              : "bg-zinc-400",
                        ].join(" ")}
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}
      </section>

      {detailReminder ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 p-4"
          onClick={() => {
            setDetailReminder(null);
            setDetailMenuOpen(false);
          }}
        >
          <div
            className="mx-auto mt-6 w-full max-w-xl rounded-2xl bg-white p-4 dark:bg-zinc-950 max-h-[92vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{detailReminder.title}</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{formatDate(detailReminder.date)}</p>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDetailMenuOpen((prev) => !prev)}
                  className="rounded-lg border p-2"
                >
                  <MoreVertical size={16} />
                </button>

                {detailMenuOpen ? (
                  <div className="absolute right-0 top-11 z-10 min-w-36 rounded-xl border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <button
                      type="button"
                      onClick={() => {
                        setDetailMenuOpen(false);
                        setFormMode("edit");
                        setFormOpen(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setDetailMenuOpen(false);
                        await deleteReminder(detailReminder.id);
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

            {detailReminder.note ? (
              <p className="mt-3 whitespace-pre-wrap break-words text-sm text-zinc-700 dark:text-zinc-300">
                {detailReminder.note}
              </p>
            ) : (
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">No notes added.</p>
            )}

            <div className="mt-3 flex flex-wrap gap-1.5">
              {(detailReminder.tags ?? []).map((tag) => (
                <span
                  key={`${detailReminder.id}-detail-${tag}`}
                  className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs dark:border-zinc-700"
                >
                  {tag}
                </span>
              ))}
              {((detailReminder.recurrence && detailReminder.recurrence !== "none") ||
              detailReminder.recurring) ? (
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                  {recurrenceLabel(detailReminder.recurrence)}
                </span>
              ) : null}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  await toggleDone(detailReminder.id);
                }}
                className="inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm"
              >
                <Check size={14} />
                {detailReminder.completed ? "Mark as not done" : "Mark as done"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDetailReminder(null);
                  setDetailMenuOpen(false);
                }}
                className="rounded-xl border px-3 py-2 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ReminderFormModal
        mode={formMode}
        reminder={detailReminder}
        open={formOpen}
        submitting={formSubmitting}
        onClose={() => {
          setFormOpen(false);
          setDetailMenuOpen(false);
        }}
        onSubmit={submitReminderForm}
      />

      {selectedDateKey && view === "calendar" ? (
        <div className="fixed inset-0 z-30 bg-black/20" onClick={() => setSelectedDateKey(null)}>
          <div
            className="fixed bottom-0 left-0 right-0 rounded-t-2xl bg-white p-4 dark:bg-zinc-950"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="font-medium">{formatDate(selectedDateKey)}</p>
              <button type="button" onClick={() => setSelectedDateKey(null)} className="rounded-lg border p-1.5">
                <X size={16} />
              </button>
            </div>
            {selectedDateReminders.length ? (
              <div className="grid max-h-72 gap-2 overflow-y-auto">
                {selectedDateReminders.map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onOpenDetails={(item) => {
                      setSelectedDateKey(null);
                      setDetailReminder(item);
                    }}
                    todayKey={todayKey}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No reminders on this date.</p>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}

