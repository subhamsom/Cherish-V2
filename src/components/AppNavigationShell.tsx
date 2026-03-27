"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import BottomTabBar from "@/components/BottomTabBar";
import Sidebar from "@/components/Sidebar";

export default function AppNavigationShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname === "/" || pathname.startsWith("/onboarding");

  if (hideNav) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="md:pl-64">
        <div className="pb-20 md:pb-0">{children}</div>
      </div>
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="md:hidden">
        <BottomTabBar />
      </div>
    </>
  );
}

