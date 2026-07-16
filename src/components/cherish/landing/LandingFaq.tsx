import { ChevronDown } from "lucide-react";
import { FAQ_ITEMS } from "@/components/cherish/landing/landing-demo-data";
import { LandingGrain } from "@/components/cherish/landing/LandingGrain";
import { LandingReveal } from "@/components/cherish/landing/LandingReveal";
import { LandingSectionLabel } from "@/components/cherish/landing/LandingSectionLabel";

export function LandingFaq() {
  return (
    <section className="relative overflow-hidden px-6 py-20 md:py-28">
      <LandingGrain />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
        <LandingSectionLabel text="Questions, answered" />
        <h2 className="font-serif text-4xl font-bold text-[#22315F] md:text-5xl">
          The things people <em className="italic">ask</em>
          <span className="text-[#BC4B3C]">.</span>
        </h2>
      </div>

      <div className="relative mx-auto mt-14 flex max-w-2xl flex-col gap-3">
        {FAQ_ITEMS.map((item, i) => (
          <LandingReveal key={item.question} delay={Math.min(i * 60, 240)}>
            <details className="group rounded-2xl bg-white shadow-[0_10px_30px_-12px_rgba(45,27,27,0.18)]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-serif text-base font-bold text-[#22315F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B6C] [&::-webkit-details-marker]:hidden">
                {item.question}
                <ChevronDown
                  size={16}
                  className="shrink-0 text-[#BC4B3C] transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="px-5 pb-5 font-sans text-sm leading-relaxed text-[#22315F]/75">
                {item.answer}
              </p>
            </details>
          </LandingReveal>
        ))}
      </div>
    </section>
  );
}
