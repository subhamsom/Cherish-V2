import { Mic } from "lucide-react";
import { TagPill } from "@/components/cherish/common/TagPill";
import { DEMO_VOICE_NOTE } from "@/components/cherish/landing/landing-demo-data";

// Static waveform bar heights (px) — deterministic so SSR and client match.
const WAVE_BARS = [
  6, 10, 16, 12, 20, 14, 8, 18, 22, 16, 10, 14, 20, 12, 6, 10, 16, 24, 18, 12, 8, 14, 10, 6,
] as const;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function LandingVoiceCard() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="flex flex-col gap-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {formatDate(DEMO_VOICE_NOTE.memoryDate)}
        </p>

        <h3 className="font-serif text-lg font-bold leading-snug text-gray-900">
          {DEMO_VOICE_NOTE.title}
        </h3>

        <div className="flex items-center gap-3 py-1">
          <Mic size={15} className="shrink-0 text-[#FF6B6C]" aria-hidden />
          <div className="flex h-6 flex-1 items-center gap-[3px]" aria-hidden>
            {WAVE_BARS.map((h, i) => (
              <span
                key={i}
                className="w-[3px] rounded-full bg-[#FF6B6C]/30"
                style={{ height: h }}
              />
            ))}
          </div>
          <span className="shrink-0 font-sans text-xs text-zinc-400">
            {DEMO_VOICE_NOTE.duration}
          </span>
        </div>

        <p className="font-sans text-sm italic leading-relaxed text-zinc-500">
          {DEMO_VOICE_NOTE.transcript}
        </p>

        <div className="mt-1 flex flex-wrap gap-1.5">
          {DEMO_VOICE_NOTE.tags.map((tag) => (
            <TagPill key={tag} label={tag} readOnly />
          ))}
        </div>
      </div>
    </div>
  );
}
