import { MemoryCard } from "@/components/cherish/cards/MemoryCard";
import { DEMO_MEMORIES } from "@/components/cherish/landing/landing-demo-data";
import { LandingGrain } from "@/components/cherish/landing/LandingGrain";
import { LandingReveal } from "@/components/cherish/landing/LandingReveal";
import { LandingSectionLabel } from "@/components/cherish/landing/LandingSectionLabel";
import { LandingVoiceCard } from "@/components/cherish/landing/LandingVoiceCard";
import { TiltCard } from "@/components/cherish/landing/TiltCard";

function KeepsakeTape() {
  return (
    <span
      aria-hidden
      className="absolute left-1/2 top-2 z-10 h-6 w-24 -translate-x-1/2 -rotate-2 rounded-[2px] bg-[#EAE0C9]/80 shadow-[0_1px_2px_rgba(45,27,27,0.18)]"
    />
  );
}

export function LandingMoments() {
  const [wall, joke, book, tuesday] = DEMO_MEMORIES;

  return (
    <section id="moments" className="relative overflow-hidden px-6 py-20 md:py-28">
      <LandingGrain />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
        <LandingSectionLabel text="It starts with moments" />
        <h2 className="font-serif text-4xl font-bold text-[#22315F] md:text-5xl">
          Ten seconds to <em className="italic">save</em>
          <span className="text-[#BC4B3C]">.</span>
        </h2>
        <p className="max-w-md font-sans text-base leading-relaxed text-[#22315F]/75">
          A line, a photo, a voice note. No streaks. No feeds. Just the small things
          you&apos;d otherwise forget.
        </p>
      </div>

      <div className="relative mx-auto mt-14 max-w-5xl columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6 [&>*]:break-inside-avoid">
        <LandingReveal>
          <TiltCard maxTilt={4}>
            <div className="relative">
              <KeepsakeTape />
              <MemoryCard
                title={wall.title}
                content={wall.content}
                memoryDate={wall.memoryDate}
                tags={wall.tags}
                imageUrl={wall.imageUrl}
              />
            </div>
          </TiltCard>
        </LandingReveal>

        <LandingReveal delay={100}>
          <TiltCard maxTilt={4}>
            <MemoryCard
              title={joke.title}
              content={joke.content}
              memoryDate={joke.memoryDate}
              tags={joke.tags}
            />
          </TiltCard>
        </LandingReveal>

        <LandingReveal delay={200}>
          <TiltCard maxTilt={4}>
            <LandingVoiceCard />
          </TiltCard>
        </LandingReveal>

        <LandingReveal delay={150}>
          <TiltCard maxTilt={4}>
            <MemoryCard
              title={book.title}
              content={book.content}
              memoryDate={book.memoryDate}
              tags={book.tags}
            />
          </TiltCard>
        </LandingReveal>

        <LandingReveal delay={250}>
          <TiltCard maxTilt={4}>
            <MemoryCard
              title={tuesday.title}
              content={tuesday.content}
              memoryDate={tuesday.memoryDate}
              tags={tuesday.tags}
            />
          </TiltCard>
        </LandingReveal>
      </div>
    </section>
  );
}
