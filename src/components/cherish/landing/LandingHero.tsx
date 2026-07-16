import { ChevronDown } from "lucide-react";
import Image from "next/image";
import SignInOAuthButtons from "@/components/SignInOAuthButtons";
import { TiltCard } from "@/components/cherish/landing/TiltCard";

const NAVY = "#22315F";

function ScrollCue({ className = "" }: { className?: string }) {
  return (
    <a
      href="#how"
      className={`flex items-center gap-1 transition-opacity hover:opacity-70 ${className}`}
    >
      <span
        className="font-sans text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: NAVY }}
      >
        See how it works
      </span>
      <ChevronDown size={16} className="motion-safe:animate-bounce" style={{ color: NAVY }} aria-hidden />
    </a>
  );
}

export function LandingHero() {
  return (
    <section className="flex flex-col overflow-hidden bg-[#F7F1E6] md:h-dvh">
      {/* Header on its own cream strip, fully separate from the image */}
      <header className="flex shrink-0 items-center justify-between px-6 py-6 md:px-10">
        <p className="font-serif text-3xl font-bold text-[#FF6B6C] md:text-4xl">Cherish</p>
        <SignInOAuthButtons compact />
      </header>

      {/* Mobile: image first, then text below it — never overlaid (unchanged) */}
      <div className="flex flex-col md:hidden">
        <div className="relative mx-6 mb-8 aspect-[408/420] overflow-hidden rounded-2xl shadow-sm">
          <Image
            src="/landing/hero-portrait-mobile.jpg"
            alt="A painterly portrait taking shape on an easel."
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-5 px-6 pb-8">
          <h1
            className="font-serif text-4xl font-bold leading-tight"
            style={{ color: NAVY }}
          >
            A portrait of the person you love.
          </h1>
          <p className="font-sans text-base leading-relaxed" style={{ color: `${NAVY}D9` }}>
            Cherish is where you save the small things about your partner — a line
            they said, a photo, a moment worth keeping. Save it as it happens, and
            Cherish quietly turns it into a living portrait of who they are.
          </p>
          <p className="font-sans text-xs" style={{ color: `${NAVY}99` }}>
            Your memories. Private. Only ever yours.
          </p>
        </div>
        <div className="flex justify-center pb-8">
          <ScrollCue />
        </div>
      </div>

      {/* Desktop: the photo fills everything below the header; the easel
          cutout stands on the bottom edge and tilts independently. */}
      <div className="relative hidden md:block md:min-h-0 md:flex-1">
        <div className="absolute inset-0">
          <Image
            src="/landing/hero-portrait-desktop.jpg"
            alt="A quiet artist's studio wall beside a table with kept photographs, a pressed flower, and a handwritten note."
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div className="relative z-10 flex h-full items-center px-14 lg:px-20">
          <div className="flex w-[42%] flex-col gap-6">
            <h1
              className="font-serif text-5xl font-bold leading-tight lg:text-6xl"
              style={{ color: NAVY }}
            >
              A portrait of the person you love.
            </h1>
            <p
              className="max-w-sm font-sans text-lg leading-relaxed"
              style={{ color: `${NAVY}D9` }}
            >
              Cherish is where you save the small things about your partner — a line
              they said, a photo, a moment worth keeping. Save it as it happens, and
              Cherish quietly turns it into a living portrait of who they are.
            </p>
            <p className="font-sans text-xs" style={{ color: `${NAVY}99` }}>
              Your memories. Private. Only ever yours.
            </p>
            <ScrollCue className="mt-6" />
          </div>

          <div className="flex h-full w-[58%] justify-center">
            <TiltCard
              variant="cutout"
              maxTilt={5}
              lightMaskSrc="/landing/hero-portrait-desktop-easel.png"
              className="aspect-[1536/2730] h-full"
            >
              <Image
                src="/landing/hero-portrait-desktop-easel.png"
                alt="A hand-painted portrait taking shape on an easel."
                fill
                priority
                sizes="35vw"
                className="object-contain"
              />
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}
