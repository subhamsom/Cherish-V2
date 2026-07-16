import { ArrowRight, Palette, PenLine, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LandingGrain } from "@/components/cherish/landing/LandingGrain";
import { LandingReveal } from "@/components/cherish/landing/LandingReveal";
import { TiltCard } from "@/components/cherish/landing/TiltCard";

type Pillar = {
  icon: LucideIcon;
  title: string;
  color: string;
  body: string;
  linkLabel: string;
  href: string;
  soon?: boolean;
};

const PILLARS: Pillar[] = [
  {
    icon: PenLine,
    title: "Save",
    color: "#22315F",
    body: "A line they said, a photo, a voice note. Ten seconds, before the moment slips.",
    linkLabel: "See the moments",
    href: "#moments",
  },
  {
    icon: Palette,
    title: "See",
    color: "#BC4B3C",
    body: "Cherish reads across everything you keep and paints a portrait of who they are.",
    linkLabel: "Meet the portrait",
    href: "#portrait",
  },
  {
    icon: Sparkles,
    title: "Ask",
    color: "#B8863B",
    body: "Gift ideas, what to say, what matters — answered from what you saved.",
    linkLabel: "Preview Ask",
    href: "#ask",
    soon: true,
  },
];

export function LandingHowItWorks() {
  return (
    <section id="how" className="relative overflow-hidden px-6 py-16 md:py-20">
      <LandingGrain />
      <div className="relative mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
        {PILLARS.map((pillar, i) => (
          <LandingReveal key={pillar.title} delay={i * 120}>
            <TiltCard maxTilt={3} className="h-full">
              <div className="flex h-full flex-col gap-3 rounded-2xl bg-white p-6">
                <span
                  className="flex size-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: pillar.color }}
                >
                  <pillar.icon size={20} className="text-white" aria-hidden />
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <h3 className="font-sans text-sm font-bold uppercase tracking-[0.18em] text-[#22315F]">
                    {pillar.title}
                  </h3>
                  {pillar.soon ? (
                    <span className="rounded-full bg-[#F7F1E6] px-2 py-0.5 font-sans text-[10px] font-semibold text-[#22315F]/70">
                      Soon
                    </span>
                  ) : null}
                </div>
                <span
                  className="h-[3px] w-6 rounded-full"
                  style={{ backgroundColor: pillar.color }}
                  aria-hidden
                />
                <p className="font-sans text-sm leading-relaxed text-[#22315F]/75">
                  {pillar.body}
                </p>
                <a
                  href={pillar.href}
                  className="mt-auto inline-flex items-center gap-1.5 pt-2 font-sans text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-75"
                  style={{ color: pillar.color }}
                >
                  {pillar.linkLabel}
                  <ArrowRight size={13} aria-hidden />
                </a>
              </div>
            </TiltCard>
          </LandingReveal>
        ))}
      </div>
    </section>
  );
}
