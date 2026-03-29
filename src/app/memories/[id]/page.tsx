"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { Calendar, Camera, Gift, Mic, MoreVertical, Pencil, Trash2, Type } from "lucide-react";
import Link from "next/link";
import { formatMemoryDate, isoDateFromCreatedAt } from "@/lib/formatDate";

type Memory = {
  id: string;
  title: string | null;
  content: string;
  type: string;
  tags: string[] | null;
  memory_date?: string | null;
  created_at: string | null;
};

function memoryDateLabel(memory: Memory): string {
  const raw = memory.memory_date?.trim();
  if (raw) return formatMemoryDate(raw);
  if (memory.created_at) return formatMemoryDate(isoDateFromCreatedAt(memory.created_at));
  return "";
}

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

function TypeLine({ type }: { type: string }) {
  const meta = TYPE_META[type] ?? { label: type, Icon: Type };
  const Icon = meta.Icon;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <Icon size={16} />
      <span>{meta.label}</span>
    </div>
  );
}

function DeleteConfirmDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 50,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 14,
          width: "100%",
          maxWidth: 420,
          padding: 18,
        }}
      >
        <p>Are you sure? This memory can&apos;t be recovered.</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            style={{ background: "rgb(239 68 68)", color: "white", padding: "10px 14px", borderRadius: 10 }}
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MemoryViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
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
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, supabase]);

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

  if (loading) {
    return (
      <main>
        <p>Loading...</p>
      </main>
    );
  }

  if (!memory) {
    return (
      <main>
        <p>Memory not found.</p>
        <Link href="/home">Go home</Link>
      </main>
    );
  }

  const title = memory.title ?? memory.content;

  return (
    <main style={{ padding: 16 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/home" style={{ textDecoration: "none" }}>
          ←
        </Link>
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Memory options"
          >
            <MoreVertical size={20} />
          </button>

          {menuOpen ? (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 30,
                background: "white",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 12,
                padding: 8,
                minWidth: 180,
                zIndex: 10,
              }}
            >
              <Link
                href={`/memories/${memory.id}/edit`}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 8px",
                  textDecoration: "none",
                }}
              >
                <Pencil size={16} />
                Edit Memory
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmOpen(true);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 8px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "rgb(220 38 38)",
                }}
              >
                <Trash2 size={16} />
                Delete Memory
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <section style={{ marginTop: 18 }}>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>{title}</h1>
        <p style={{ opacity: 0.85 }}>{memory.content}</p>

        <div style={{ marginTop: 12 }}>
          <TypeLine type={memory.type} />
        </div>

        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(memory.tags ?? []).map((tag) => (
            <span key={tag} style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(0,0,0,0.1)" }}>
              {tag}
            </span>
          ))}
          {(!memory.tags || memory.tags.length === 0) ? (
            <span style={{ opacity: 0.7 }}>No tags</span>
          ) : null}
        </div>

        <p style={{ marginTop: 12, opacity: 0.65 }}>
          Date: {memoryDateLabel(memory) || "-"}
        </p>
      </section>

      <DeleteConfirmDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={deleteMemory}
      />
    </main>
  );
}

