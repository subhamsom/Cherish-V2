import Image from "next/image";
import Link from "next/link";
import SignInOAuthButtons from "@/components/SignInOAuthButtons";
import { LandingGrain } from "@/components/cherish/landing/LandingGrain";
import { LandingReveal } from "@/components/cherish/landing/LandingReveal";

export function LandingClose() {
  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-20 md:pt-28">
      <LandingGrain />
      <LandingReveal className="relative mx-auto flex max-w-md flex-col items-center gap-10 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative size-24 overflow-hidden rounded-full shadow-[0_14px_30px_-10px_rgba(45,27,27,0.35)] ring-4 ring-white">
            <Image
              src="/landing/hero-portrait-mobile.jpg"
              alt=""
              fill
              sizes="96px"
              className="object-cover"
              style={{ objectPosition: "30% 28%" }}
              aria-hidden
            />
          </div>
          <h2 className="font-serif text-4xl font-bold leading-tight text-[#22315F] md:text-5xl">
            Written for two.
            <br />
            Seen by <em className="italic">one</em>
            <span className="text-[#BC4B3C]">.</span>
          </h2>
          <p className="max-w-sm font-sans text-base leading-relaxed text-[#22315F]/75">
            Everything you save is private. Never shared, never sold, never anyone
            else&apos;s to read.
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col items-center gap-3">
          <SignInOAuthButtons />
          <p className="font-sans text-xs text-[#22315F]/60">
            Free to start. Ten seconds to save.
          </p>
        </div>

        <footer className="flex flex-col items-center gap-3 pt-8">
          <div className="flex flex-col items-center gap-1">
            <p className="font-serif text-lg font-bold text-[#FF6B6C]">Cherish</p>
            <p className="font-sans text-xs text-[#22315F]/60">Your little archive.</p>
          </div>
          <nav className="flex items-center gap-4" aria-label="Legal">
            <Link
              href="/privacy"
              className="font-sans text-xs text-[#22315F]/60 underline-offset-2 transition-colors hover:text-[#22315F] hover:underline"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="font-sans text-xs text-[#22315F]/60 underline-offset-2 transition-colors hover:text-[#22315F] hover:underline"
            >
              Terms
            </Link>
          </nav>
        </footer>
      </LandingReveal>
    </section>
  );
}
