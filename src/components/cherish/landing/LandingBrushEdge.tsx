export type LandingBrushEdgeProps = {
  /** Color of the ADJACENT section bleeding into this band (usually the page cream). */
  color: string;
  position?: "top" | "bottom";
};

/**
 * An irregular painted edge between two color bands — the adjacent section's
 * color intrudes into this one like a dry brushstroke, instead of a razor line.
 * Parent section must be `relative`.
 */
export function LandingBrushEdge({ color, position = "top" }: LandingBrushEdgeProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 28"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 h-6 w-full md:h-7 ${
        position === "top" ? "top-0" : "bottom-0 rotate-180"
      }`}
      style={{ color }}
      fill="currentColor"
    >
      <path d="M0 0 H1440 V8 C1390 16 1330 6 1260 12 C1180 19 1120 5 1040 10 C960 15 900 22 820 13 C740 5 680 18 600 11 C520 4 460 20 380 14 C300 8 240 19 160 12 C100 7 40 15 0 9 Z" />
    </svg>
  );
}
