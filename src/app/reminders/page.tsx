"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/formatDate";
import { Calendar, List, X } from "lucide-react";
import MobileBottomNav from "@/components/MobileBottomNav";
import { ReminderCard } from "@/components/cherish/cards/ReminderCard";
import { ReminderBottomSheet } from "@/components/cherish/ReminderBottomSheet";

function emitRemindersChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cherish-reminders-changed"));
  }
}

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
  reminder_time?: string | null;
};

type CalendarCell = {
  date: Date;
  inCurrentMonth: boolean;
  dateKey: string;
};

type ReminderFilter = "all" | "due" | "upcoming" | "past";

const FILTERS: Array<{ id: ReminderFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "due", label: "Due" },
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
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

function reminderStatus(reminder: Reminder, todayKey: string): "due" | "upcoming" | "past" {
  if (reminder.completed) return "past";
  if (reminder.date <= todayKey) return "due";
  return "upcoming";
}

export default function RemindersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [activeFilter, setActiveFilter] = useState<ReminderFilter>("all");
  const [month, setMonth] = useState(startOfMonthUTC(new Date()));
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [activeReminder, setActiveReminder] = useState<Reminder | null>(null);

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

  async function updateCompletion(id: string, completed: boolean) {
    const response = await fetch(`/api/reminders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    if (!response.ok) return;
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === id ? { ...reminder, completed } : reminder,
      ),
    );
    setActiveReminder(null);
    emitRemindersChanged();
  }

  async function deleteReminder(id: string) {
    const response = await fetch(`/api/reminders/${id}`, { method: "DELETE" });
    if (!response.ok) return;
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
    setActiveReminder((prev) => (prev?.id === id ? null : prev));
    emitRemindersChanged();
  }

  return (
    <main className="min-h-dvh bg-[#fafafa] text-zinc-800">
      <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-[#fafafa]/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3">
          <h1 className="font-serif text-2xl font-bold text-zinc-900">Reminders</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView("list")}
              className={[
                "rounded-full p-2",
                view === "list" ? "text-zinc-900" : "text-zinc-400",
              ].join(" ")}
              aria-label="List view"
            >
              <List size={18} />
            </button>
            <button
              type="button"
              onClick={() => setView("calendar")}
              className={[
                "rounded-full p-2",
                view === "calendar" ? "text-zinc-900" : "text-zinc-400",
              ].join(" ")}
              aria-label="Calendar view"
            >
              <Calendar size={18} />
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-xl px-4 pb-32 pt-4">
        {loading ? <p className="text-sm text-zinc-500">Loading...</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {!loading && !error && view === "list" ? (
          <section>
            <div className="mb-4 flex flex-wrap gap-2">
              {FILTERS.map((filter) => {
                const active = activeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveFilter(filter.id)}
                    className={
                      active
                        ? "rounded-full bg-gray-800 px-3 py-1 text-sm text-white"
                        : "rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                    }
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
                    id={reminder.id}
                    title={reminder.title}
                    note={reminder.note ?? undefined}
                    date={reminder.date}
                    reminderTime={reminder.reminder_time ?? undefined}
                    onClick={() => setActiveReminder(reminder)}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-8 text-center text-sm text-zinc-500">No reminders here.</p>
            )}
          </section>
        ) : null}

        {!loading && !error && view === "calendar" ? (
          <section className="mt-2 rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setMonth(
                    (prev) => new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() - 1, 1)),
                  )
                }
                className="text-sm text-zinc-500"
              >
                Prev
              </button>
              <p className="font-serif text-base font-bold text-zinc-900">{monthLabel(month)}</p>
              <button
                type="button"
                onClick={() =>
                  setMonth(
                    (prev) => new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() + 1, 1)),
                  )
                }
                className="text-sm text-zinc-500"
              >
                Next
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs uppercase tracking-wide text-zinc-400">
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
                const isToday = cell.dateKey === todayKey;
                return (
                  <button
                    key={cell.dateKey}
                    type="button"
                    onClick={() => {
                      if (!hasReminders) return;
                      setSelectedDateKey(cell.dateKey);
                    }}
                    className={[
                      "flex h-11 flex-col items-center justify-center rounded-xl text-sm",
                      cell.inCurrentMonth
                        ? "text-zinc-900"
                        : "text-zinc-300",
                      selected ? "bg-zinc-900 text-white" : "",
                      isToday ? "font-bold" : "",
                    ].join(" ")}
                  >
                    <span>{cell.date.getUTCDate()}</span>
                    {hasReminders ? (
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#FF6B6C]" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}
      </section>

      {activeReminder ? (
        <ReminderBottomSheet
          reminder={{
            id: activeReminder.id,
            title: activeReminder.title,
            date: activeReminder.date,
            note: activeReminder.note,
            reminderTime: activeReminder.reminder_time,
            tags: activeReminder.tags,
            completed: activeReminder.completed,
            recurrence: activeReminder.recurrence,
          }}
          onClose={() => setActiveReminder(null)}
          onMarkDone={(id) => {
            void updateCompletion(id, true);
          }}
          onMarkUndone={(id) => {
            void updateCompletion(id, false);
          }}
          onEdit={(id) => {
            setActiveReminder(null);
            router.push(`/reminders/${id}`);
          }}
          onDelete={(id) => {
            void deleteReminder(id);
            setActiveReminder(null);
          }}
        />
      ) : null}

      {selectedDateKey && view === "calendar" ? (
        <div className="fixed inset-0 z-30 bg-black/20" onClick={() => setSelectedDateKey(null)}>
          <div
            className="fixed bottom-0 left-0 right-0 rounded-t-2xl bg-white p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="font-serif text-base font-bold text-zinc-900">{formatDate(selectedDateKey)}</p>
              <button type="button" onClick={() => setSelectedDateKey(null)} className="rounded-full p-1.5 text-zinc-500">
                <X size={16} />
              </button>
            </div>
            {selectedDateReminders.length ? (
              <div className="grid max-h-72 gap-2 overflow-y-auto">
                {selectedDateReminders.length === 1 ? (
                  <ReminderCard
                    id={selectedDateReminders[0].id}
                    title={selectedDateReminders[0].title}
                    note={selectedDateReminders[0].note ?? undefined}
                    date={selectedDateReminders[0].date}
                    reminderTime={selectedDateReminders[0].reminder_time ?? undefined}
                    onClick={() => {
                      setSelectedDateKey(null);
                      setActiveReminder(selectedDateReminders[0]);
                    }}
                  />
                ) : (
                  selectedDateReminders.map((reminder) => (
                    <ReminderCard
                      key={reminder.id}
                      id={reminder.id}
                      title={reminder.title}
                      note={reminder.note ?? undefined}
                      date={reminder.date}
                      reminderTime={reminder.reminder_time ?? undefined}
                      onClick={() => {
                        setSelectedDateKey(null);
                        setActiveReminder(reminder);
                      }}
                    />
                  ))
                )}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No reminders on this date.</p>
            )}
          </div>
        </div>
      ) : null}

      <MobileBottomNav />
    </main>
  );
}

