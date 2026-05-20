import { PublicLandingBlobs } from "@/components/cherish/PublicLandingBlobs";
import SignInOAuthButtons from "@/components/SignInOAuthButtons";

export default function PublicRootLanding() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#fafafa] px-6 text-center">
      <PublicLandingBlobs />
      <div className="relative z-10 flex w-full max-w-xs flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <p className="font-serif text-5xl font-bold text-[#FF6B6C]">Cherish</p>
          <h1 className="font-serif text-2xl font-bold text-zinc-900">
            A portrait of the person you love.
          </h1>
          <p className="max-w-xs font-sans text-base leading-relaxed text-zinc-500">
            Save the moments. Cherish shows you what they mean.
          </p>
        </div>
        <SignInOAuthButtons />
        <p className="font-sans text-xs text-zinc-400">Your memories. Private. Only ever yours.</p>
      </div>
    </main>
  );
}
