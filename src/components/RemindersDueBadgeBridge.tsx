"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ReminderRow = {
  date: string;
  completed: boolean | null;
};

function todayLocalYmd(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function reminderHasDueBadge(r: ReminderRow): boolean {
  if (r.completed === true) return false;
  const today = todayLocalYmd();
  const d = (r.date ?? "").trim();
  if (!d) return false;
  return d <= today;
}

type RemindersDueContextValue = {
  hasDueIncompleteReminders: boolean;
  refreshRemindersDue: () => void;
};

const RemindersDueContext = createContext<RemindersDueContextValue | null>(
  null,
);

export function RemindersDueProvider({ children }: { children: ReactNode }) {
  const [hasDue, setHasDue] = useState(false);

  const refreshRemindersDue = useCallback(async () => {
    try {
      const res = await fetch("/api/reminders", { method: "GET" });
      if (!res.ok) return;
      const json = (await res.json()) as { reminders?: ReminderRow[] };
      const list = json.reminders ?? [];
      setHasDue(list.some(reminderHasDueBadge));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void refreshRemindersDue();
  }, [refreshRemindersDue]);

  useEffect(() => {
    const onFocus = () => void refreshRemindersDue();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshRemindersDue]);

  useEffect(() => {
    const onChanged = () => void refreshRemindersDue();
    window.addEventListener("cherish-reminders-changed", onChanged);
    return () => window.removeEventListener("cherish-reminders-changed", onChanged);
  }, [refreshRemindersDue]);

  const value = useMemo(
    () => ({ hasDueIncompleteReminders: hasDue, refreshRemindersDue }),
    [hasDue, refreshRemindersDue],
  );

  return (
    <RemindersDueContext.Provider value={value}>
      {children}
    </RemindersDueContext.Provider>
  );
}

export function useRemindersDue() {
  const ctx = useContext(RemindersDueContext);
  if (!ctx) {
    throw new Error("useRemindersDue must be used within RemindersDueProvider");
  }
  return ctx;
}
