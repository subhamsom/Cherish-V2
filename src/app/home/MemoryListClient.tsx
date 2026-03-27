"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Calendar, Gift, Mic, Plus, Type, X } from "lucide-react";
import { formatDate } from "@/lib/formatDate";

type Memory = {
  id: string;
  title: string | null;
  content: string;
  type: string;
  created_at: string | null;
};

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

export default function MemoryListClient({
  initialMemories,
}: {
  initialMemories: Memory[];
}) {
  const router = useRouter();
  const [memories, setMemories] = useState<Memory[]>(initialMemories);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(),
  );

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addDetails, setAddDetails] = useState("");
  const [addType, setAddType] = useState<MemoryType>("text");
  const [addTags, setAddTags] = useState<PresetTag[]>([]);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const longPressTimer = useRef<number | null>(null);

  const selectedCount = selectedIds.size;

  const selectedArray = useMemo(
    () => Array.from(selectedIds),
    [selectedIds],
  );

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

  async function createMemory() {
    setAddError(null);
    const trimmedTitle = addTitle.trim();
    const trimmedDetails = addDetails.trim();
    if (!trimmedTitle) {
      setAddError("Title is required.");
      return;
    }

    setAddSubmitting(true);
    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          details: trimmedDetails || null,
          type: addType,
          tags: addTags.length ? addTags : null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAddError(json.error ?? "Could not save memory.");
        return;
      }
      setAddOpen(false);
      setAddTitle("");
      setAddDetails("");
      setAddType("text");
      setAddTags([]);
      router.refresh();
    } finally {
      setAddSubmitting(false);
    }
  }

  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h2>Recent Memories</h2>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
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

      {!memories?.length ? (
        <p>No memories yet. Add your first one.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {memories.map((memory) => {
            const selected = selectedIds.has(memory.id);
            const title = memory.title ?? memory.content;
            const created = memory.created_at ? formatDate(memory.created_at) : "";

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
                    router.push(`/memories/${memory.id}`);
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
                }}
              >
                {selectionMode ? (
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleSelected(memory.id)}
                      />
                      Select
                    </label>
                  </div>
                ) : null}

                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <strong>{title}</strong>
                  <span style={{ fontSize: 12, opacity: 0.75 }}>
                    {created}
                  </span>
                </div>
                <p style={{ fontSize: 14, opacity: 0.8, marginTop: 6 }}>
                  {memory.content}
                </p>
                <div style={{ marginTop: 8 }}>
                  <TypeBadge type={memory.type} />
                </div>
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
          onClick={() => setAddOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 560,
              background: "white",
              borderRadius: 14,
              padding: 16,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>Add Memory</h3>
              <button type="button" onClick={() => setAddOpen(false)} style={{ border: "1px solid rgba(0,0,0,0.15)", borderRadius: 8, padding: 6 }}>
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
                <span style={{ fontSize: 14 }}>Details</span>
                <textarea
                  value={addDetails}
                  onChange={(event) => setAddDetails(event.target.value)}
                  placeholder="The little things worth remembering..."
                  style={{ minHeight: 100, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 10, padding: "10px 12px" }}
                />
              </label>

              <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                {(Object.keys(TYPE_META) as MemoryType[]).map((key) => {
                  const active = addType === key;
                  const Icon = TYPE_META[key].Icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAddType(key)}
                      style={{
                        border: active ? "1px solid black" : "1px solid rgba(0,0,0,0.12)",
                        background: active ? "black" : "white",
                        color: active ? "white" : "black",
                        borderRadius: 10,
                        padding: "8px 10px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        whiteSpace: "nowrap",
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
                        border: active ? "1px solid black" : "1px solid rgba(0,0,0,0.12)",
                        background: active ? "black" : "white",
                        color: active ? "white" : "black",
                        borderRadius: 999,
                        padding: "6px 10px",
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {addError ? <p style={{ color: "rgb(220, 38, 38)", marginTop: 10 }}>{addError}</p> : null}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <button type="button" onClick={() => setAddOpen(false)}>
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
                {addSubmitting ? "Saving..." : "Save this memory"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

