export type LandingBlobProps = {
  /** Position + size + color classes, e.g. "top-[-80px] right-[-120px] size-[420px] bg-[#FF6B6C] opacity-[0.05]" */
  className: string;
};

/**
 * A single soft off-screen glow, same treatment as the hero's PublicLandingBlobs.
 * The parent section must be `relative overflow-hidden`.
 */
export function LandingBlob({ className }: LandingBlobProps) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full blur-[110px] ${className}`}
      aria-hidden
    />
  );
}
