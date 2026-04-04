"use client";

import { usePathname } from "next/navigation";
import { useMemoryFAB } from "@/components/MemoryFABBridge";

export default function AddMemoryFAB() {
  const pathname = usePathname();
  const { openAddMemory } = useMemoryFAB();

  if (!pathname.startsWith("/home")) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => openAddMemory()}
      aria-label="Add memory"
      className="fixed right-4 z-[60] max-md:bottom-[84px] md:bottom-8"
    />
  );
}
