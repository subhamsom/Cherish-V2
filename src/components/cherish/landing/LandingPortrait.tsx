"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { AIProfileCard } from "@/components/cherish/AIProfileCard";
import {
  DEMO_MEMORIES,
  DEMO_PORTRAIT_CARDS,
  type DemoPortraitCard,
} from "@/components/cherish/landing/landing-demo-data";
import { LandingBrushEdge } from "@/components/cherish/landing/LandingBrushEdge";
import { LandingGrain } from "@/components/cherish/landing/LandingGrain";
import { LandingReveal } from "@/components/cherish/landing/LandingReveal";
import { LandingSectionLabel } from "@/components/cherish/landing/LandingSectionLabel";
import { TiltCard } from "@/components/cherish/landing/TiltCard";

function formatEvidenceDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function PortraitCardWithEvidence({
  item,
  isFirst,
}: {
  item: DemoPortraitCard;
  isFirst: boolean;
}) {
  const [open, setOpen] = useState(false);
  const evidence = DEMO_MEMORIES.filter((m) => item.evidence.includes(m.id));

  return (
    <div className="flex flex-col gap-2">
      <TiltCard maxTilt={4}>
        <AIProfileCard card={item.card} isFirst={isFirst} />
      </TiltCard>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center justify-end gap-1 self-end rounded-full px-2 py-1 font-sans text-xs font-medium text-[#22315F]/75 transition-colors hover:text-[#22315F] focus:outline-2 focus:outline-offset-2 focus:outline-[#FF6B6C]"
      >
        the moments behind this
        <ChevronDown
          size={13}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open ? (
        <div className="rounded-2xl bg-[#22315F]/[0.06] px-5 py-4">
          <p className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-widest text-[#22315F]/70">
            From the moments you saved
          </p>
          <ul className="flex flex-col gap-2">
            {evidence.map((m) => (
              <li key={m.id} className="flex items-baseline justify-between gap-3">
                <span className="font-serif text-sm font-bold text-[#22315F]">{m.title}</span>
                <span className="shrink-0 font-sans text-xs text-[#22315F]/55">
                  {formatEvidenceDate(m.memoryDate)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function LandingPortrait() {
  return (
    <section
      id="portrait"
      className="relative overflow-hidden bg-[#F1E7D6] px-6 pb-24 pt-20 md:pb-32 md:pt-24"
    >
      <LandingBrushEdge color="#F7F1E6" position="top" />
      <LandingBrushEdge color="#F7F1E6" position="bottom" />
      <LandingGrain />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
        <LandingSectionLabel text="Then, a portrait" />
        <h2 className="font-serif text-4xl font-bold text-[#22315F] md:text-5xl">
          Built from what you <em className="italic">keep</em>
          <span className="text-[#BC4B3C]">.</span>
        </h2>
        <p className="max-w-md font-sans text-base leading-relaxed text-[#22315F]/75">
          Cherish reads across everything you save — patterns you never named, put in
          plain words. Tap a card to see the moments behind it.
        </p>
      </div>

      <div className="relative mx-auto mt-14 flex max-w-md flex-col gap-6 lg:max-w-5xl lg:grid lg:grid-cols-3 lg:items-start">
        {DEMO_PORTRAIT_CARDS.map((item, i) => (
          <LandingReveal key={item.card.title} delay={i * 130}>
            <PortraitCardWithEvidence item={item} isFirst={i === 0} />
          </LandingReveal>
        ))}
      </div>
    </section>
  );
}
