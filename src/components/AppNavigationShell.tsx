"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import AddMemoryFAB from "@/components/AddMemoryFAB";
import MobileBottomNav from "@/components/MobileBottomNav";
import MobileTopBar from "@/components/MobileTopBar";
import Sidebar from "@/components/Sidebar";
import { MemoryFABProvider } from "@/components/MemoryFABBridge";
import { RemindersDueProvider } from "@/components/RemindersDueBadgeBridge";
import { ScrollChromeProvider } from "@/components/ScrollChromeProvider";

export default function AppNavigationShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideNav =
    pathname === "/" ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/preview/");

  if (hideNav) {
    return <>{children}</>;
  }

  return (
    <MemoryFABProvider>
      <RemindersDueProvider>
        <ScrollChromeProvider>
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <MobileTopBar />
          <div className="md:pl-64">
            <div className="min-h-0 pt-14 pb-32 max-md:pb-32 md:pt-0 md:pb-0">
              {children}
            </div>
          </div>
          <div className="md:hidden">
            <MobileBottomNav />
          </div>
          <AddMemoryFAB />
        </ScrollChromeProvider>
      </RemindersDueProvider>
    </MemoryFABProvider>
  );
}
