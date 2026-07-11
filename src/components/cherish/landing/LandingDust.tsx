// Ambient "memory dust" — a few tiny drifting specks that carry the hero's
// constellation feeling down the rest of the page. Positions are hardcoded
// (not random) so server and client render identically.

const DOTS = [
  { left: "8%", top: "12%", size: 3, color: "#FF6B6C", delay: "0s", duration: "9s" },
  { left: "22%", top: "68%", size: 2, color: "#FFB4B4", delay: "1.4s", duration: "11s" },
  { left: "38%", top: "26%", size: 2, color: "#FF6B6C", delay: "3s", duration: "10s" },
  { left: "55%", top: "80%", size: 3, color: "#FFB4B4", delay: "0.8s", duration: "12s" },
  { left: "68%", top: "18%", size: 2, color: "#FF6B6C", delay: "2.2s", duration: "9.5s" },
  { left: "81%", top: "55%", size: 2, color: "#FFB4B4", delay: "4s", duration: "11.5s" },
  { left: "92%", top: "30%", size: 3, color: "#FF6B6C", delay: "1s", duration: "10.5s" },
  { left: "14%", top: "42%", size: 2, color: "#FFB4B4", delay: "5s", duration: "12.5s" },
] as const;

export function LandingDust() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <style>{`
        @keyframes ch-dust-drift {
          0%, 100% { transform: translateY(0); opacity: 0.15; }
          50%      { transform: translateY(-18px); opacity: 0.45; }
        }
      `}</style>
      {DOTS.map((dot, i) => (
        <span
          key={i}
          className="absolute rounded-full motion-safe:[animation:ch-dust-drift_var(--dur)_ease-in-out_infinite]"
          style={
            {
              left: dot.left,
              top: dot.top,
              width: dot.size,
              height: dot.size,
              backgroundColor: dot.color,
              opacity: 0.25,
              animationDelay: dot.delay,
              "--dur": dot.duration,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
