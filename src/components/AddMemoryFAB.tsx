"use client";

import { usePathname, useRouter } from "next/navigation";
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
      className="fixed right-4 z-[60] max-md:bottom-[84px] md:bottom-8"
    />
  );
}
