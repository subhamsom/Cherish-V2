import { LandingReveal } from "@/components/cherish/landing/LandingReveal";

export type LandingWhisperProps = {
  text: string;
};

export function LandingWhisper({ text }: LandingWhisperProps) {
  return (
    <LandingReveal className="px-8 py-8">
      <p className="text-center font-serif text-xl italic leading-relaxed text-[#22315F]/65 md:text-2xl">
        {text}
      </p>
    </LandingReveal>
  );
}
