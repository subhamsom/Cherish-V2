"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type TimePickerPopoverProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
};

function parseTime(value: string | null): { hour: number; minute: number; period: "AM" | "PM" } {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) {
    return { hour: 12, minute: 0, period: "AM" as const };
  }
  const [hourStr, minuteStr] = value.split(":");
  const hour24 = Number(hourStr);
  const minute = Number(minuteStr);
  const period = hour24 >= 12 ? ("PM" as const) : ("AM" as const);
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour: hour12, minute, period };
}

function to24Hour(hour12: number, minute: number, period: "AM" | "PM") {
  let hour24 = hour12;
  if (period === "AM") {
    if (hour12 === 12) hour24 = 0;
  } else if (hour12 !== 12) {
    hour24 = hour12 + 12;
  }
  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatDisplay(value: string | null) {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return null;
  const [hourStr, minuteStr] = value.split(":");
  const hour24 = Number(hourStr);
  const minute = Number(minuteStr);
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export function TimePickerPopover({
  value,
  onChange,
  placeholder = "Add time",
}: TimePickerPopoverProps) {
  const parsed = useMemo(() => parseTime(value), [value]);
  const [open, setOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(parsed.hour);
  const [selectedMinute, setSelectedMinute] = useState(parsed.minute);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">(parsed.period);

  useEffect(() => {
    setSelectedHour(parsed.hour);
    setSelectedMinute(parsed.minute);
    setSelectedPeriod(parsed.period);
  }, [parsed.hour, parsed.minute, parsed.period]);

  function emitTime(hour: number, minute: number, period: "AM" | "PM") {
    onChange(to24Hour(hour, minute, period));
  }

  const displayValue = formatDisplay(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full px-1 py-1 text-sm text-zinc-500"
          />
        }
      >
        <Clock className="size-4" />
        <span>{displayValue ?? placeholder}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-3">
        <div className="flex gap-2">
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="mb-1 text-center text-xs uppercase tracking-wide text-zinc-400">HR</p>
            <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
              {HOURS.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  className={[
                    "w-full rounded-lg px-2 py-1.5 text-center text-sm",
                    selectedHour === hour
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-700 hover:bg-zinc-100",
                  ].join(" ")}
                  onClick={() => {
                    setSelectedHour(hour);
                    emitTime(hour, selectedMinute, selectedPeriod);
                  }}
                >
                  {hour}
                </button>
              ))}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <p className="mb-1 text-center text-xs uppercase tracking-wide text-zinc-400">MIN</p>
            <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
              {MINUTES.map((minute) => (
                <button
                  key={minute}
                  type="button"
                  className={[
                    "w-full rounded-lg px-2 py-1.5 text-center text-sm",
                    selectedMinute === minute
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-700 hover:bg-zinc-100",
                  ].join(" ")}
                  onClick={() => {
                    setSelectedMinute(minute);
                    emitTime(selectedHour, minute, selectedPeriod);
                  }}
                >
                  {String(minute).padStart(2, "0")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <p className="mb-1 text-center text-xs uppercase tracking-wide text-zinc-400">AM/PM</p>
            <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
              {(["AM", "PM"] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  className={[
                    "w-full rounded-lg px-2 py-1.5 text-center text-sm",
                    selectedPeriod === period
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-700 hover:bg-zinc-100",
                  ].join(" ")}
                  onClick={() => {
                    setSelectedPeriod(period);
                    emitTime(selectedHour, selectedMinute, period);
                  }}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="mt-2 w-full text-center text-xs text-zinc-400"
          onClick={() => {
            onChange(null);
            setOpen(false);
          }}
        >
          Clear
        </button>
      </PopoverContent>
    </Popover>
  );
}
