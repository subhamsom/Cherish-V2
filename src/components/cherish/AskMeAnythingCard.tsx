import { ChevronRight } from "lucide-react";
import { AnimatedOrb } from "@/components/cherish/AnimatedOrb";

export type AskMeAnythingCardProps = {
  name: string;
  onClick?: () => void;
};

export function AskMeAnythingCard({ name, onClick }: AskMeAnythingCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl bg-[#FFF5F5] p-5 text-left shadow-sm"
    >
      <div className="flex items-center gap-4">
        <AnimatedOrb size={44} />
        <div className="flex flex-1 flex-col">
          <span className="font-serif text-base font-bold text-zinc-900">
            Ask me anything about {name}
          </span>
          <span className="mt-0.5 font-sans text-xs text-zinc-500">
            Gift ideas, what to say, questions only you&apos;d know to ask
          </span>
        </div>
        <ChevronRight size={16} className="shrink-0 text-zinc-400" aria-hidden />
      </div>
    </button>
  );
}
