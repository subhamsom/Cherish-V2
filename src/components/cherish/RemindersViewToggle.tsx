"use client";

import { Calendar, List } from "lucide-react";

type RemindersViewToggleProps = {
  view: "list" | "calendar";
  onChange: (view: "list" | "calendar") => void;
};

export function RemindersViewToggle({ view, onChange }: RemindersViewToggleProps) {
  return (
    <div className="mt-4 inline-flex rounded-full border border-zinc-200 bg-zinc-200 p-1">
      <button
        type="button"
        onClick={() => onChange("list")}
        className={[
          "inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-extrabold",
          view === "list"
            ? "rounded-full bg-white text-zinc-900 shadow-sm"
            : "text-zinc-500",
        ].join(" ")}
      >
        <List className="size-4" />
        List
      </button>
      <button
        type="button"
        onClick={() => onChange("calendar")}
        className={[
          "inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-extrabold",
          view === "calendar"
            ? "rounded-full bg-white text-zinc-900 shadow-sm"
            : "text-zinc-500",
        ].join(" ")}
      >
        <Calendar className="size-4" />
        Calendar
      </button>
    </div>
  );
}
