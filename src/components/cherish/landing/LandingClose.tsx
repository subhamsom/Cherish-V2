import Link from "next/link";
import SignInOAuthButtons from "@/components/SignInOAuthButtons";
import { LandingReveal } from "@/components/cherish/landing/LandingReveal";

export function LandingClose() {
  return (
    <section className="px-6 pb-16 pt-24 md:pt-32">
      <LandingReveal className="mx-auto flex max-w-md flex-col items-center gap-10 text-center">
        <div className="flex flex-col items-center gap-4">
          <h2 className="font-serif text-3xl font-bold leading-tight text-zinc-900 md:text-4xl">
            Written for two.
            <br />
            Seen by one.
          </h2>
          <p className="max-w-sm font-sans text-base leading-relaxed text-zinc-500">
            Everything you save is private. Never shared, never sold, never anyone
            else&apos;s to read.
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col items-center gap-3">
          <SignInOAuthButtons />
          <p className="font-sans text-xs text-zinc-400">Free to start. Ten seconds to save.</p>
        </div>

        <footer className="flex flex-col items-center gap-3 pt-8">
          <div className="flex flex-col items-center gap-1">
            <p className="font-serif text-lg font-bold text-[#FF6B6C]">Cherish</p>
            <p className="font-sans text-xs text-zinc-400">Your little archive.</p>
          </div>
          <nav className="flex items-center gap-4" aria-label="Legal">
            <Link
              href="/privacy"
              className="font-sans text-xs text-zinc-400 underline-offset-2 transition-colors hover:text-zinc-600 hover:underline"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="font-sans text-xs text-zinc-400 underline-offset-2 transition-colors hover:text-zinc-600 hover:underline"
            >
              Terms
            </Link>
          </nav>
        </footer>
      </LandingReveal>
    </section>
  );
}
