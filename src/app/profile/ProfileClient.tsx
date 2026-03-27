"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Calendar, Pencil, User, X } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

type Partner = {
  id: string;
  user_id: string;
  name: string;
  photo_url: string | null;
  relationship_start_date: string | null;
};

export default function ProfileClient({
  userEmail,
  partner,
}: {
  userEmail: string;
  partner: Partner | null;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(partner?.name ?? "");
  const [photoUrl, setPhotoUrl] = useState(partner?.photo_url ?? "");
  const [relationshipStartDate, setRelationshipStartDate] = useState(
    partner?.relationship_start_date ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Partner name is required.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/partners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          photo_url: photoUrl.trim() || null,
          relationship_start_date: relationshipStartDate || null,
        }),
      });
      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError((json as { error?: string }).error ?? "Could not save partner details.");
        return;
      }

      setEditOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

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

  return (
    <main className="min-h-screen p-4 md:p-6">
      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Partner</h1>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700"
          >
            <Pencil size={14} />
            Edit partner
          </button>
        </div>

        <div className="mt-5 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            {partner?.photo_url ? (
              <Image
                src={partner.photo_url}
                alt={`${partner.name} photo`}
                width={56}
                height={56}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700">
                <User size={20} />
              </div>
            )}
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Partner</p>
              <p className="font-medium">{partner?.name ?? "Not set yet"}</p>
            </div>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <Calendar size={14} />
            <span>
              {partner?.relationship_start_date
                ? `Together since ${partner.relationship_start_date}`
                : "Relationship start date not set"}
            </span>
          </div>
        </div>

        <div className="mt-5 hidden md:block">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm text-red-600 dark:border-zinc-700 dark:text-red-400"
          >
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>

        <p className="mt-8 hidden text-xs text-zinc-500 dark:text-zinc-400 md:block">
          Signed in as {userEmail}
        </p>
      </section>

      {editOpen ? (
        <div className="fixed inset-0 z-40 bg-black/40 p-4" onClick={() => setEditOpen(false)}>
          <div
            className="mx-auto mt-10 w-full max-w-xl rounded-2xl bg-white p-4 dark:bg-zinc-950"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit Partner</h2>
              <button type="button" onClick={() => setEditOpen(false)} className="rounded-lg border p-1.5">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm">Partner name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Mansi"
                  className="rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm">Photo URL (optional)</span>
                <input
                  value={photoUrl}
                  onChange={(event) => setPhotoUrl(event.target.value)}
                  placeholder="https://..."
                  className="rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm">Relationship start date (optional)</span>
                <input
                  type="date"
                  value={relationshipStartDate}
                  onChange={(event) => setRelationshipStartDate(event.target.value)}
                  className="rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
                />
              </label>

              {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

              <div className="mt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-black px-4 py-2.5 text-white disabled:opacity-60 dark:bg-white dark:text-black"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
                <button type="button" onClick={() => setEditOpen(false)} className="rounded-xl border px-4 py-2.5">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}

