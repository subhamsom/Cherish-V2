import { ChevronDown } from "lucide-react";
import { FAQ_ITEMS } from "@/components/cherish/landing/landing-demo-data";
import { LandingBlob } from "@/components/cherish/landing/LandingBlob";
import { LandingDust } from "@/components/cherish/landing/LandingDust";
import { LandingReveal } from "@/components/cherish/landing/LandingReveal";
import { LandingSectionLabel } from "@/components/cherish/landing/LandingSectionLabel";

export function LandingFaq() {
  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-32">
      <LandingBlob className="top-[10%] left-[-130px] size-[360px] bg-[#FFB4B4] opacity-[0.06]" />
      <LandingDust />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
        <LandingSectionLabel text="Questions, answered" />
        <h2 className="font-serif text-3xl font-bold text-zinc-900 md:text-4xl">
          The things people ask.
        </h2>
      </div>

      <div className="relative mx-auto mt-14 flex max-w-xl flex-col gap-3">
        {FAQ_ITEMS.map((item, i) => (
          <LandingReveal key={item.question} delay={Math.min(i * 60, 240)}>
            <details className="group rounded-2xl bg-white shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-serif text-base font-bold text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B6C] [&::-webkit-details-marker]:hidden">
                {item.question}
                <ChevronDown
                  size={16}
                  className="shrink-0 text-zinc-400 transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="px-5 pb-5 font-sans text-sm leading-relaxed text-zinc-600">
                {item.answer}
              </p>
            </details>
          </LandingReveal>
        ))}
      </div>
    </section>
  );
}
