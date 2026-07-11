import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms",
};

export default function TermsPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-6 py-24">
      <Link href="/" className="font-serif text-xl font-bold text-[#FF6B6C]">
        Cherish
      </Link>
      <h1 className="font-serif text-3xl font-bold text-zinc-900">Terms of Service</h1>
      <div className="flex flex-col gap-4 font-sans text-sm leading-relaxed text-zinc-600">
        <p>
          The full terms of service are being finalized ahead of public launch. Until
          then, the short version:
        </p>
        <p>
          Cherish is in early access and free to use. Your content stays yours. Use the
          app kindly and lawfully, and understand that early-access software can change
          as it grows.
        </p>
      </div>
    </main>
  );
}
