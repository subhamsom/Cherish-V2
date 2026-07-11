import { MemoryCard } from "@/components/cherish/cards/MemoryCard";
import { DEMO_MEMORIES } from "@/components/cherish/landing/landing-demo-data";
import { LandingBlob } from "@/components/cherish/landing/LandingBlob";
import { LandingDust } from "@/components/cherish/landing/LandingDust";
import { LandingReveal } from "@/components/cherish/landing/LandingReveal";
import { LandingSectionLabel } from "@/components/cherish/landing/LandingSectionLabel";
import { LandingVoiceCard } from "@/components/cherish/landing/LandingVoiceCard";

const LIFT = "transition-transform duration-300 motion-safe:hover:-translate-y-1";

export function LandingMoments() {
  const [wall, joke, book, tuesday] = DEMO_MEMORIES;

  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-32">
      <LandingBlob className="top-[-60px] right-[-140px] size-[420px] bg-[#FF6B6C] opacity-[0.05]" />
      <LandingDust />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
        <LandingSectionLabel text="It starts with moments" />
        <h2 className="font-serif text-3xl font-bold text-zinc-900 md:text-4xl">
          Ten seconds to save.
        </h2>
        <p className="max-w-md font-sans text-base leading-relaxed text-zinc-500">
          A line, a photo, a voice note. No streaks. No feeds. Just the small things
          you&apos;d otherwise forget.
        </p>
      </div>

      <div className="relative mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
        <LandingReveal className={LIFT}>
          <MemoryCard
            title={wall.title}
            content={wall.content}
            memoryDate={wall.memoryDate}
            tags={wall.tags}
            imageUrl={wall.imageUrl}
          />
        </LandingReveal>

        <div className="flex flex-col gap-6 sm:translate-y-6">
          <LandingReveal delay={120} className={LIFT}>
            <MemoryCard
              title={joke.title}
              content={joke.content}
              memoryDate={joke.memoryDate}
              tags={joke.tags}
            />
          </LandingReveal>
          <LandingReveal delay={240} className={LIFT}>
            <LandingVoiceCard />
          </LandingReveal>
        </div>

        <LandingReveal delay={120} className={LIFT}>
          <MemoryCard
            title={book.title}
            content={book.content}
            memoryDate={book.memoryDate}
            tags={book.tags}
          />
        </LandingReveal>

        <LandingReveal delay={240} className={`${LIFT} sm:translate-y-6`}>
          <MemoryCard
            title={tuesday.title}
            content={tuesday.content}
            memoryDate={tuesday.memoryDate}
            tags={tuesday.tags}
          />
        </LandingReveal>
      </div>
    </section>
  );
}
