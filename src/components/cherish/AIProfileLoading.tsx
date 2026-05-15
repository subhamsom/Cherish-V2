"use client";

import { useEffect, useRef, useState } from "react";
import { ConstellationCanvas } from "@/components/cherish/ConstellationCanvas";

const WHISPER_LINES = [
  (p: string) => `Finding the shape of ${p} stillness`,
  (p: string) => `Holding the things ${p} said softly`,
  () => "Gathering small joys from the moments you saved",
  () => "Threading the patterns you never named",
  () => "Reading what care looks like between you",
  (p: string) => `Putting ${p} together, piece by piece`,
] as const;

const CYCLE_MS = 4200;
const FADE_MS = 500;

const DOT_DELAYS = ["0s", "0.18s", "0.36s", "0.54s", "0.72s"] as const;

export type AIProfileLoadingProps = {
  firstName: string;
  memoryCount: number;
  possessivePronoun: string;
};

export function AIProfileLoading({
  firstName,
  memoryCount,
  possessivePronoun,
}: AIProfileLoadingProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const whispers = WHISPER_LINES.map((line) => line(possessivePronoun));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setVisible(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIndex((prev) => (prev + 1) % whispers.length);
        setVisible(true);
        timeoutRef.current = null;
      }, FADE_MS);
    }, CYCLE_MS);

    return () => {
      clearInterval(intervalId);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [whispers.length]);

  const line3Text =
    memoryCount >= 20
      ? `Weaving ${memoryCount} moments into a clearer picture`
      : "Weaving your moments into a clearer picture";

  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{
        height: "100dvh",
        overflow: "hidden",
        background:
          "radial-gradient(120% 70% at 50% 42%, rgba(255, 214, 207, 0.78) 0%, rgba(255, 232, 220, 0.32) 30%, rgba(250, 248, 244, 0) 62%), #fafafa",
      }}
    >
      <style>{`
        @keyframes ch-soul-pulse {
          0%, 100% { opacity: 0.22; transform: scale(1); }
          50%       { opacity: 1;    transform: scale(1.25); }
        }
      `}</style>

      <div className="flex justify-center pt-[14px]">
        <div className="flex items-center gap-2">
          <span
            className="shrink-0 rounded-full bg-[#FF6B6C]"
            style={{
              width: 5,
              height: 5,
              animation: "ch-soul-pulse 1.8s ease-in-out infinite",
            }}
            aria-hidden
          />
          <span className="font-sans text-xs uppercase tracking-widest text-zinc-400">
            UPDATING
          </span>
        </div>
      </div>

      <div className="px-8 pt-[34px] text-center">
        <p className="font-serif text-[26px] font-normal leading-[1.22] text-zinc-900">
          Quietly listening to
        </p>
        <p className="font-serif text-[26px] italic leading-[1.22] text-[#FF6B6C]">{firstName}</p>
        <p className="mt-[10px] font-sans text-sm text-zinc-400">{line3Text}</p>
      </div>

      <div className="relative min-h-0 flex-1">
        <ConstellationCanvas />
      </div>

      <div className="px-[28px] pb-[calc(5rem+env(safe-area-inset-bottom))] text-center">
        <div className="relative min-h-[60px]">
          {whispers.map((line, i) => (
            <p
              key={i}
              className={`absolute inset-0 flex items-center justify-center px-3 font-serif text-[18px] font-normal italic leading-[1.35] text-zinc-500 transition-[opacity,transform] duration-[1400ms] ease-[ease] ${
                i === index && visible ? "translate-y-0 opacity-100" : "translate-y-[8px] opacity-0"
              }`}
            >
              {line}
            </p>
          ))}
        </div>
        <div className="mt-[18px] flex justify-center gap-2">
          {DOT_DELAYS.map((delay) => (
            <span
              key={delay}
              className="rounded-full bg-[#FF6B6C] opacity-25"
              style={{
                width: 4,
                height: 4,
                animation: `ch-soul-pulse 1.8s ${delay} ease-in-out infinite`,
              }}
              aria-hidden
            />
          ))}
        </div>
      </div>
    </div>
  );
}
