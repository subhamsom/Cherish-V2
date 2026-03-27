"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, LogOut, Trash2, X } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export default function SettingsClient({
  userName,
  userEmail,
  memberSince,
}: {
  userName: string;
  userEmail: string;
  memberSince: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      router.replace("/");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch("/api/user/delete", { method: "POST" });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError((json as { error?: string }).error ?? "Could not delete account.");
        return;
      }

      await supabase.auth.signOut();
      router.replace("/");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-6">
      <section className="mx-auto w-full max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

        <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Account
          </h2>
          <div className="mt-3 space-y-2 text-sm">
            <p>
              <span className="text-zinc-500 dark:text-zinc-400">Name:</span> {userName}
            </p>
            <p>
              <span className="text-zinc-500 dark:text-zinc-400">Email:</span> {userEmail}
            </p>
            <p>
              <span className="text-zinc-500 dark:text-zinc-400">Member since:</span> {memberSince}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Session
          </h2>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm dark:border-zinc-700"
          >
            <LogOut size={16} />
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </section>

        <section className="rounded-2xl border border-red-200 bg-white p-4 dark:border-red-900 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
            Danger Zone
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Deleting your account will permanently remove your partner, memories, reminders, and settings.
          </p>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-red-300 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:text-red-400"
          >
            <Trash2 size={16} />
            Delete account
          </button>
          {error ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
        </section>
      </section>

      {confirmOpen ? (
        <div className="fixed inset-0 z-40 bg-black/40 p-4" onClick={() => setConfirmOpen(false)}>
          <div
            className="mx-auto mt-16 w-full max-w-md rounded-2xl bg-white p-4 dark:bg-zinc-950"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="inline-flex items-center gap-2 text-lg font-semibold">
                <AlertTriangle size={18} />
                Confirm deletion
              </h3>
              <button type="button" onClick={() => setConfirmOpen(false)} className="rounded-lg border p-1.5">
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              This action cannot be undone. Do you want to permanently delete your account and all data?
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  await handleDeleteAccount();
                }}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm text-white disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete account"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-xl border px-4 py-2.5 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

