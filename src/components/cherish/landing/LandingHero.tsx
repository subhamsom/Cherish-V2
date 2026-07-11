"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { ConstellationCanvas } from "@/components/cherish/ConstellationCanvas";
import { PublicLandingBlobs } from "@/components/cherish/PublicLandingBlobs";
import SignInOAuthButtons from "@/components/SignInOAuthButtons";

export function LandingHero() {
  const [motionOk, setMotionOk] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotionOk(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <section
      className="relative flex min-h-dvh flex-col overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 70% at 50% 40%, rgba(255, 214, 207, 0.55) 0%, rgba(255, 232, 220, 0.24) 34%, rgba(250, 248, 244, 0) 64%), #fafafa",
      }}
    >
      <PublicLandingBlobs />
      {motionOk ? (
        <div className="absolute inset-0 animate-in fade-in duration-1000" aria-hidden>
          <ConstellationCanvas />
        </div>
      ) : null}

      <header className="relative z-10 flex justify-center pt-8">
        <p className="font-serif text-2xl font-bold text-[#FF6B6C]">Cherish</p>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12 text-center">
        <div className="flex max-w-2xl flex-col items-center gap-4">
          <h1 className="font-serif text-4xl font-bold leading-tight text-zinc-900 md:text-6xl">
            A portrait of the person you love.
          </h1>
          <p className="max-w-md font-sans text-base leading-relaxed text-zinc-500 md:text-lg">
            Save the moments. Cherish shows you what they mean.
          </p>
        </div>
        <div className="flex w-full max-w-xs flex-col items-center gap-3">
          <SignInOAuthButtons />
          <p className="font-sans text-xs text-zinc-400">
            Your memories. Private. Only ever yours.
          </p>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-1 pb-8">
        <span className="font-sans text-[11px] uppercase tracking-widest text-zinc-400">
          See how it works
        </span>
        <ChevronDown size={16} className="text-zinc-400 motion-safe:animate-bounce" aria-hidden />
      </div>
    </section>
  );
}
