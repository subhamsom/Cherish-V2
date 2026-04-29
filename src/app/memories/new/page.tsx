"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarIcon, X } from "lucide-react";
import imageCompression from "browser-image-compression";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { localDateToIso, todayIsoDateLocal } from "@/lib/formatDate";
import { NewMemoryFooter } from "@/components/cherish/NewMemoryFooter";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

const ACCENT = "#FF6B6C";

function formatDateLabel(isoDate: string) {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "Choose date";
  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function normalizeTag(raw: string) {
  return raw.trim().replace(/\s+/g, " ").toLowerCase();
}

export default function NewMemoryPage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const titleRef = useRef<HTMLInputElement | null>(null);
  const detailsRef = useRef<HTMLTextAreaElement | null>(null);

  const [title, setTitle] = useState("");
  const [memoryDate, setMemoryDate] = useState(todayIsoDateLocal);
  const [details, setDetails] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [discardOpen, setDiscardOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reminderDateSet, setReminderDateSet] = useState<Set<string>>(new Set());

  const canSave = title.trim().length > 0 && !submitting;
  const isDirty =
    title.trim().length > 0 ||
    details.trim().length > 0 ||
    tagInput.trim().length > 0 ||
    tags.length > 0;

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const textarea = detailsRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.max(220, textarea.scrollHeight)}px`;
  }, [details]);

  useEffect(() => {
    let cancelled = false;
    async function loadReminderDates() {
      const response = await fetch("/api/reminders");
      const json = await response.json().catch(() => ({}));
      if (cancelled || !response.ok || !Array.isArray(json.reminders)) return;
      const next = new Set<string>();
      for (const reminder of json.reminders as Array<{ date?: string }>) {
        const iso = String(reminder.date ?? "").trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) next.add(iso);
      }
      setReminderDateSet(next);
    }
    void loadReminderDates();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  function commitTag() {
    const next = normalizeTag(tagInput);
    if (!next) return;
    setTags((prev) => (prev.includes(next) ? prev : [...prev, next]));
    setTagInput("");
  }

  function handleBack() {
    if (!isDirty || submitting) {
      router.push("/home");
      return;
    }
    setDiscardOpen(true);
  }

  async function onSave() {
    if (!canSave) return;
    setError(null);
    setSubmitting(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("You must be signed in.");
        return;
      }

      let nextUploadedImageUrl = uploadedImageUrl;
      if (imageFile) {
        const compressed = await imageCompression(imageFile, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
        const imagePath = `${user.id}/${Date.now()}-${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("memories")
          .upload(imagePath, compressed, {
            upsert: false,
            contentType: compressed.type || imageFile.type || "image/jpeg",
          });
        if (uploadError) {
          setError("Could not upload image. Please try again.");
          return;
        }
        const { data: publicData } = supabase.storage.from("memories").getPublicUrl(imagePath);
        nextUploadedImageUrl = publicData.publicUrl ?? null;
        setUploadedImageUrl(nextUploadedImageUrl);
      }

      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          details: details.trim() || null,
          type: "text",
          tags: tags.length ? tags : null,
          image_url: nextUploadedImageUrl,
          memory_date: memoryDate,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Could not save moment. Please try again.");
        return;
      }
      router.push(`/home?refresh=${Date.now()}`);
    } finally {
      setSubmitting(false);
    }
  }

  const reminderDates = useMemo(
    () =>
      Array.from(reminderDateSet).map((iso) => new Date(`${iso}T00:00:00`)).filter((d) => !Number.isNaN(d.getTime())),
    [reminderDateSet],
  );

  return (
    <main className="relative flex min-h-dvh flex-col bg-[#fafafa] text-zinc-800">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200/80 bg-[#fafafa]/95 px-3 py-3 backdrop-blur-sm">
        <button
          type="button"
          onClick={handleBack}
          className="flex size-10 items-center justify-center rounded-full text-zinc-700 transition-transform active:scale-95 active:bg-zinc-100"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-serif text-lg tracking-tight text-zinc-800">New moment</h1>
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          className="rounded-full px-4 py-1.5 text-sm font-medium text-white transition-colors disabled:bg-zinc-300 disabled:text-zinc-500"
          style={{ backgroundColor: canSave ? ACCENT : undefined }}
        >
          {submitting ? "Saving..." : "Save"}
        </button>
      </header>

      <section className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-40 pt-5">
        <input
          ref={titleRef}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add title"
          aria-label="Title"
          className="w-full border-0 bg-transparent p-0 font-serif text-[2.15rem] leading-[1.1] text-zinc-700 outline-hidden placeholder:text-zinc-500"
        />

        <div className="mt-3">
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full px-1 py-1 text-sm text-zinc-500"
                />
              }
            >
              <CalendarIcon className="size-4" />
              <span>{formatDateLabel(memoryDate)}</span>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-2">
              <Calendar
                mode="single"
                selected={new Date(`${memoryDate}T00:00:00`)}
                onSelect={(value) => {
                  if (!value) return;
                  const nextIso = localDateToIso(value);
                  setMemoryDate(nextIso);
                  setDateOpen(false);
                }}
                modifiers={{ hasReminder: reminderDates }}
                modifiersStyles={{
                  hasReminder: {
                    backgroundImage: `radial-gradient(circle at 50% 92%, ${ACCENT} 2px, transparent 2.5px)`,
                    backgroundRepeat: "no-repeat",
                  },
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Textarea
          ref={detailsRef}
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          placeholder="What do you want to remember?"
          aria-label="Details"
          className="mt-4 min-h-[220px] resize-none border-0 bg-transparent p-0 text-lg leading-7 text-zinc-700 shadow-none outline-hidden placeholder:text-zinc-500 focus-visible:ring-0"
        />

        {imageFile && imagePreviewUrl ? (
          <div className="relative mt-4">
            <img
              src={imagePreviewUrl}
              alt="Selected memory attachment"
              className="w-full rounded-2xl object-cover"
            />
            <button
              type="button"
              onClick={() => setImageFile(null)}
              aria-label="Remove image"
              className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : null}

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </section>

      <NewMemoryFooter
        tags={tags}
        tagInput={tagInput}
        setTagInput={setTagInput}
        onCommitTag={commitTag}
        onRemoveTag={(tag) => setTags((prev) => prev.filter((existing) => existing !== tag))}
        onImageSelected={(file) => setImageFile(file)}
      />

      <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Discard this moment?</DialogTitle>
            <DialogDescription>
              Your changes have not been saved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-transparent p-0 pt-2">
            <Button variant="outline" onClick={() => setDiscardOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                setDiscardOpen(false);
                router.push("/home");
              }}
              style={{ backgroundColor: ACCENT }}
            >
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

