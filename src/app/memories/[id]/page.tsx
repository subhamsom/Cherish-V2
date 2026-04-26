"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarIcon, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { isoDateFromCreatedAt, todayIsoDateLocal } from "@/lib/formatDate";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ACCENT = "#FF6B6C";

type Memory = {
  id: string;
  title: string | null;
  content: string;
  type: string;
  tags: string[] | null;
  memory_date?: string | null;
  created_at: string | null;
};

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

export default function MemoryViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const titleWrapRef = useRef<HTMLTextAreaElement | null>(null);
  const detailsRef = useRef<HTMLTextAreaElement | null>(null);

  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState("");
  const [memoryDate, setMemoryDate] = useState(todayIsoDateLocal);
  const [details, setDetails] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [reminderDateSet, setReminderDateSet] = useState<Set<string>>(new Set());

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("memories")
        .select("id, title, content, type, tags, memory_date, created_at")
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        console.error("Memory fetch failed:", error);
        setMemory(null);
      } else {
        setMemory(data);
        setTitle(data?.title ?? "");
        setMemoryDate(
          data?.memory_date?.trim() ||
            (data?.created_at ? isoDateFromCreatedAt(data.created_at) : todayIsoDateLocal()),
        );
        setDetails(data?.content ?? "");
        setTags((data?.tags as string[] | null) ?? []);
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, supabase]);

  useEffect(() => {
    if (isEditing) titleWrapRef.current?.focus();
  }, [isEditing]);

  useEffect(() => {
    const textarea = titleWrapRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.max(48, textarea.scrollHeight)}px`;
  }, [title, isEditing]);

  useEffect(() => {
    const textarea = detailsRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.max(220, textarea.scrollHeight)}px`;
  }, [details, isEditing]);

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
    if (!menuOpen) return;
    const onPointerDown = () => setMenuOpen(false);
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [menuOpen]);

  function commitTag() {
    const next = normalizeTag(tagInput);
    if (!next) return;
    setTags((prev) => (prev.includes(next) ? prev : [...prev, next]));
    setTagInput("");
  }

  async function deleteMemory() {
    if (!id) return;
    setConfirmOpen(false);

    const res = await fetch(`/api/memories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      console.error("Delete memory failed:", res.status);
      return;
    }
    router.push("/home");
  }

  function enterEditMode() {
    if (!memory) return;
    setIsEditing(true);
  }

  function cancelEdit() {
    if (!memory) return;
    setTitle(memory.title ?? "");
    setMemoryDate(
      memory.memory_date?.trim() ||
        (memory.created_at ? isoDateFromCreatedAt(memory.created_at) : todayIsoDateLocal()),
    );
    setDetails(memory.content ?? "");
    setTags((memory.tags as string[] | null) ?? []);
    setTagInput("");
    setError(null);
    setIsEditing(false);
  }

  const canSave = title.trim().length > 0 && !submitting;
  const reminderDates = useMemo(
    () =>
      Array.from(reminderDateSet)
        .map((iso) => new Date(`${iso}T00:00:00`))
        .filter((d) => !Number.isNaN(d.getTime())),
    [reminderDateSet],
  );

  async function onSave() {
    setError(null);
    if (!canSave || !id) return;
    const md = memoryDate.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(md)) {
      setError("Please choose a valid date.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/memories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          details: details.trim() || null,
          type: memory?.type ?? "text",
          tags: tags.length ? tags : null,
          memory_date: md,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Could not save changes. Please try again.");
        return;
      }

      setMemory((prev) =>
        prev
          ? {
              ...prev,
              title: title.trim(),
              content: details.trim(),
              tags: tags.length ? tags : null,
              memory_date: md,
            }
          : prev,
      );
      setIsEditing(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main style={{ padding: 16 }}>
        <p>Loading...</p>
      </main>
    );
  }

  if (!memory) {
    return (
      <main className="min-h-dvh bg-[#f7f7f8] p-4">
        <p className="text-sm text-zinc-600">Memory not found.</p>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-dvh flex-col bg-[#f7f7f8] text-zinc-800">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200/80 bg-[#f7f7f8]/95 px-3 py-3 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => {
            if (isEditing) {
              cancelEdit();
              return;
            }
            router.push("/home");
          }}
          className="flex size-10 items-center justify-center rounded-full text-zinc-700"
          aria-label={isEditing ? "Cancel edit" : "Back"}
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-serif text-lg tracking-tight text-zinc-800">
          {isEditing ? "Edit moment" : "Moment"}
        </h1>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <button
              type="button"
              onClick={onSave}
              disabled={!canSave}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-white transition-colors disabled:bg-zinc-300 disabled:text-zinc-500"
              style={{ backgroundColor: canSave ? ACCENT : undefined }}
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          ) : null}
          <div className="relative">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              aria-label="Memory options"
              className="flex size-8 items-center justify-center rounded-full text-zinc-700"
            >
              <MoreVertical className="size-4" />
            </button>

            {menuOpen ? (
              <div className="absolute right-0 top-9 z-10 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1 text-sm text-zinc-700 hover:bg-zinc-100"
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <section className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-40 pt-5">
        <Textarea
          ref={titleWrapRef}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          readOnly={!isEditing}
          placeholder="Add title"
          aria-label="Title"
          className="min-h-12 w-full resize-none border-0 bg-transparent p-0 font-serif text-[2.15rem] leading-[1.1] text-zinc-700 shadow-none outline-hidden placeholder:text-zinc-500 focus-visible:ring-0 read-only:cursor-default"
        />

        <div className="mt-3">
          <Popover open={dateOpen && isEditing} onOpenChange={setDateOpen}>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full px-1 py-1 text-sm text-zinc-500"
                  disabled={!isEditing}
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
                  const nextIso = value.toISOString().slice(0, 10);
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
          readOnly={!isEditing}
          placeholder="What do you want to remember?"
          aria-label="Details"
          className="mt-4 min-h-[220px] resize-none border-0 bg-transparent p-0 text-lg leading-7 text-zinc-700 shadow-none outline-hidden placeholder:text-zinc-500 focus-visible:ring-0 read-only:cursor-default"
        />

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </section>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-[#f7f7f8]/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-sm">
        {tags.length > 0 ? (
          <div className="mb-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  if (!isEditing) return;
                  setTags((prev) => prev.filter((existing) => existing !== tag));
                }}
                className="rounded-full bg-zinc-200 px-3 py-1 text-xs text-zinc-700 disabled:opacity-100"
                aria-label={isEditing ? `Remove ${tag}` : tag}
                disabled={!isEditing}
              >
                {tag}
              </button>
            ))}
          </div>
        ) : null}

        {!isEditing ? (
          <button
            type="button"
            onClick={enterEditMode}
            aria-label="Edit memory"
            className="absolute bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 flex size-14 items-center justify-center rounded-2xl bg-[#FF6B6C] text-white shadow-[0_12px_32px_rgb(255_107_108_/_0.4)] transition-transform hover:-translate-y-0.5"
          >
            <Pencil className="size-6" />
          </button>
        ) : (
          <input
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "," || event.key === "Enter") {
                event.preventDefault();
                commitTag();
              }
            }}
            onBlur={commitTag}
            placeholder="Tags (optional)"
            className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-hidden focus:border-zinc-400"
          />
        )}
      </footer>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete this moment?</DialogTitle>
            <DialogDescription>
              This memory can&apos;t be recovered.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-transparent p-0 pt-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={deleteMemory}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

