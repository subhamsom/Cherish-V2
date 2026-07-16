export type LandingSectionLabelProps = {
  text: string;
};

export function LandingSectionLabel({ text }: LandingSectionLabelProps) {
  return (
    <span className="font-sans text-xs font-bold uppercase tracking-[0.25em] text-[#BC4B3C]">
      {text}
    </span>
  );
}
