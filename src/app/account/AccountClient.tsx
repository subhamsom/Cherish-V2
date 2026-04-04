"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export default function AccountClient({
  userName,
  userEmail,
  userInitial,
}: {
  userName: string;
  userEmail: string;
  userInitial: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  /** UI-only; does not change document theme or storage. */
  const [darkModeToggleOn, setDarkModeToggleOn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    setDeleteError(null);
    try {
      const response = await fetch("/api/user/delete", { method: "POST" });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        setDeleteError((json as { error?: string }).error ?? "Could not delete account.");
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
    <>
      <main style={{ padding: "16px", maxWidth: "40rem" }}>
        <h1>Account</h1>

        <section aria-labelledby="profile-heading">
          <h2 id="profile-heading">Profile</h2>
          <div
            style={{
              width: 64,
              height: 64,
              lineHeight: "64px",
              textAlign: "center",
            }}
            role="img"
            aria-label={`${userName} avatar`}
          >
            {userInitial}
          </div>
          <p>{userName}</p>
          <p>
            Email: {userEmail}
          </p>
        </section>

        <hr />

        <section aria-labelledby="preferences-heading">
          <h2 id="preferences-heading">Preferences</h2>
          <p>
            <label htmlFor="dark-mode-switch">Dark mode</label>
            <Switch
              id="dark-mode-switch"
              checked={darkModeToggleOn}
              onCheckedChange={setDarkModeToggleOn}
            />
          </p>
          <p>
            <span>App lock</span>
            <Switch checked={false} onCheckedChange={() => {}} disabled />
            <span> Coming soon</span>
          </p>
        </section>

        <hr />

        <section aria-labelledby="notifications-heading">
          <h2 id="notifications-heading">Notifications</h2>
          <p>You&apos;ll see a badge on the Reminders tab when something is due today.</p>
        </section>

        <hr />

        <section aria-labelledby="privacy-heading">
          <h2 id="privacy-heading">Privacy</h2>
          <p>
            Your memories are private and stored securely. Cherish never shares or sells your data.
            Ever.
          </p>
        </section>

        <hr />

        <section aria-labelledby="account-heading">
          <h2 id="account-heading">Account</h2>
          <p style={{ color: "#6b7280" }}>Export memories — Coming soon</p>
          <p>
            <button type="button" onClick={() => void handleSignOut()} disabled={signingOut}>
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
          </p>
        </section>

        <hr />

        <section aria-labelledby="danger-heading">
          <h2 id="danger-heading">Danger zone</h2>
          <p>
            <button type="button" onClick={() => setConfirmDeleteOpen(true)}>
              Delete account
            </button>
          </p>
          {deleteError ? <p role="alert">{deleteError}</p> : null}
        </section>
      </main>

      {confirmDeleteOpen ? (
        <div role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
          <h3 id="delete-dialog-title">Delete account</h3>
          <p>This action cannot be undone. Do you want to permanently delete your account and all data?</p>
          <p>
            <button type="button" onClick={() => void handleDeleteAccount()} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete account"}
            </button>
            <button type="button" onClick={() => setConfirmDeleteOpen(false)}>
              Cancel
            </button>
          </p>
        </div>
      ) : null}
    </>
  );
}
