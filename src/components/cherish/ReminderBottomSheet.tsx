"use client";

import { useState } from "react";
import { Calendar, Check, Pencil, Trash2, X } from "lucide-react";
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
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-[60] rounded-t-2xl bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mt-3 mb-2 h-1 w-10 rounded-full bg-zinc-200" />
        <div className="max-h-[80vh] overflow-y-auto px-5 pt-2 pb-[max(6rem,calc(4.5rem+env(safe-area-inset-bottom)))]">
          <div className="flex items-start justify-between">
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-zinc-600">
              REMINDER
            </span>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 active:bg-zinc-100"
              onClick={onClose}
              aria-label="Close reminder"
            >
              <X size={16} />
            </button>
          </div>

          <h3 className="mt-3 font-serif text-2xl leading-snug font-bold text-zinc-900">
            {reminder.title}
          </h3>

          <div className="mt-2 flex items-center gap-2 text-sm font-extrabold text-zinc-600">
            <Calendar size={14} />
            {formatReminderDate(reminder.date, reminder.reminderTime)}
          </div>

          {reminder.note ? (
            <>
              <div className="mt-5 mb-1 text-xs font-bold uppercase tracking-widest text-zinc-600">
                NOTE
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-600">
                {reminder.note}
              </p>
            </>
          ) : null}

          {reminder.tags?.length ? (
            <>
              <div className="mt-4 mb-2 text-xs font-bold uppercase tracking-widest text-zinc-600">
                TAGS
              </div>
              <div className="flex flex-wrap gap-2">
                {reminder.tags.map((tag) => (
                  <TagPill key={tag} label={tag} readOnly />
                ))}
              </div>
              {recurrenceText ? (
                <span className="mt-3 inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-500">
                  {recurrenceText}
                </span>
              ) : null}
            </>
          ) : recurrenceText ? (
            <span className="mt-4 inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-500">
              {recurrenceText}
            </span>
          ) : null}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-[60] border-t border-zinc-100 bg-white px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          {reminder.completed ? (
            <button
              type="button"
              className="flex-1 rounded-full bg-zinc-200 py-3 text-sm font-semibold text-zinc-500"
              onClick={() => onMarkUndone(reminder.id)}
            >
              Mark as not done
            </button>
          ) : (
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FF6B6C] py-3 text-sm font-bold text-white"
              onClick={() => onMarkDone(reminder.id)}
            >
              <Check size={15} />
              Mark done
            </button>
          )}

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 active:bg-zinc-100"
            onClick={() => onEdit(reminder.id)}
            aria-label="Edit reminder"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 text-[#FF6B6C] active:bg-red-50"
            onClick={() => setConfirmOpen(true)}
            aria-label="Delete reminder"
          >
            <Trash2 size={16} />
          </button>
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
