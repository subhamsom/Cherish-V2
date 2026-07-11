import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-6 py-24">
      <Link href="/" className="font-serif text-xl font-bold text-[#FF6B6C]">
        Cherish
      </Link>
      <h1 className="font-serif text-3xl font-bold text-zinc-900">Privacy</h1>
      <div className="flex flex-col gap-4 font-sans text-sm leading-relaxed text-zinc-600">
        <p>
          The full privacy policy is being finalized ahead of public launch. Until then,
          the short version — which will remain true in the long version:
        </p>
        <p>
          Your memories are stored privately and belong to you. They are used for one
          thing: building your partner&apos;s portrait inside your own account. They are
          never shared with other people, never sold, and never shown to your partner.
        </p>
        <p>Deleting your account deletes your memories, reminders, and portrait.</p>
      </div>
    </main>
  );
}
