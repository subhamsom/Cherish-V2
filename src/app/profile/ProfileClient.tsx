"use client";

import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Calendar, Camera, Loader2, Pencil, X } from "lucide-react";
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
  const [relationshipStartDate, setRelationshipStartDate] = useState(
    partner?.relationship_start_date ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

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
          photo_url: partner?.photo_url ?? null,
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

  async function handlePartnerPhotoSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !partner?.id) return;

    setPhotoUploadError(null);
    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`/api/partners/${partner.id}/photo`, {
        method: "POST",
        body: formData,
      });
      const json = (await response.json().catch(() => ({}))) as {
        error?: string;
        details?: string;
        photo_url?: string;
      };

      if (!response.ok) {
        setPhotoUploadError(json.details ?? json.error ?? "Could not upload photo.");
        return;
      }

      router.refresh();
    } finally {
      setPhotoUploading(false);
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
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            className="hidden"
            onChange={handlePartnerPhotoSelected}
          />

          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <button
                type="button"
                disabled={!partner?.id || photoUploading}
                onClick={() => photoInputRef.current?.click()}
                className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-50 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900"
                aria-label={partner?.photo_url ? "Replace partner photo" : "Add partner photo"}
              >
                {partner?.photo_url ? (
                  <Image
                    src={partner.photo_url}
                    alt={`${partner.name} photo`}
                    width={56}
                    height={56}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera className="text-zinc-500 dark:text-zinc-400" size={22} />
                )}
                {photoUploading ? (
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45"
                    aria-live="polite"
                  >
                    <Loader2 className="size-6 animate-spin text-white" aria-hidden />
                  </div>
                ) : null}
              </button>
              {partner?.photo_url && !photoUploading ? (
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="absolute -bottom-0.5 -right-0.5 flex size-7 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm dark:border-zinc-600 dark:bg-zinc-900"
                  aria-label="Replace partner photo"
                >
                  <Camera size={14} className="text-zinc-700 dark:text-zinc-200" />
                </button>
              ) : null}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Partner</p>
              <p className="font-medium">{partner?.name ?? "Not set yet"}</p>
              {photoUploadError ? (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{photoUploadError}</p>
              ) : null}
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

              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Profile photo: use the camera button on the card above (uploads immediately).
              </p>

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

