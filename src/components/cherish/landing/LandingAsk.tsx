import { AnimatedOrb } from "@/components/cherish/AnimatedOrb";
import { DEMO_ASK } from "@/components/cherish/landing/landing-demo-data";
import { LandingDust } from "@/components/cherish/landing/LandingDust";
import { LandingReveal } from "@/components/cherish/landing/LandingReveal";
import { LandingSectionLabel } from "@/components/cherish/landing/LandingSectionLabel";

export function LandingAsk() {
  return (
    <section className="relative bg-[#FFF5F5] px-6 py-24 md:py-32">
      <LandingDust />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-3">
          <LandingSectionLabel text="And when it matters" />
          <span className="rounded-full bg-white px-2.5 py-0.5 font-sans text-[11px] font-semibold text-zinc-500 shadow-sm">
            Soon
          </span>
        </div>
        <h2 className="font-serif text-3xl font-bold text-zinc-900 md:text-4xl">
          Ask, like someone was taking notes.
        </h2>
        <p className="max-w-md font-sans text-base leading-relaxed text-zinc-500">
          Gift ideas, what to say, questions only you&apos;d know to ask.
        </p>
      </div>

      <LandingReveal className="relative mx-auto mt-14 max-w-md">
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex justify-end">
            <p className="max-w-[85%] rounded-2xl rounded-br-md bg-zinc-100 px-4 py-3 text-left font-sans text-sm leading-relaxed text-zinc-800">
              {DEMO_ASK.question}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <style>{`
              @keyframes ch-orb-breathe {
                0%, 100% { transform: scale(1); }
                50%      { transform: scale(1.12); }
              }
            `}</style>
            <div
              className="mt-1 shrink-0 motion-safe:[animation:ch-orb-breathe_4s_ease-in-out_infinite]"
            >
              <AnimatedOrb size={28} />
            </div>
            <p className="max-w-[85%] text-left font-sans text-sm leading-relaxed text-zinc-700">
              {DEMO_ASK.answer}
            </p>
          </div>
        </div>
      </LandingReveal>
    </section>
  );
}
