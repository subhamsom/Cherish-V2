"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { AIProfileCard } from "@/components/cherish/AIProfileCard";
import {
  DEMO_MEMORIES,
  DEMO_PORTRAIT_CARDS,
  type DemoPortraitCard,
} from "@/components/cherish/landing/landing-demo-data";
import { LandingBlob } from "@/components/cherish/landing/LandingBlob";
import { LandingDust } from "@/components/cherish/landing/LandingDust";
import { LandingReveal } from "@/components/cherish/landing/LandingReveal";
import { LandingSectionLabel } from "@/components/cherish/landing/LandingSectionLabel";

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
      <AIProfileCard card={item.card} isFirst={isFirst} />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center justify-end gap-1 self-end rounded-full px-2 py-1 font-sans text-xs text-zinc-400 transition-colors hover:text-zinc-600 focus:outline-2 focus:outline-offset-2 focus:outline-[#FF6B6C]"
      >
        the moments behind this
        <ChevronDown
          size={13}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open ? (
        <div className="rounded-2xl bg-zinc-100/70 px-5 py-4">
          <p className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
            From the moments you saved
          </p>
          <ul className="flex flex-col gap-2">
            {evidence.map((m) => (
              <li key={m.id} className="flex items-baseline justify-between gap-3">
                <span className="font-serif text-sm font-bold text-zinc-700">{m.title}</span>
                <span className="shrink-0 font-sans text-xs text-zinc-400">
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
    <section className="relative overflow-hidden bg-white/60 px-6 py-24 md:py-32">
      <LandingBlob className="top-[30%] left-[-140px] size-[380px] bg-[#FFB4B4] opacity-[0.07]" />
      <LandingDust />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
        <LandingSectionLabel text="Then, a portrait" />
        <h2 className="font-serif text-3xl font-bold text-zinc-900 md:text-4xl">
          Cherish reads across everything you save.
        </h2>
        <p className="max-w-md font-sans text-base leading-relaxed text-zinc-500">
          Patterns you never named, put in plain words. Every insight is drawn from your
          own saved moments — tap a card to see them.
        </p>
      </div>

      <div className="relative mx-auto mt-14 flex max-w-md flex-col gap-6">
        {DEMO_PORTRAIT_CARDS.map((item, i) => (
          <LandingReveal key={item.card.title} delay={i * 150}>
            <PortraitCardWithEvidence item={item} isFirst={i === 0} />
          </LandingReveal>
        ))}
      </div>
    </section>
  );
}
