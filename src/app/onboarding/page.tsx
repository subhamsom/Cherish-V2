"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function OnboardingPage() {
  const router = useRouter();

  const [partnerName, setPartnerName] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const name = partnerName.trim();
    if (!name) {
      setError("Partner name is required.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("You must be signed in.");
        router.push("/");
        return;
      }

      let photo_url: string | null = null;

      if (photoFile) {
        const ext = photoFile.name.split(".").pop()?.toLowerCase();
        const safeExt = ext && ext.length <= 5 ? ext : "jpg";
        const path = `${user.id}/photo.${safeExt}`;

        const upload = await supabase.storage
          .from("profiles")
          .upload(path, photoFile, {
            upsert: true,
            contentType: photoFile.type,
          });

        if (upload.error) {
          // Optional upload: proceed without photo_url if storage fails.
          console.error("Supabase storage upload failed:", upload.error);
        } else {
          const { data } = supabase.storage.from("profiles").getPublicUrl(path);
          photo_url = data.publicUrl;
        }
      }

      const insert = await supabase
        .from("partners")
        .insert({
          user_id: user.id,
          name,
          photo_url,
        })
        .select("id")
        .maybeSingle();

      if (insert.error) {
        console.error("Supabase partner insert failed:", insert.error);
        setError("Could not save your partner. Please try again.");
        return;
      }

      router.push("/home");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-black">
      <section className="w-full max-w-xl">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Welcome to Cherish
        </h1>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Partner&apos;s name
            </span>
            <input
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              required
              className="border border-zinc-200 rounded-lg px-3 py-2 bg-white text-black dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Optional photo
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-zinc-600 dark:text-zinc-300"
            />
          </label>

          {error ? (
            <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-3 rounded-lg bg-black text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {submitting ? "Saving..." : "Get Started"}
          </button>
        </form>
      </section>
    </main>
  );
}

