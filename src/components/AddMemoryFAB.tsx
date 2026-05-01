"use client";

import { usePathname, useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useMemoryFAB } from "@/components/MemoryFABBridge";

export default function AddMemoryFAB() {
  const pathname = usePathname();
  const router = useRouter();
  const { openAddMemory } = useMemoryFAB();
  const isHomeRoute = pathname.startsWith("/home");
  const isRemindersRoute = pathname.startsWith("/reminders");

  if (!isHomeRoute && !isRemindersRoute) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (isHomeRoute) {
          openAddMemory();
          return;
        }
        router.push("/reminders/new");
      }}
      aria-label="Add memory"
      className="fixed right-4 z-[60] flex size-14 items-center justify-center rounded-2xl bg-[#FF6B6C] text-white shadow-[0_12px_32px_rgb(255_107_108_/_0.4)] transition-transform hover:-translate-y-0.5 hover:bg-[#E85E5F] active:translate-y-0 max-md:bottom-[84px] md:bottom-8"
    >
      <Plus className="size-7" strokeWidth={2.5} aria-hidden />
    </button>
  );
}
