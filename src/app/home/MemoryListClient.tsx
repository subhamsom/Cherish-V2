"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Calendar, Gift, Heart, Mic, MoreVertical, Pin, Plus, Trash2, Type, X } from "lucide-react";
import { formatMemoryDate, isoDateFromCreatedAt, todayIsoDateLocal } from "@/lib/formatDate";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

type Memory = {
  id: string;
  title: string | null;
  content: string;
  type: string;
  tags: string[] | null;
  liked: boolean | null;
  pinned: boolean | null;
  audio_url: string | null;
  image_url: string | null;
  /** Postgres DATE as YYYY-MM-DD */
  memory_date?: string | null;
  created_at: string | null;
};

function displayMemoryDateLabel(memory: Memory): string {
  const raw = memory.memory_date?.trim();
  if (raw) return formatMemoryDate(raw);
  if (memory.created_at) return formatMemoryDate(isoDateFromCreatedAt(memory.created_at));
  return "";
}

const CARD_TITLE_MAX_CHARS = 50;

function truncateCardTitle(title: string): string {
  if (title.length <= CARD_TITLE_MAX_CHARS) return title;
  return `${title.slice(0, CARD_TITLE_MAX_CHARS)}\u2026`;
}

/** Title + optional description for text cards (avoid duplicating title when content is only the fallback). */
function textMemoryCardFields(memory: Memory): { headline: string; descriptionPreview: string | null } {
  const rawTitle = (memory.title ?? "").trim();
  const rawContent = (memory.content ?? "").trim();
  const headline = rawTitle || rawContent;
  if (!rawTitle) {
    return { headline, descriptionPreview: null };
  }
  if (!rawContent || rawContent === rawTitle) {
    return { headline, descriptionPreview: null };
  }
  return { headline, descriptionPreview: (memory.content ?? "").trim() };
}

const MAX_TAGS_ON_CARD = 3;

const TYPE_META: Record<
  string,
  { label: string; Icon: typeof Type }
> = {
  text: { label: "Text", Icon: Type },
  voice: { label: "Voice", Icon: Mic },
  photo: { label: "Photo", Icon: Camera },
  gift: { label: "Gift", Icon: Gift },
  occasion: { label: "Occasion", Icon: Calendar },
};

function TypeBadge({ type }: { type: string }) {
  const meta = TYPE_META[type] ?? { label: type, Icon: Type };
  const Icon = meta.Icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <Icon size={14} />
      {meta.label}
    </span>
  );
}

function confirmText() {
  return "Are you sure? This memory can't be recovered.";
}

const PRESET_TAGS = [
  "happy",
  "romantic",
  "grateful",
  "funny",
  "milestone",
  "difficult",
  "peaceful",
  "excited",
] as const;

type MemoryType = "text" | "voice" | "photo" | "gift" | "occasion";
type PresetTag = (typeof PRESET_TAGS)[number];
type MemoryFilter = "all" | MemoryType;
type SortOption = "newest" | "oldest" | "random";
const MAX_VOICE_FILE_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_FILE_BYTES = 20 * 1024 * 1024;

const FILTER_OPTIONS: Array<{ value: MemoryFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "text", label: "Text" },
  { value: "voice", label: "Voice" },
  { value: "photo", label: "Photo" },
  { value: "gift", label: "Gift" },
  { value: "occasion", label: "Occasion" },
];

