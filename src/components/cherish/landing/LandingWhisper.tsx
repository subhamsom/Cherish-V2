import { LandingReveal } from "@/components/cherish/landing/LandingReveal";

export type LandingWhisperProps = {
  text: string;
};

export function LandingWhisper({ text }: LandingWhisperProps) {
  return (
    <LandingReveal className="px-8 py-6">
      <p className="text-center font-serif text-lg italic leading-relaxed text-zinc-400">
        {text}
      </p>
    </LandingReveal>
  );
}
