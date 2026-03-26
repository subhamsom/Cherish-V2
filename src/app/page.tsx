"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const redirectTo = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) throw error;
    } catch (err) {
      console.error("Google sign-in error:", err);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 bg-white dark:bg-black">
      <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Cherish
      </h1>
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={loading}
        className="px-5 py-3 rounded-lg bg-black text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {loading ? "Redirecting..." : "Sign in with Google"}
      </button>
    </main>
  );
}
