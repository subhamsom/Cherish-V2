// Subtle paper/canvas grain overlay — gives flat color bands the same tactile
// quality as the painted hero. Pure SVG noise, no asset request, no animation.

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function LandingGrain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ backgroundImage: NOISE, opacity: 0.045, mixBlendMode: "multiply" }}
    />
  );
}
