"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { TagPill } from "@/components/cherish/common/TagPill";
import { formatReminderDate } from "@/lib/formatReminderDate";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ReminderBottomSheetReminder = {
  id: string;
  title: string;
  date: string;
  note: string | null;
  reminderTime?: string | null;
  tags: string[] | null;
  completed: boolean | null;
  recurrence: "none" | "daily" | "weekly" | "monthly" | "yearly" | null;
};

type ReminderBottomSheetProps = {
  reminder: ReminderBottomSheetReminder;
  onClose: () => void;
  onMarkDone: (id: string) => void;
  onMarkUndone: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

function recurrenceLabel(recurrence: ReminderBottomSheetReminder["recurrence"]) {
  if (!recurrence || recurrence === "none") return null;
  if (recurrence === "yearly") return "Repeats yearly";
  return `Repeats ${recurrence}`;
}

export function ReminderBottomSheet({
  reminder,
  onClose,
  onMarkDone,
  onMarkUndone,
  onEdit,
  onDelete,
}: ReminderBottomSheetProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const recurrenceText = recurrenceLabel(reminder.recurrence);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 mt-3 h-1 w-10 rounded-full bg-zinc-200" />
        <div className="max-h-[80vh] overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <h3 className="font-serif text-xl font-bold text-zinc-900">{reminder.title}</h3>

          <div className="mt-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            <Clock size={11} />
            {formatReminderDate(reminder.date, reminder.reminderTime)}
          </div>

          {reminder.note ? (
            <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-700">{reminder.note}</p>
          ) : null}

          {reminder.tags?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {reminder.tags.map((tag) => (
                <TagPill key={tag} label={tag} readOnly />
              ))}
            </div>
          ) : null}

          {recurrenceText ? (
            <span className="mt-3 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
              {recurrenceText}
            </span>
          ) : null}

          <div className="mb-2 mt-6 flex flex-col gap-3">
            {reminder.completed ? (
              <button
                type="button"
                className="w-full rounded-2xl bg-zinc-100 py-3 text-sm font-medium text-zinc-700"
                onClick={() => onMarkUndone(reminder.id)}
              >
                Mark as not done
              </button>
            ) : (
              <button
                type="button"
                className="w-full rounded-2xl bg-zinc-900 py-3 text-sm font-medium text-white"
                onClick={() => onMarkDone(reminder.id)}
              >
                Mark as done
              </button>
            )}

            <div className="mt-2 flex justify-between">
              <button
                type="button"
                className="text-sm text-zinc-500"
                onClick={() => onEdit(reminder.id)}
              >
                Edit
              </button>
              <button
                type="button"
                className="text-sm text-[#FF6B6C]"
                onClick={() => setConfirmOpen(true)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this reminder?</DialogTitle>
            <DialogDescription>
              This reminder cannot be recovered after deletion.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                setConfirmOpen(false);
                onDelete(reminder.id);
              }}
              style={{ backgroundColor: "#FF6B6C", color: "white" }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
