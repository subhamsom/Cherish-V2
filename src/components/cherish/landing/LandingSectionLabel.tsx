export type LandingSectionLabelProps = {
  text: string;
};

export function LandingSectionLabel({ text }: LandingSectionLabelProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <span
        className="inline-block size-[5px] shrink-0 rounded-full bg-[#FF6B6C] motion-safe:animate-pulse"
        aria-hidden
      />
      <span className="font-sans text-xs uppercase tracking-widest text-zinc-400">{text}</span>
    </div>
  );
}