export default function MemoryListClient({
  initialMemories,
}: {
  initialMemories: Memory[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [memories, setMemories] = useState<Memory[]>(initialMemories);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(),
  );

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addMemoryDate, setAddMemoryDate] = useState(todayIsoDateLocal);
  const [addDetails, setAddDetails] = useState("");
  const [addType, setAddType] = useState<MemoryType>("text");
  const [addTags, setAddTags] = useState<PresetTag[]>([]);
  const [customTagsInput, setCustomTagsInput] = useState("");
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [recordingSupported, setRecordingSupported] = useState(false);
  const [recordingBusy, setRecordingBusy] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [recordingInterrupted, setRecordingInterrupted] = useState(false);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioPreviewUrl, setRecordedAudioPreviewUrl] = useState<string | null>(null);
  const [voiceUploading, setVoiceUploading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [detailMemory, setDetailMemory] = useState<Memory | null>(null);
  const [detailAudioPlaybackUrl, setDetailAudioPlaybackUrl] = useState<string | null>(null);
  const [detailAudioError, setDetailAudioError] = useState<string | null>(null);
  const [detailImagePlaybackUrl, setDetailImagePlaybackUrl] = useState<string | null>(null);
  const [detailImageError, setDetailImageError] = useState<string | null>(null);
  const [imageViewerUrl, setImageViewerUrl] = useState<string | null>(null);
  const [detailMenuOpen, setDetailMenuOpen] = useState(false);
  const [detailDeleteConfirm, setDetailDeleteConfirm] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editMemoryId, setEditMemoryId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMemoryDate, setEditMemoryDate] = useState("");
  const [editDetails, setEditDetails] = useState("");
  const [editType, setEditType] = useState<MemoryType>("text");
  const [editTags, setEditTags] = useState<PresetTag[]>([]);
  const [editCustomTagsInput, setEditCustomTagsInput] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editVoiceFile, setEditVoiceFile] = useState<File | null>(null);
  const [editVoicePreviewUrl, setEditVoicePreviewUrl] = useState<string | null>(null);
  const [editReplaceVoice, setEditReplaceVoice] = useState(false);
  const [editVoicePlaybackUrl, setEditVoicePlaybackUrl] = useState<string | null>(null);
  const [editVoicePlaybackError, setEditVoicePlaybackError] = useState<string | null>(null);
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoPreviewUrl, setEditPhotoPreviewUrl] = useState<string | null>(null);
  const [editAudioPath, setEditAudioPath] = useState<string | null>(null);
  const [editImagePath, setEditImagePath] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<MemoryFilter>("all");
  const [activeMoodFilter, setActiveMoodFilter] = useState<PresetTag | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const longPressTimer = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const stopRequestedRef = useRef(false);
  const recordingInterruptedRef = useRef(false);

  const selectedCount = selectedIds.size;

  const selectedArray = useMemo(
    () => Array.from(selectedIds),
    [selectedIds],
  );

  useEffect(() => {
    setMemories(initialMemories);
  }, [initialMemories]);

  const filteredMemories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = memories.filter((memory) => {
      const matchesType = activeFilter === "all" ? true : memory.type === activeFilter;
      if (!matchesType) return false;
      const matchesMood = activeMoodFilter ? (memory.tags ?? []).includes(activeMoodFilter) : true;
      if (!matchesMood) return false;
      if (!query) return true;

      const title = (memory.title ?? "").toLowerCase();
      const content = memory.content.toLowerCase();
      return title.includes(query) || content.includes(query);
    });

    const pinned = filtered.filter((memory) => Boolean(memory.pinned));
    const others = filtered.filter((memory) => !memory.pinned);

    const sortChronological = (items: Memory[], direction: "asc" | "desc") =>
      [...items].sort((a, b) => {
        const aDate = (a.memory_date?.trim() || (a.created_at ? isoDateFromCreatedAt(a.created_at) : "")) || "";
        const bDate = (b.memory_date?.trim() || (b.created_at ? isoDateFromCreatedAt(b.created_at) : "")) || "";
        const dateCmp = direction === "asc" ? aDate.localeCompare(bDate) : bDate.localeCompare(aDate);
        if (dateCmp !== 0) return dateCmp;
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return direction === "asc" ? aTime - bTime : bTime - aTime;
      });

    const randomize = (items: Memory[]) => {
      const shuffled = [...items];
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
      }
      return shuffled;
    };

    const sortList = (items: Memory[]) => {
      if (sortBy === "oldest") return sortChronological(items, "asc");
      if (sortBy === "random") return randomize(items);
      return sortChronological(items, "desc");
    };

    return [...sortList(pinned), ...sortList(others)];
  }, [memories, searchQuery, activeFilter, activeMoodFilter, sortBy]);

  function clearSelection() {
    setSelectionMode(false);
    setSelectedIds(new Set());
    setConfirmDelete(false);
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function enterSelectionWith(id: string) {
    setSelectionMode(true);
    setSelectedIds(new Set([id]));
  }

  async function deleteSelected() {
    const ids = selectedArray;
    if (!ids.length) return;

    const res = await fetch("/api/memories/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Simple fallback; later we can show a toast.
      console.error("Bulk delete failed:", res.status, json);
      return;
    }

    const deletedIds: string[] = json.deletedIds ?? ids;
    setMemories((prev) => prev.filter((m) => !deletedIds.includes(m.id)));
    clearSelection();
  }

  function onCardPointerDown(id: string) {
    if (selectionMode) return;
    longPressTimer.current = window.setTimeout(() => {
      enterSelectionWith(id);
    }, 450);
  }

  function onCardPointerUp() {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function toggleAddTag(tag: PresetTag) {
    setAddTags((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]));
  }

  function toggleEditTag(tag: PresetTag) {
    setEditTags((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]));
  }

  function parseCustomTags(value: string) {
    return value
      .split(",")
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean);
  }

  function openEditModal(memory: Memory) {
    const memoryTags = memory.tags ?? [];
    const preset = memoryTags.filter((tag): tag is PresetTag =>
      (PRESET_TAGS as readonly string[]).includes(tag),
    );
    const custom = memoryTags.filter(
      (tag) => !(PRESET_TAGS as readonly string[]).includes(tag),
    );

    setEditMemoryId(memory.id);
    setEditTitle(memory.title ?? memory.content);
    setEditMemoryDate(
      memory.memory_date?.trim() ||
        (memory.created_at ? isoDateFromCreatedAt(memory.created_at) : todayIsoDateLocal()),
    );
    setEditDetails(memory.content ?? "");
    setEditType((memory.type as MemoryType) ?? "text");
    setEditTags(preset);
    setEditCustomTagsInput(custom.join(", "));
    setEditAudioPath(memory.audio_url ?? null);
    setEditImagePath(memory.image_url ?? null);
    setEditVoiceFile(null);
    setEditPhotoFile(null);
    setEditVoicePreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setEditReplaceVoice(false);
    setEditVoicePlaybackUrl(null);
    setEditVoicePlaybackError(null);
    setEditPhotoPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setEditError(null);
    setEditOpen(true);
    setDetailMenuOpen(false);
  }

  function closeEditModal() {
    // If anything is recording, release mic + stop immediately.
    clearVoiceRecording();
    setEditOpen(false);
    setEditMemoryId(null);
    setEditTitle("");
    setEditMemoryDate("");
    setEditDetails("");
    setEditType("text");
    setEditTags([]);
    setEditCustomTagsInput("");
    setEditAudioPath(null);
    setEditImagePath(null);
    setEditVoiceFile(null);
    setEditPhotoFile(null);
    setEditReplaceVoice(false);
    setEditVoicePlaybackUrl(null);
    setEditVoicePlaybackError(null);
    setEditVoicePreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setEditPhotoPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setEditError(null);
  }

  function closeAddModal() {
    // If the modal is dismissed mid-recording, release the microphone immediately.
    clearVoiceRecording();
    setAddError(null);
    setAddOpen(false);
  }

  function onEditPhotoFileChange(file: File | null) {
    if (!file) {
      setEditPhotoFile(null);
      setEditPhotoPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }
    if (!file.type.startsWith("image/")) {
      setEditError("Please select a valid image file for photo memory.");
      return;
    }
    if (file.size > MAX_IMAGE_FILE_BYTES) {
      setEditError("Image file is too large. Please keep it under 20MB.");
      return;
    }
    setEditPhotoFile(file);
    const nextPreview = URL.createObjectURL(file);
    setEditPhotoPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return nextPreview;
    });
  }

  async function startVoiceRecording() {
    if (!recordingSupported || recordingBusy) return;
    recordingInterruptedRef.current = false;
    stopRequestedRef.current = false;
    setRecordingInterrupted(false);
    setRecordingError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      recorderRef.current = recorder;
      setRecordingBusy(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      const handleMicrophoneLost = () => {
        if (recordingInterruptedRef.current) return;
        recordingInterruptedRef.current = true;
        setRecordingInterrupted(true);
        setRecordingError("Microphone access was lost. Please try again.");

        if (recordingTimerRef.current) {
          window.clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }

        setRecordingSeconds(0);
        recordedChunksRef.current = [];
        setRecordedAudioBlob(null);
        setRecordedAudioPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
        setRecordingBusy(false);

        try {
          stream.getTracks().forEach((track) => track.stop());
        } catch {
          // ignore
        }
      };

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (recordingTimerRef.current) {
          window.clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        setRecordingSeconds(0);
        if (recordingInterruptedRef.current) {
          setRecordingBusy(false);
          return;
        }

        if (blob.size > MAX_VOICE_FILE_BYTES) {
          setRecordedAudioBlob(null);
          setRecordedAudioPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
          });
          setRecordingError("Recording is too large. Please keep voice notes under 10MB.");
          stream.getTracks().forEach((track) => track.stop());
          setRecordingBusy(false);
          return;
        }
        setRecordedAudioBlob(blob);
        const nextPreviewUrl = URL.createObjectURL(blob);
        setRecordedAudioPreviewUrl((prev) => {
          if (prev) {
            URL.revokeObjectURL(prev);
          }
          return nextPreviewUrl;
        });
        stream.getTracks().forEach((track) => track.stop());
        setRecordingBusy(false);
      };

      recorder.addEventListener("inactive", () => {
        if (stopRequestedRef.current) return;
        handleMicrophoneLost();
      });

      stream.getAudioTracks().forEach((track) => {
        track.addEventListener("ended", () => {
          if (stopRequestedRef.current) return;
          handleMicrophoneLost();
        });
      });

      recorder.onerror = () => {
        recordingInterruptedRef.current = true;
        setRecordingInterrupted(false);
        handleMicrophoneLost();
      };

      recorder.start();
    } catch {
      setRecordingError("Microphone permission is required to record audio.");
    }
  }

  function stopVoiceRecording() {
    if (!recorderRef.current || recorderRef.current.state !== "recording") return;
    stopRequestedRef.current = true;
    recorderRef.current.stop();
  }

  function clearVoiceRecording() {
    stopRequestedRef.current = true;
    recordingInterruptedRef.current = true;
    setRecordingInterrupted(false);

    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch {
        // ignore
      }
      mediaStreamRef.current = null;
    }
    recordedChunksRef.current = [];

    if (recorderRef.current?.state === "recording") {
      try {
        recorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    recorderRef.current = null;

    if (recordingTimerRef.current) {
      window.clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setRecordingSeconds(0);
    setRecordingBusy(false);
    setRecordedAudioPreviewUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    setRecordedAudioBlob(null);
    setRecordingError(null);
  }

  function clearPhotoSelection() {
    setPhotoPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPhotoFile(null);
    setPhotoError(null);
  }

  function onPhotoFileChange(file: File | null) {
    setPhotoError(null);
    if (!file) {
      clearPhotoSelection();
      return;
    }
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select a valid image file.");
      return;
    }
    if (file.size > MAX_IMAGE_FILE_BYTES) {
      setPhotoError("Image is too large. Please keep it under 20MB.");
      return;
    }
    setPhotoFile(file);
    const nextPreview = URL.createObjectURL(file);
    setPhotoPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return nextPreview;
    });
  }

  async function createMemory() {
    setAddError(null);
    const trimmedTitle = addTitle.trim();
    const trimmedDetails = addDetails.trim();
    if (!trimmedTitle) {
      setAddError("Title is required.");
      return;
    }
    const md = addMemoryDate.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(md)) {
      setAddError("Please choose a valid date.");
      return;
    }
    if (addType === "photo" && !photoFile) {
      setAddError("Please choose an image for your photo memory.");
      return;
    }
    if (addType === "voice" && recordingBusy) {
      setAddError("Please stop recording before saving.");
      return;
    }
    if (addType === "voice" && recordingInterrupted) {
      setAddError("Microphone access was lost. Please try again.");
      return;
    }
    if (addType === "voice" && !recordedAudioBlob) {
      setAddError("Please record your voice memory before saving.");
      return;
    }

    setAddSubmitting(true);
    try {
      const mergedTags = Array.from(
        new Set([...addTags, ...parseCustomTags(customTagsInput)]),
      );

      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          details: trimmedDetails || null,
          type: addType,
          tags: mergedTags.length ? mergedTags : null,
          memory_date: md,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAddError(json.error ?? "Could not save memory.");
        return;
      }
      const createdMemoryId = (json.memory?.id as string | undefined) ?? null;
      if (addType === "voice" && !createdMemoryId) {
        setAddError("Memory was created, but no ID was returned for audio upload.");
        return;
      }

      if (addType === "voice" && recordedAudioBlob && createdMemoryId) {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          await fetch(`/api/memories/${createdMemoryId}`, { method: "DELETE" }).catch(() => undefined);
          setAddError("Could not verify your session for audio upload.");
          return;
        }

        const extension = recordedAudioBlob.type.includes("mpeg") ? "mp3" : "webm";
        const uploadForm = new FormData();
        uploadForm.append(
          "file",
          new File([recordedAudioBlob], `voice-${Date.now()}.${extension}`, {
            type: recordedAudioBlob.type || "audio/webm",
          }),
        );
        uploadForm.append("type", "memory");
        uploadForm.append("memory_id", createdMemoryId);
        setVoiceUploading(true);
        try {
          const uploadRes = await fetch("/api/media/upload", {
            method: "POST",
            body: uploadForm,
          });
          const uploadJson = await uploadRes.json().catch(() => ({}));

          if (!uploadRes.ok || !uploadJson.path) {
            await fetch(`/api/memories/${createdMemoryId}`, { method: "DELETE" }).catch(() => undefined);
            setAddError(
              `Audio upload failed: ${uploadJson.details ?? uploadJson.error ?? "Unknown upload error"}`,
            );
            return;
          }
          const filePath = uploadJson.path as string;

          const patch = await fetch(`/api/memories/${createdMemoryId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audio_url: filePath }),
          });

          if (!patch.ok) {
            await fetch(`/api/memories/${createdMemoryId}`, { method: "DELETE" }).catch(() => undefined);
            setAddError("Audio uploaded, but saving the memory reference failed.");
            return;
          }
        } finally {
          setVoiceUploading(false);
        }
      }

      if (addType === "photo" && photoFile && createdMemoryId) {
        const uploadForm = new FormData();
        uploadForm.append("file", photoFile);
        uploadForm.append("type", "memory");
        uploadForm.append("memory_id", createdMemoryId);
        const uploadRes = await fetch("/api/media/upload", {
          method: "POST",
          body: uploadForm,
        });
        const uploadJson = await uploadRes.json().catch(() => ({}));

        if (!uploadRes.ok || !uploadJson.path) {
          await fetch(`/api/memories/${createdMemoryId}`, { method: "DELETE" }).catch(() => undefined);
          setAddError(
            `Image upload failed: ${uploadJson.details ?? uploadJson.error ?? "Unknown upload error"}`,
          );
          return;
        }
        const imagePath = uploadJson.path as string;
        const patch = await fetch(`/api/memories/${createdMemoryId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_url: imagePath }),
        });

        if (!patch.ok) {
          await fetch(`/api/memories/${createdMemoryId}`, { method: "DELETE" }).catch(() => undefined);
          setAddError("Image uploaded, but saving the memory reference failed.");
          return;
        }
      }

      setAddOpen(false);
      setAddTitle("");
      setAddMemoryDate(todayIsoDateLocal());
      setAddDetails("");
      setAddType("text");
      setAddTags([]);
      setCustomTagsInput("");
      clearVoiceRecording();
      clearPhotoSelection();
      router.refresh();
    } finally {
      setAddSubmitting(false);
    }
  }

  async function deleteMemoryById(id: string) {
    const res = await fetch(`/api/memories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      return;
    }
    setMemories((prev) => prev.filter((memory) => memory.id !== id));
    setDetailDeleteConfirm(false);
    setDetailMenuOpen(false);
    setDetailMemory(null);
  }

  async function patchMemory(id: string, updates: Partial<Pick<Memory, "liked" | "pinned">>) {
    const res = await fetch(`/api/memories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("Memory update failed:", res.status, json);
      return false;
    }
    return true;
  }

  async function toggleLike(memory: Memory) {
    const nextLiked = !Boolean(memory.liked);
    const ok = await patchMemory(memory.id, { liked: nextLiked });
    if (!ok) return;
    setMemories((prev) =>
      prev.map((item) => (item.id === memory.id ? { ...item, liked: nextLiked } : item)),
    );
    setDetailMemory((prev) => (prev?.id === memory.id ? { ...prev, liked: nextLiked } : prev));
  }

  async function togglePin(memory: Memory) {
    const nextPinned = !Boolean(memory.pinned);
    const ok = await patchMemory(memory.id, { pinned: nextPinned });
    if (!ok) return;
    setMemories((prev) =>
      prev.map((item) => (item.id === memory.id ? { ...item, pinned: nextPinned } : item)),
    );
    setDetailMemory((prev) => (prev?.id === memory.id ? { ...prev, pinned: nextPinned } : prev));
  }

  async function saveEditedMemory() {
    if (!editMemoryId) return;
    const trimmedTitle = editTitle.trim();
    const trimmedDetails = editDetails.trim();

    if (editType === "voice" && recordingBusy) {
      setEditError("Please stop recording before saving.");
      return;
    }

    if (editType === "voice" && recordingInterrupted) {
      setEditError("Microphone access was lost. Please try again.");
      return;
    }

    if (!trimmedTitle) {
      setEditError("Title is required.");
      return;
    }
    if (editType === "voice" && !editAudioPath && !editVoiceFile) {
      setEditError("Please add an audio file for voice memory.");
      return;
    }
    if (editType === "photo" && !editImagePath && !editPhotoFile) {
      setEditError("Please add an image for photo memory.");
      return;
    }

    const resolvedMd = editMemoryDate.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(resolvedMd)) {
      setEditError("Please choose a valid date.");
      return;
    }

    setEditError(null);
    setEditSubmitting(true);
    try {
      const mergedTags = Array.from(
        new Set([...editTags, ...parseCustomTags(editCustomTagsInput)]),
      );
      const res = await fetch(`/api/memories/${editMemoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          details: trimmedDetails || null,
          type: editType,
          tags: mergedTags.length ? mergedTags : null,
          memory_date: resolvedMd,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEditError(json.error ?? "Could not save memory changes.");
        return;
      }

      let nextAudioPath: string | null = editAudioPath;
      let nextImagePath: string | null = editImagePath;

      if (editType === "voice") {
        if (editVoiceFile) {
          const uploadForm = new FormData();
          uploadForm.append("file", editVoiceFile);
          uploadForm.append("type", "memory");
          uploadForm.append("memory_id", editMemoryId);
          const uploadRes = await fetch("/api/media/upload", {
            method: "POST",
            body: uploadForm,
          });
          const uploadJson = await uploadRes.json().catch(() => ({}));
          if (!uploadRes.ok || !uploadJson.path) {
            setEditError(uploadJson.details ?? uploadJson.error ?? "Could not upload voice file.");
            return;
          }
          nextAudioPath = uploadJson.path as string;
        }
        nextImagePath = null;
      } else if (editType === "photo") {
        if (editPhotoFile) {
          const uploadForm = new FormData();
          uploadForm.append("file", editPhotoFile);
          uploadForm.append("type", "memory");
          uploadForm.append("memory_id", editMemoryId);
          const uploadRes = await fetch("/api/media/upload", {
            method: "POST",
            body: uploadForm,
          });
          const uploadJson = await uploadRes.json().catch(() => ({}));
          if (!uploadRes.ok || !uploadJson.path) {
            setEditError(uploadJson.details ?? uploadJson.error ?? "Could not upload photo.");
            return;
          }
          nextImagePath = uploadJson.path as string;
        }
        nextAudioPath = null;
      } else {
        nextAudioPath = null;
        nextImagePath = null;
      }

      const mediaPatch = await fetch(`/api/memories/${editMemoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio_url: nextAudioPath,
          image_url: nextImagePath,
        }),
      });
      const mediaJson = await mediaPatch.json().catch(() => ({}));
      if (!mediaPatch.ok) {
        setEditError("Could not update memory media.");
        return;
      }

      const updated = (json.memory ?? {}) as Partial<Memory>;
      const finalMemoryDate =
        (mediaJson.memory as { memory_date?: string } | undefined)?.memory_date ??
        (updated.memory_date as string | undefined) ??
        resolvedMd;
      setMemories((prev) =>
        prev.map((memory) =>
          memory.id === editMemoryId
            ? {
                ...memory,
                title: (updated.title as string | null | undefined) ?? trimmedTitle,
                content: (updated.content as string | undefined) ?? (trimmedDetails || trimmedTitle),
                type: (updated.type as string | undefined) ?? editType,
                tags: (updated.tags as string[] | null | undefined) ?? (mergedTags.length ? mergedTags : null),
                audio_url: nextAudioPath,
                image_url: nextImagePath,
                memory_date: finalMemoryDate,
              }
            : memory,
        ),
      );
      setDetailMemory((prev) =>
        prev?.id === editMemoryId
          ? {
              ...prev,
              title: (updated.title as string | null | undefined) ?? trimmedTitle,
              content: (updated.content as string | undefined) ?? (trimmedDetails || trimmedTitle),
              type: (updated.type as string | undefined) ?? editType,
              tags: (updated.tags as string[] | null | undefined) ?? (mergedTags.length ? mergedTags : null),
              audio_url: nextAudioPath,
              image_url: nextImagePath,
              memory_date: finalMemoryDate,
            }
          : prev,
      );
      closeEditModal();
    } finally {
      setEditSubmitting(false);
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRecordingSupported(Boolean(window.MediaRecorder && navigator.mediaDevices?.getUserMedia));
    }
  }, []);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (!addOpen && !editOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (addOpen) closeAddModal();
      else if (editOpen) closeEditModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [addOpen, editOpen]);
  /* eslint-enable react-hooks/exhaustive-deps */

  useEffect(() => {
    if (!detailMemory?.audio_url) {
      setDetailAudioPlaybackUrl(null);
      setDetailAudioError(null);
      return;
    }

    let cancelled = false;
    setDetailAudioError(null);
    setDetailAudioPlaybackUrl(null);

    supabase.storage
      .from("memories")
      .createSignedUrl(detailMemory.audio_url, 60 * 60)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data?.signedUrl) {
          setDetailAudioError("Could not load audio playback.");
          return;
        }
        setDetailAudioPlaybackUrl(data.signedUrl);
      });

    return () => {
      cancelled = true;
    };
  }, [detailMemory?.audio_url, supabase]);

  useEffect(() => {
    // When the user records a replacement in the edit modal,
    // map the newly recorded blob into `editVoiceFile` so the existing
    // upload/save logic can run unchanged.
    if (!editOpen || !editReplaceVoice) return;

    if (!recordedAudioBlob) {
      setEditVoiceFile(null);
      setEditVoicePreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }

    const extension = recordedAudioBlob.type.includes("mpeg") ? "mp3" : "webm";
    const nextFile = new File([recordedAudioBlob], `voice-${Date.now()}.${extension}`, {
      type: recordedAudioBlob.type || "audio/webm",
    });

    setEditVoiceFile(nextFile);
    setEditVoicePreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(recordedAudioBlob);
    });
  }, [editOpen, editReplaceVoice, recordedAudioBlob]);

  useEffect(() => {
    if (!editOpen || !editAudioPath) {
      setEditVoicePlaybackUrl(null);
      setEditVoicePlaybackError(null);
      return;
    }

    let cancelled = false;
    setEditVoicePlaybackError(null);
    setEditVoicePlaybackUrl(null);

    supabase.storage
      .from("memories")
      .createSignedUrl(editAudioPath, 60 * 60)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data?.signedUrl) {
          setEditVoicePlaybackError("Could not load current recording.");
          return;
        }
        setEditVoicePlaybackUrl(data.signedUrl);
      });

    return () => {
      cancelled = true;
    };
  }, [editOpen, editAudioPath, supabase]);

  useEffect(() => {
    if (!detailMemory?.image_url) {
      setDetailImagePlaybackUrl(null);
      setDetailImageError(null);
      return;
    }

    let cancelled = false;
    setDetailImageError(null);
    setDetailImagePlaybackUrl(null);

    supabase.storage
      .from("memories")
      .createSignedUrl(detailMemory.image_url, 60 * 60)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data?.signedUrl) {
          setDetailImageError("Could not load image.");
          return;
        }
        setDetailImagePlaybackUrl(data.signedUrl);
      });

    return () => {
      cancelled = true;
    };
  }, [detailMemory?.image_url, supabase]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
      }
      setRecordedAudioPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      if (mediaStreamRef.current) {
        try {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        } catch {
          // ignore
        }
        mediaStreamRef.current = null;
      }
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  useEffect(() => {
    return () => {
      if (editVoicePreviewUrl) URL.revokeObjectURL(editVoicePreviewUrl);
      if (editPhotoPreviewUrl) URL.revokeObjectURL(editPhotoPreviewUrl);
    };
  }, [editVoicePreviewUrl, editPhotoPreviewUrl]);

  function formatRecordingSeconds(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h2>Recent Memories</h2>
        <button
          type="button"
          onClick={() => {
            setAddMemoryDate(todayIsoDateLocal());
            setAddOpen(true);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 10,
            padding: "8px 10px",
          }}
        >
          <Plus size={16} />
          Add Memory
        </button>
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search memories..."
            style={{
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 14,
            }}
          />
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            style={{
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 10,
              padding: "10px 10px",
              fontSize: 13,
              background: "white",
            }}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="random">Random</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
          {FILTER_OPTIONS.map((option) => {
            const active = activeFilter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setActiveFilter(option.value)}
                style={{
                  border: active ? "1px solid black" : "1px solid rgba(0,0,0,0.12)",
                  background: active ? "black" : "white",
                  color: active ? "white" : "black",
                  borderRadius: 999,
                  padding: "6px 12px",
                  whiteSpace: "nowrap",
                  fontSize: 13,
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
          {PRESET_TAGS.map((tag) => {
            const active = activeMoodFilter === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveMoodFilter((prev) => (prev === tag ? null : tag))}
                style={{
                  border: active ? "1px solid black" : "1px solid rgba(0,0,0,0.12)",
                  background: active ? "black" : "white",
                  color: active ? "white" : "black",
                  borderRadius: 999,
                  padding: "5px 10px",
                  whiteSpace: "nowrap",
                  fontSize: 12,
                }}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {!memories?.length ? (
        <p>No memories yet. Add your first one.</p>
      ) : !filteredMemories.length ? (
        <p style={{ marginTop: 12 }}>No memories found</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {filteredMemories.map((memory) => {
            const selected = selectedIds.has(memory.id);
            const isText = memory.type === "text";
            const { headline, descriptionPreview } = isText
              ? textMemoryCardFields(memory)
              : { headline: memory.title ?? memory.content, descriptionPreview: null as string | null };
            const cardTitleDisplay = truncateCardTitle(headline);
            const memoryDateLabel = displayMemoryDateLabel(memory);
            const cardTags = (memory.tags ?? [])
              .map((t) => String(t).trim())
              .filter((t) => t.length > 0);
            const extraTagCount = Math.max(0, cardTags.length - MAX_TAGS_ON_CARD);

            return (
              <div
                key={memory.id}
                role="button"
                tabIndex={0}
                onPointerDown={() => onCardPointerDown(memory.id)}
                onPointerUp={onCardPointerUp}
                onPointerCancel={onCardPointerUp}
                onClick={(e) => {
                  if (!selectionMode) {
                    setDetailMemory(memory);
                    setDetailMenuOpen(false);
                    setDetailDeleteConfirm(false);
                    return;
                  }
                  e.stopPropagation();
                  toggleSelected(memory.id);
                }}
                style={{
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 12,
                  padding: 14,
                  // Ensure taps/clicks hit the card (not the selection backdrop).
                  position: "relative",
                  zIndex: selectionMode ? 2 : 0,
                  background: selected
                    ? "rgba(0,0,0,0.04)"
                    : "rgba(255,255,255,0.0)",
                  minWidth: 0,
                }}
              >
                {selectionMode ? (
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onClick={(event) => event.stopPropagation()}
                        onChange={() => toggleSelected(memory.id)}
                      />
                      Select
                    </label>
                  </div>
                ) : null}

                <div
                  className="min-w-0"
                  style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}
                >
                  <div
                    className="min-w-0 flex-1"
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}
                  >
                    <strong
                      className="min-w-0 max-w-full break-words"
                      style={{ fontWeight: 700, display: "block" }}
                      title={headline.length > CARD_TITLE_MAX_CHARS ? headline : undefined}
                    >
                      {cardTitleDisplay}
                    </strong>
                    {memory.pinned ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          border: "1px solid rgba(37,99,235,0.25)",
                          background: "rgba(37,99,235,0.08)",
                          color: "rgb(37 99 235)",
                          borderRadius: 999,
                          padding: "2px 8px",
                          fontSize: 11,
                          lineHeight: 1.2,
                          flexShrink: 0,
                        }}
                        aria-label="Pinned memory"
                      >
                        <Pin size={12} fill="currentColor" />
                        Pinned
                      </span>
                    ) : null}
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      flexShrink: 0,
                    }}
                  >
                    <button
                      type="button"
                      onClick={async (event) => {
                        event.stopPropagation();
                        await toggleLike(memory);
                      }}
                      aria-label={memory.liked ? "Unlike memory" : "Like memory"}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: memory.liked ? "rgb(220 38 38)" : "rgba(0,0,0,0.65)",
                        padding: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Heart size={16} fill={memory.liked ? "currentColor" : "none"} />
                    </button>
                    <span style={{ fontSize: 12, opacity: 0.75 }}>{memoryDateLabel}</span>
                  </div>
                </div>
                {isText ? (
                  descriptionPreview ? (
                    <p
                      className="line-clamp-2 break-words whitespace-pre-line"
                      style={{ fontSize: 14, opacity: 0.8, marginTop: 6, marginBottom: 0 }}
                    >
                      {descriptionPreview}
                    </p>
                  ) : null
                ) : (
                  <p style={{ fontSize: 14, opacity: 0.8, marginTop: 6 }}>
                    {memory.content}
                  </p>
                )}
                {cardTags.length ? (
                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      alignItems: "center",
                    }}
                  >
                    {cardTags.slice(0, MAX_TAGS_ON_CARD).map((tag, i) => (
                      <span
                        key={`${memory.id}-tag-${i}-${tag}`}
                        style={{
                          fontSize: 11,
                          lineHeight: 1.2,
                          padding: "3px 8px",
                          borderRadius: 999,
                          border: "1px solid rgba(0,0,0,0.12)",
                          background: "rgba(0,0,0,0.04)",
                          color: "rgba(0,0,0,0.75)",
                          maxWidth: "100%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                    {extraTagCount > 0 ? (
                      <span style={{ fontSize: 11, opacity: 0.65 }}>+{extraTagCount} more</span>
                    ) : null}
                  </div>
                ) : null}
                {!isText || descriptionPreview ? (
                  <div style={{ marginTop: 8 }}>
                    <TypeBadge type={memory.type} />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {selectionMode ? (
        <div
          onClick={() => clearSelection()}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.0)",
            // Keep the backdrop below the cards, so card taps don't clear selection.
            zIndex: 1,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              padding: 16,
              background: "white",
              borderTop: "1px solid rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              zIndex: 3,
            }}
          >
            <span>{selectedCount} selected</span>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={() => clearSelection()}>
                Cancel
              </button>
              <button
                type="button"
                style={{
                  background: "black",
                  color: "white",
                  padding: "10px 14px",
                  borderRadius: 10,
                }}
                onClick={() => setConfirmDelete(true)}
                disabled={selectedCount === 0}
              >
                Delete selected
              </button>
            </div>
          </div>

          {confirmDelete ? (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  background: "white",
                  padding: 18,
                  borderRadius: 14,
                  width: "100%",
                  maxWidth: 420,
                }}
              >
                <p>{confirmText()}</p>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button type="button" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    style={{
                      background: "rgb(239 68 68)",
                      color: "white",
                      padding: "10px 14px",
                      borderRadius: 10,
                    }}
                    onClick={async () => {
                      await deleteSelected();
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {addOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.38)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 60,
          }}
          onClick={closeAddModal}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 560,
              background: "white",
              borderRadius: 14,
              padding: 16,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>Add Memory</h3>
              <button type="button" onClick={closeAddModal} style={{ border: "1px solid rgba(0,0,0,0.15)", borderRadius: 8, padding: 6 }}>
                <X size={14} />
              </button>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 14 }}>Title</span>
                <input
                  value={addTitle}
                  onChange={(event) => setAddTitle(event.target.value)}
                  placeholder="e.g. Our first walk in the rain"
                  style={{ border: "1px solid rgba(0,0,0,0.12)", borderRadius: 10, padding: "10px 12px" }}
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 13, opacity: 0.75 }}>Date</span>
                <input
                  type="date"
                  value={addMemoryDate}
                  onChange={(event) => setAddMemoryDate(event.target.value)}
                  style={{ border: "1px solid rgba(0,0,0,0.12)", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 14 }}>Details</span>
                <textarea
                  value={addDetails}
                  onChange={(event) => setAddDetails(event.target.value)}
                  placeholder="The little things worth remembering..."
                  style={{ minHeight: 100, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 10, padding: "10px 12px" }}
                />
              </label>

              <div
                style={{
                  display: "flex",
                  gap: 6,
                  overflowX: "auto",
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: 12,
                  background: "rgba(0,0,0,0.03)",
                  padding: 4,
                }}
              >
                {(Object.keys(TYPE_META) as MemoryType[]).map((key) => {
                  const active = addType === key;
                  const Icon = TYPE_META[key].Icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAddType(key)}
                      style={{
                        border: "none",
                        background: active ? "black" : "transparent",
                        color: active ? "white" : "black",
                        borderRadius: 9,
                        padding: "8px 10px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        whiteSpace: "nowrap",
                        boxShadow: active ? "0 1px 2px rgba(0,0,0,0.2)" : "none",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      <Icon size={14} />
                      {TYPE_META[key].label}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PRESET_TAGS.map((tag) => {
                  const active = addTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleAddTag(tag)}
                      style={{
                        border: active ? "1px solid rgba(0,0,0,0.25)" : "1px solid rgba(0,0,0,0.10)",
                        background: active ? "rgba(0,0,0,0.10)" : "rgba(0,0,0,0.02)",
                        color: "black",
                        borderRadius: 999,
                        padding: "4px 9px",
                        fontSize: 12,
                        lineHeight: 1.2,
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 13, opacity: 0.75 }}>Custom tags</span>
                <input
                  value={customTagsInput}
                  onChange={(event) => setCustomTagsInput(event.target.value)}
                  placeholder="Add your own tags, comma separated"
                  style={{
                    border: "1px solid rgba(0,0,0,0.12)",
                    borderRadius: 10,
                    padding: "9px 11px",
                    fontSize: 13,
                  }}
                />
              </label>

              {addType === "voice" ? (
                <div
                  style={{
                    border: "1px solid rgba(0,0,0,0.12)",
                    borderRadius: 12,
                    padding: 12,
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <strong style={{ fontSize: 14 }}>Voice recording</strong>
                  {!recordingSupported ? (
                    <p style={{ margin: 0, fontSize: 13, opacity: 0.75 }}>
                      Your browser does not support voice recording in this app.
                    </p>
                  ) : (
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      {!recordingBusy ? (
                        <button type="button" onClick={startVoiceRecording} style={{ borderRadius: 10, padding: "8px 12px" }}>
                          {recordedAudioBlob ? "Record again" : "Start recording"}
                        </button>
                      ) : (
                        <button type="button" onClick={stopVoiceRecording} style={{ borderRadius: 10, padding: "8px 12px" }}>
                          Stop recording
                        </button>
                      )}
                      {recordedAudioBlob ? (
                        <button type="button" onClick={clearVoiceRecording} style={{ borderRadius: 10, padding: "8px 12px" }}>
                          Clear
                        </button>
                      ) : null}
                      <span style={{ fontSize: 12, opacity: 0.7 }}>
                        {recordingBusy
                          ? `Recording... ${formatRecordingSeconds(recordingSeconds)}`
                          : recordedAudioBlob
                            ? "Recording ready"
                            : "No recording yet"}
                      </span>
                    </div>
                  )}
                  {recordedAudioPreviewUrl ? <audio controls src={recordedAudioPreviewUrl} /> : null}
                  {recordingError ? <p style={{ margin: 0, color: "rgb(220 38 38)" }}>{recordingError}</p> : null}
                </div>
              ) : null}

              {addType === "photo" ? (
                <div
                  style={{
                    border: "1px solid rgba(0,0,0,0.12)",
                    borderRadius: 12,
                    padding: 12,
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <strong style={{ fontSize: 14 }}>Photo upload</strong>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <label
                      style={{
                        border: "1px solid rgba(0,0,0,0.15)",
                        borderRadius: 10,
                        padding: "8px 12px",
                        cursor: "pointer",
                      }}
                    >
                      Upload from device
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(event) => {
                          onPhotoFileChange(event.target.files?.[0] ?? null);
                        }}
                      />
                    </label>
                    <label
                      style={{
                        border: "1px solid rgba(0,0,0,0.15)",
                        borderRadius: 10,
                        padding: "8px 12px",
                        cursor: "pointer",
                      }}
                    >
                      Click photo
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        style={{ display: "none" }}
                        onChange={(event) => {
                          onPhotoFileChange(event.target.files?.[0] ?? null);
                        }}
                      />
                    </label>
                  </div>
                  {photoPreviewUrl ? (
                    <Image
                      src={photoPreviewUrl}
                      alt="Selected memory photo preview"
                      width={800}
                      height={560}
                      unoptimized
                      style={{
                        width: "100%",
                        maxHeight: 320,
                        objectFit: "contain",
                        borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.08)",
                      }}
                    />
                  ) : null}
                  {photoFile ? (
                    <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>
                      {photoFile.name} ({Math.round(photoFile.size / 1024)} KB)
                    </p>
                  ) : (
                    <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>No image selected</p>
                  )}
                  {photoFile ? (
                    <button type="button" onClick={clearPhotoSelection} style={{ width: "fit-content", borderRadius: 10, padding: "8px 12px" }}>
                      Clear image
                    </button>
                  ) : null}
                  {photoError ? <p style={{ margin: 0, color: "rgb(220 38 38)" }}>{photoError}</p> : null}
                </div>
              ) : null}
            </div>

            {addError ? <p style={{ color: "rgb(220, 38, 38)", marginTop: 10 }}>{addError}</p> : null}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <button type="button" onClick={closeAddModal}>
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await createMemory();
                }}
                disabled={addSubmitting}
                style={{
                  background: "black",
                  color: "white",
                  borderRadius: 10,
                  padding: "10px 14px",
                }}
              >
                {addSubmitting ? (voiceUploading ? "Saving audio..." : "Saving...") : "Save this memory"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {detailMemory ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.38)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 70,
          }}
          onClick={() => {
            setDetailMemory(null);
            setDetailMenuOpen(false);
            setDetailDeleteConfirm(false);
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 620,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "white",
              borderRadius: 14,
              padding: 16,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
              <h3 style={{ margin: 0, fontSize: 24, lineHeight: 1.2 }}>
                {detailMemory.title ?? detailMemory.content}
              </h3>
              <div style={{ position: "relative", display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={async () => {
                    await togglePin(detailMemory);
                  }}
                  style={{
                    border: "1px solid rgba(0,0,0,0.15)",
                    borderRadius: 8,
                    padding: 6,
                    color: detailMemory.pinned ? "rgb(37 99 235)" : "inherit",
                    background: "white",
                  }}
                  aria-label={detailMemory.pinned ? "Unpin memory" : "Pin memory"}
                >
                  <Pin size={16} fill={detailMemory.pinned ? "currentColor" : "none"} />
                </button>
                <button
                  type="button"
                  onClick={() => setDetailMenuOpen((prev) => !prev)}
                  style={{
                    border: "1px solid rgba(0,0,0,0.15)",
                    borderRadius: 8,
                    padding: 6,
                  }}
                  aria-label="Memory actions"
                >
                  <MoreVertical size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDetailMemory(null);
                    setDetailMenuOpen(false);
                    setDetailDeleteConfirm(false);
                  }}
                  style={{
                    border: "1px solid rgba(0,0,0,0.15)",
                    borderRadius: 8,
                    padding: 6,
                  }}
                  aria-label="Close memory details"
                >
                  <X size={14} />
                </button>

                {detailMenuOpen ? (
                  <div
                    style={{
                      position: "absolute",
                      right: 36,
                      top: 34,
                      minWidth: 170,
                      background: "white",
                      border: "1px solid rgba(0,0,0,0.12)",
                      borderRadius: 12,
                      padding: 6,
                      zIndex: 2,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        openEditModal(detailMemory);
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        border: "none",
                        background: "transparent",
                        borderRadius: 8,
                        padding: "8px 10px",
                        cursor: "pointer",
                      }}
                    >
                      Edit Memory
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDetailMenuOpen(false);
                        setDetailDeleteConfirm(true);
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        border: "none",
                        background: "transparent",
                        borderRadius: 8,
                        padding: "8px 10px",
                        cursor: "pointer",
                        color: "rgb(220 38 38)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Trash2 size={14} />
                      Delete Memory
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <p style={{ marginTop: 12, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{detailMemory.content}</p>

            <div style={{ marginTop: 12 }}>
              <TypeBadge type={detailMemory.type} />
            </div>

            {detailMemory.type === "voice" ? (
              <div style={{ marginTop: 12 }}>
                {detailAudioPlaybackUrl ? (
                  <audio controls src={detailAudioPlaybackUrl} />
                ) : detailAudioError ? (
                  <p style={{ margin: 0, fontSize: 13, color: "rgb(220 38 38)" }}>{detailAudioError}</p>
                ) : detailMemory.audio_url ? (
                  <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>Loading voice playback...</p>
                ) : (
                  <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>No recording attached</p>
                )}
              </div>
            ) : null}

            {detailMemory.type === "photo" ? (
              <div style={{ marginTop: 12 }}>
                {detailImagePlaybackUrl ? (
                  <button
                    type="button"
                    onClick={() => setImageViewerUrl(detailImagePlaybackUrl)}
                    style={{
                      border: "none",
                      padding: 0,
                      width: "100%",
                      background: "transparent",
                      cursor: "zoom-in",
                    }}
                    aria-label="Open full size photo"
                  >
                    <Image
                      src={detailImagePlaybackUrl}
                      alt={detailMemory.title ?? "Memory photo"}
                      width={1200}
                      height={900}
                      unoptimized
                      style={{
                        width: "100%",
                        maxHeight: 460,
                        objectFit: "contain",
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.08)",
                      }}
                    />
                  </button>
                ) : detailImageError ? (
                  <p style={{ margin: 0, fontSize: 13, color: "rgb(220 38 38)" }}>{detailImageError}</p>
                ) : detailMemory.image_url ? (
                  <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>Loading image...</p>
                ) : (
                  <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>No photo attached</p>
                )}
              </div>
            ) : null}

            <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(detailMemory.tags ?? []).length ? (
                (detailMemory.tags ?? []).map((tag) => (
                  <span
                    key={`${detailMemory.id}-tag-${tag}`}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid rgba(0,0,0,0.12)",
                      fontSize: 12,
                    }}
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: 12, opacity: 0.7 }}>No tags</span>
              )}
            </div>

            <p style={{ marginTop: 12, fontSize: 13, opacity: 0.7 }}>
              Date: {displayMemoryDateLabel(detailMemory) || "-"}
            </p>

            {detailDeleteConfirm ? (
              <div
                style={{
                  marginTop: 12,
                  border: "1px solid rgba(239,68,68,0.35)",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <p style={{ margin: 0 }}>Delete this memory? This cannot be undone.</p>
                <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button type="button" onClick={() => setDetailDeleteConfirm(false)}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await deleteMemoryById(detailMemory.id);
                    }}
                    style={{
                      background: "rgb(239 68 68)",
                      color: "white",
                      borderRadius: 10,
                      padding: "8px 12px",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {editOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 85,
          }}
          onClick={closeEditModal}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 560,
              background: "white",
              borderRadius: 14,
              padding: 16,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>Edit Memory</h3>
              <button type="button" onClick={closeEditModal} style={{ border: "1px solid rgba(0,0,0,0.15)", borderRadius: 8, padding: 6 }}>
                <X size={14} />
              </button>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 14 }}>Title</span>
                <input
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  placeholder="e.g. Our first walk in the rain"
                  style={{ border: "1px solid rgba(0,0,0,0.12)", borderRadius: 10, padding: "10px 12px" }}
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 13, opacity: 0.75 }}>Date</span>
                <input
                  type="date"
                  value={editMemoryDate}
                  onChange={(event) => setEditMemoryDate(event.target.value)}
                  style={{ border: "1px solid rgba(0,0,0,0.12)", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 14 }}>Details</span>
                <textarea
                  value={editDetails}
                  onChange={(event) => setEditDetails(event.target.value)}
                  placeholder="The little things worth remembering..."
                  style={{ minHeight: 100, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 10, padding: "10px 12px" }}
                />
              </label>

              <div
                style={{
                  display: "flex",
                  gap: 6,
                  overflowX: "auto",
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: 12,
                  background: "rgba(0,0,0,0.03)",
                  padding: 4,
                }}
              >
                {(Object.keys(TYPE_META) as MemoryType[]).map((key) => {
                  const active = editType === key;
                  const Icon = TYPE_META[key].Icon;
                  return (
                    <button
                      key={`edit-${key}`}
                      type="button"
                      onClick={() => setEditType(key)}
                      style={{
                        border: "none",
                        background: active ? "black" : "transparent",
                        color: active ? "white" : "black",
                        borderRadius: 9,
                        padding: "8px 10px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        whiteSpace: "nowrap",
                        boxShadow: active ? "0 1px 2px rgba(0,0,0,0.2)" : "none",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      <Icon size={14} />
                      {TYPE_META[key].label}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PRESET_TAGS.map((tag) => {
                  const active = editTags.includes(tag);
                  return (
                    <button
                      key={`edit-tag-${tag}`}
                      type="button"
                      onClick={() => toggleEditTag(tag)}
                      style={{
                        border: active ? "1px solid rgba(0,0,0,0.25)" : "1px solid rgba(0,0,0,0.10)",
                        background: active ? "rgba(0,0,0,0.10)" : "rgba(0,0,0,0.02)",
                        color: "black",
                        borderRadius: 999,
                        padding: "4px 9px",
                        fontSize: 12,
                        lineHeight: 1.2,
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 13, opacity: 0.75 }}>Custom tags</span>
                <input
                  value={editCustomTagsInput}
                  onChange={(event) => setEditCustomTagsInput(event.target.value)}
                  placeholder="Add your own tags, comma separated"
                  style={{
                    border: "1px solid rgba(0,0,0,0.12)",
                    borderRadius: 10,
                    padding: "9px 11px",
                    fontSize: 13,
                  }}
                />
              </label>

              {editType === "voice" ? (
                <div
                  style={{
                    border: "1px solid rgba(0,0,0,0.12)",
                    borderRadius: 12,
                    padding: 12,
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <strong style={{ fontSize: 14 }}>Voice file</strong>
                  {editAudioPath ? (
                    <div style={{ display: "grid", gap: 6 }}>
                      <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>Current recording</p>
                      {editVoicePlaybackUrl ? (
                        <audio controls src={editVoicePlaybackUrl} />
                      ) : editVoicePlaybackError ? (
                        <p style={{ margin: 0, fontSize: 12, color: "rgb(220 38 38)" }}>
                          {editVoicePlaybackError}
                        </p>
                      ) : (
                        <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>
                          Loading current recording...
                        </p>
                      )}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>No recording attached</p>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setEditReplaceVoice(true);
                      // Start replacement with a clean recording state.
                      clearVoiceRecording();
                      // Start immediately to avoid a redundant second click.
                      void startVoiceRecording();
                    }}
                    style={{
                      width: "fit-content",
                      borderRadius: 10,
                      padding: "8px 12px",
                      border: "1px solid rgba(0,0,0,0.15)",
                      background: "white",
                    }}
                  >
                    Replace recording
                  </button>

                  {editReplaceVoice ? (
                    <div style={{ display: "grid", gap: 8 }}>
                      <strong style={{ fontSize: 13 }}>Record a new voice note</strong>

                      {!recordingSupported ? (
                        <p style={{ margin: 0, fontSize: 12, opacity: 0.75 }}>
                          Your browser does not support voice recording in this app.
                        </p>
                      ) : (
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          {recordingBusy ? (
                            <button
                              type="button"
                              onClick={stopVoiceRecording}
                              style={{ borderRadius: 10, padding: "8px 12px" }}
                            >
                              Stop recording
                            </button>
                          ) : null}

                          {recordedAudioBlob ? (
                            <button
                              type="button"
                              onClick={clearVoiceRecording}
                              style={{ borderRadius: 10, padding: "8px 12px" }}
                            >
                              Clear
                            </button>
                          ) : null}

                          {!recordingBusy && !recordedAudioBlob ? (
                            <>
                              {recordingError ? (
                                <button
                                  type="button"
                                  onClick={startVoiceRecording}
                                  style={{ borderRadius: 10, padding: "8px 12px" }}
                                >
                                  Try again
                                </button>
                              ) : null}
                              <span style={{ fontSize: 12, opacity: 0.7 }}>
                                {recordingError
                                  ? "Waiting for microphone…"
                                  : "Requesting microphone…"}
                              </span>
                            </>
                          ) : (
                            <span style={{ fontSize: 12, opacity: 0.7 }}>
                              {recordingBusy
                                ? `Recording... ${formatRecordingSeconds(recordingSeconds)}`
                                : recordedAudioBlob
                                  ? "Recording ready"
                                  : "No recording yet"}
                            </span>
                          )}
                        </div>
                      )}

                      {recordedAudioPreviewUrl ? <audio controls src={recordedAudioPreviewUrl} /> : null}
                      {recordingError ? <p style={{ margin: 0, color: "rgb(220 38 38)" }}>{recordingError}</p> : null}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {editType === "photo" ? (
                <div
                  style={{
                    border: "1px solid rgba(0,0,0,0.12)",
                    borderRadius: 12,
                    padding: 12,
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <strong style={{ fontSize: 14 }}>Photo file</strong>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => onEditPhotoFileChange(event.target.files?.[0] ?? null)}
                  />
                  {editPhotoPreviewUrl ? (
                    <Image
                      src={editPhotoPreviewUrl}
                      alt="Selected replacement memory photo"
                      width={800}
                      height={560}
                      unoptimized
                      style={{
                        width: "100%",
                        maxHeight: 320,
                        objectFit: "contain",
                        borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.08)",
                      }}
                    />
                  ) : null}
                  {!editPhotoPreviewUrl && editImagePath ? (
                    <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>
                      Existing photo attached. Choose an image to replace it.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            {editError ? <p style={{ color: "rgb(220, 38, 38)", marginTop: 10 }}>{editError}</p> : null}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <button type="button" onClick={closeEditModal} disabled={editSubmitting}>
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await saveEditedMemory();
                }}
                disabled={editSubmitting}
                style={{
                  background: "black",
                  color: "white",
                  borderRadius: 10,
                  padding: "10px 14px",
                }}
              >
                {editSubmitting ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {imageViewerUrl ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 90,
          }}
          onClick={() => setImageViewerUrl(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 1200,
              maxHeight: "92vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={imageViewerUrl}
              alt="Memory photo full view"
              width={1800}
              height={1400}
              unoptimized
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "92vh",
                objectFit: "contain",
                borderRadius: 12,
              }}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}

