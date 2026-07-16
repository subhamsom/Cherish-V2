"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

const ACCENT = "#FF6B6C";

export type SignInOAuthButtonsProps = {
  /** Small nav-style pill instead of the full-width primary button. */
  compact?: boolean;
};

export default function SignInOAuthButtons({ compact = false }: SignInOAuthButtonsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setError(null);
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (oauthError) {
        setError(oauthError.message);
        setLoading(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("Could not start sign-in. Check Supabase Auth settings.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={() => void signInWithGoogle()}
          disabled={loading}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 disabled:opacity-60"
          style={{ backgroundColor: ACCENT }}
        >
          {loading ? "Opening Google…" : "Sign in"}
          <ArrowRight size={14} aria-hidden />
        </button>
        {error ? (
          <p className="text-xs text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-stretch gap-2">
      <button
        type="button"
        onClick={() => void signInWithGoogle()}
        disabled={loading}
        className="h-11 rounded-full text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 disabled:opacity-60"
        style={{ backgroundColor: ACCENT }}
      >
        {loading ? "Opening Google…" : "Continue with Google"}
      </button>
      {error ? (
        <p className="text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
