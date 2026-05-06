"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { PartnerProfileShell } from "@/components/cherish/PartnerProfileShell";
import { useMemories } from "@/hooks/useMemories";
import { useReminders } from "@/hooks/useReminders";
import { PARTNER_QUERY_KEY, usePartner } from "@/hooks/usePartner";

export default function ProfileClient() {
  const queryClient = useQueryClient();
  const { data: partner, isLoading, isError } = usePartner();
  const { data: memories } = useMemories();
  const { data: reminders } = useReminders();

  const memoryCount = memories?.length ?? 0;
  const recurringCount =
    reminders?.filter(
      (r) => r.recurrence === "yearly" || (r.recurrence !== null && r.recurrence !== "none"),
    ).length ?? 0;

  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(partner?.name ?? "");
  const [relationshipStartDate, setRelationshipStartDate] = useState(
    partner?.relationship_start_date ?? "",
  );
  const [bio, setBio] = useState(partner?.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#fafafa] p-4">
        <p className="text-sm text-zinc-500">Loading...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-[#fafafa] p-4">
        <p className="text-sm text-zinc-500">Could not load partner.</p>
      </main>
    );
  }

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
          bio: bio.trim() ? bio.trim() : null,
          relationship_start_date: relationshipStartDate || null,
        }),
      });
      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError((json as { error?: string }).error ?? "Could not save partner details.");
        return;
      }

      await queryClient.invalidateQueries({ queryKey: PARTNER_QUERY_KEY });
      setEditOpen(false);
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

      await queryClient.invalidateQueries({ queryKey: PARTNER_QUERY_KEY });
    } finally {
      setPhotoUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fafafa] p-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:p-6">
      <input
        ref={photoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handlePartnerPhotoSelected}
      />

      <PartnerProfileShell
        partner={{
          name: partner?.name ?? "",
          photo_url: partner?.photo_url ?? null,
          relationship_start_date: partner?.relationship_start_date ?? null,
          bio: partner?.bio ?? null,
          pronoun: partner?.pronoun ?? null,
        }}
        memoryCount={memoryCount}
        recurringCount={recurringCount}
        onEditClick={() => setEditOpen(true)}
        onAvatarClick={() => photoInputRef.current?.click()}
      />

      {editOpen ? (
        <div className="fixed inset-0 z-40 bg-black/40 p-4" onClick={() => setEditOpen(false)}>
          <div
            className="mx-auto mt-10 w-full max-w-xl rounded-2xl bg-white p-4"
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
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm">A little about them</span>
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={4}
                  placeholder="What makes them, them..."
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2"
                />
              </label>

              <p className="text-xs text-zinc-500">
                Profile photo: use the camera button on the card above (uploads immediately).
              </p>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm">Relationship start date (optional)</span>
                <input
                  type="date"
                  value={relationshipStartDate}
                  onChange={(event) => setRelationshipStartDate(event.target.value)}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2"
                />
              </label>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <div className="mt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-black px-4 py-2.5 text-white disabled:opacity-60"
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

