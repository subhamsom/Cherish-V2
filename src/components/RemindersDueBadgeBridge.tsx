"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useReminders } from "@/hooks/useReminders";

function todayLocalYmd(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type RemindersDueContextValue = {
  hasDueIncompleteReminders: boolean;
};

const RemindersDueContext = createContext<RemindersDueContextValue | null>(
  null,
);

export function RemindersDueProvider({ children }: { children: ReactNode }) {
  const { data } = useReminders();
  const hasDue = (data ?? []).some(
    (r) => r.completed !== true && r.date?.trim() <= todayLocalYmd(),
  );

  const value = useMemo(
    () => ({ hasDueIncompleteReminders: hasDue }),
    [hasDue],
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
