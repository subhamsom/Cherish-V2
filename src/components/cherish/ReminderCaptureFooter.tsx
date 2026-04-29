"use client";

import { Tag } from "lucide-react";
import { useRef, useState } from "react";
import { TagPill } from "@/components/cherish/common/TagPill";

type ReminderCaptureFooterProps = {
  tags: string[];
  tagInput: string;
  setTagInput: (value: string) => void;
  onCommitTag: () => void;
  onRemoveTag: (tag: string) => void;
};

export function ReminderCaptureFooter({
  tags,
  tagInput,
  setTagInput,
  onCommitTag,
  onRemoveTag,
}: ReminderCaptureFooterProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [tagInputOpen, setTagInputOpen] = useState(false);

  function openTagInput() {
    setTagInputOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-[#fafafa]/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-sm">
      <div
        className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onClick={openTagInput}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openTagInput();
          }
        }}
      >
        <Tag className="size-4 shrink-0 text-zinc-400" />
        {tags.map((tag) => (
          <TagPill key={tag} label={tag} onRemove={() => onRemoveTag(tag)} />
        ))}
        {tagInputOpen ? (
          <input
            ref={inputRef}
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "," || event.key === "Enter") {
                event.preventDefault();
                onCommitTag();
              }
            }}
            onBlur={() => {
              onCommitTag();
              if (!tagInput.trim()) setTagInputOpen(false);
            }}
            placeholder="Add tags..."
            className="h-8 min-w-24 bg-transparent text-sm text-zinc-700 outline-hidden placeholder:text-zinc-400"
          />
        ) : (
          <span className="text-sm text-zinc-400">Add tags...</span>
        )}
      </div>
    </footer>
  );
}
