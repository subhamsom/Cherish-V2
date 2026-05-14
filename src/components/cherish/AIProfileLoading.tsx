"use client";

import { useEffect, useRef, useState } from "react";

const MESSAGES = [
  "Reading through your moments...",
  "Looking for the patterns only you would notice...",
  "Putting her together, piece by piece...",
  "Almost there...",
] as const;

const CYCLE_MS = 2500;
const FADE_MS = 500;

export function AIProfileLoading() {
  const [index, setIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setOpacity(0);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIndex((prev) => (prev + 1) % MESSAGES.length);
        setOpacity(1);
        timeoutRef.current = null;
      }, FADE_MS);
    }, CYCLE_MS);

    return () => {
      clearInterval(intervalId);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center py-10">
      <div
        className="size-16 shrink-0 rounded-full bg-[#FF6B6C] animate-pulse"
        aria-hidden
      />
      <p
        className={`mt-6 max-w-sm text-center font-sans text-sm italic text-zinc-400 transition-opacity duration-500 ${
          opacity === 1 ? "opacity-100" : "opacity-0"
        }`}
      >
        {MESSAGES[index]}
      </p>
    </div>
  );
}
