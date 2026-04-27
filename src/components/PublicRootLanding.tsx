import SignInOAuthButtons from "@/components/SignInOAuthButtons";

/**
 * Shown at `/` when there is no Supabase session — replaces the old full-screen demo feed
 * so localhost clearly means “not signed in” vs the real app after login.
 */
export default function PublicRootLanding() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-zinc-100 px-6 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Cherish
        </h1>
        <p className="text-sm leading-relaxed text-zinc-600">
          Use the same URL you use for dev (
          <span className="font-mono text-zinc-800">http://localhost:3000</span>
          ) so session cookies stay on this browser. After sign-in, this page shows your
          real memories.
        </p>
        <SignInOAuthButtons />
        <p className="text-xs text-zinc-500">
          Cursor’s Simple Browser does not share cookies with Chrome — sign in here too
          if you test in this panel.
        </p>
      </div>
    </main>
  );
}
