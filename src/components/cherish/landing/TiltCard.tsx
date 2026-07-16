"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees at the edge of the card. */
  maxTilt?: number;
  /**
   * "card" (default) clips to a rounded rectangle with a box-shadow — for
   * ordinary photos/content cards. "cutout" skips clipping/rounding, uses a
   * shape-following drop-shadow, and pivots from the bottom edge so the
   * object reads as standing on the ground.
   */
  variant?: "card" | "cutout";
  /**
   * Cutout variant only: the alpha image used to clip the cursor light to the
   * object's silhouette. Without it, the cutout renders no light at all
   * (a rectangular sheen over a transparent PNG gives the shape away).
   */
  lightMaskSrc?: string;
};

const RESTING_BOX_SHADOW = "0 20px 40px -14px rgba(45, 27, 27, 0.18)";
const RESTING_DROP_SHADOW = "drop-shadow(0 14px 20px rgba(45, 27, 27, 0.25))";

export function TiltCard({
  children,
  className = "",
  maxTilt = 6,
  variant = "card",
  lightMaskSrc,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, active: false });
  const [lightBackground, setLightBackground] = useState("transparent");

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setEnabled(mq.matches);
    const update = () => setEnabled(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!enabled || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      setTilt({ rx: (0.5 - py) * maxTilt * 2, ry: (px - 0.5) * maxTilt * 2, active: true });
      setLightBackground(
        `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.3), transparent 55%)`,
      );
    },
    [enabled, maxTilt],
  );

  const handleLeave = useCallback(() => {
    setTilt({ rx: 0, ry: 0, active: false });
    setLightBackground("transparent");
  }, []);

  const isCutout = variant === "cutout";
  const { rx, ry, active } = tilt;

  // Cutout objects stand on the ground: no scale (top edge stays inside the
  // frame) and the pivot sits at the feet, so tilting reads as leaning.
  const transform = isCutout
    ? `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`
    : `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${active ? 1.015 : 1})`;

  const boxShadow = active
    ? `${-ry * 2.2}px ${26 - rx * 2.2}px 45px -14px rgba(45, 27, 27, 0.28)`
    : RESTING_BOX_SHADOW;
  const dropShadow = active
    ? `drop-shadow(${-ry * 1.6}px ${18 - rx * 1.6}px 16px rgba(45, 27, 27, 0.3))`
    : RESTING_DROP_SHADOW;

  const showLight = enabled && (!isCutout || Boolean(lightMaskSrc));

  return (
    <div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={isCutout ? undefined : { boxShadow, transition: "box-shadow 200ms ease-out" }}
    >
      <div
        ref={ref}
        className={`relative h-full w-full will-change-transform ${
          isCutout ? "" : "overflow-hidden rounded-2xl"
        }`}
        style={{
          transform,
          transformOrigin: isCutout ? "50% 100%" : "50% 50%",
          filter: isCutout ? dropShadow : undefined,
          transition: isCutout
            ? "transform 200ms ease-out, filter 200ms ease-out"
            : "transform 200ms ease-out",
        }}
      >
        {children}
        {showLight ? (
          <div
            className="pointer-events-none absolute inset-0 transition-[background] duration-150"
            style={{
              background: lightBackground,
              ...(isCutout && lightMaskSrc
                ? {
                    maskImage: `url(${lightMaskSrc})`,
                    maskSize: "100% 100%",
                    maskRepeat: "no-repeat",
                    WebkitMaskImage: `url(${lightMaskSrc})`,
                    WebkitMaskSize: "100% 100%",
                    WebkitMaskRepeat: "no-repeat",
                  }
                : {}),
            }}
            aria-hidden
          />
        ) : null}
      </div>
    </div>
  );
}
