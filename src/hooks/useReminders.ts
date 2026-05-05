import { useQuery } from "@tanstack/react-query";

export const REMINDERS_QUERY_KEY = ["reminders"] as const;

export type Reminder = {
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

export async function fetchReminders(): Promise<Reminder[]> {
  const response = await fetch("/api/reminders");
  if (!response.ok) {
    throw new Error("Could not load reminders");
  }
  const json = (await response.json()) as { reminders?: Reminder[] };
  const list = json.reminders ?? [];
  return [...list].sort((a, b) => a.date.localeCompare(b.date));
}

export function useReminders() {
  return useQuery({
    queryKey: REMINDERS_QUERY_KEY,
    queryFn: fetchReminders,
  });
}
