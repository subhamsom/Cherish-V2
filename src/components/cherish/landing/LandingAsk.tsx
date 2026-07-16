import { AnimatedOrb } from "@/components/cherish/AnimatedOrb";
import { DEMO_ASK_EXCHANGES } from "@/components/cherish/landing/landing-demo-data";
import { LandingBrushEdge } from "@/components/cherish/landing/LandingBrushEdge";
import { LandingGrain } from "@/components/cherish/landing/LandingGrain";
import { LandingReveal } from "@/components/cherish/landing/LandingReveal";
import { LandingSectionLabel } from "@/components/cherish/landing/LandingSectionLabel";
import { TiltCard } from "@/components/cherish/landing/TiltCard";

export function LandingAsk() {
  return (
    <section
      id="ask"
      className="relative overflow-hidden bg-[#FFF5F5] px-6 pb-24 pt-20 md:pb-32 md:pt-24"
    >
      <LandingBrushEdge color="#F7F1E6" position="top" />
      <LandingBrushEdge color="#F7F1E6" position="bottom" />
      <LandingGrain />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-3">
          <LandingSectionLabel text="And when it matters" />
          <span className="rounded-full bg-white px-2.5 py-0.5 font-sans text-[11px] font-semibold text-[#22315F]/70 shadow-sm">
            Soon
          </span>
        </div>
        <h2 className="font-serif text-4xl font-bold text-[#22315F] md:text-5xl">
          Ask, like someone was taking <em className="italic">notes</em>
          <span className="text-[#BC4B3C]">.</span>
        </h2>
        <p className="max-w-md font-sans text-base leading-relaxed text-[#22315F]/75">
          Gift ideas, what to say, questions only you&apos;d know to ask.
        </p>
      </div>

      <LandingReveal className="relative mx-auto mt-14 max-w-md md:max-w-lg">
        <TiltCard maxTilt={3}>
          <div className="flex flex-col gap-5 rounded-2xl bg-white p-5 md:p-6">
            {DEMO_ASK_EXCHANGES.map((exchange) => (
              <div key={exchange.question} className="flex flex-col gap-4">
                <div className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl rounded-br-md bg-[#F7F1E6] px-4 py-3 text-left font-sans text-sm leading-relaxed text-[#22315F]">
                    {exchange.question}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <style>{`
                    @keyframes ch-orb-breathe {
                      0%, 100% { transform: scale(1); }
                      50%      { transform: scale(1.12); }
                    }
                  `}</style>
                  <div className="mt-1 shrink-0 motion-safe:[animation:ch-orb-breathe_4s_ease-in-out_infinite]">
                    <AnimatedOrb size={28} />
                  </div>
                  <p className="max-w-[85%] text-left font-sans text-sm leading-relaxed text-[#22315F]/85">
                    {exchange.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </TiltCard>
      </LandingReveal>
    </section>
  );
}
