"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ReactNode,
} from "react";

type MemoryFABContextValue = {
  /** Register the Home screen's "open add memory" handler. Returns cleanup. */
  registerOpenAddMemory: (fn: () => void) => () => void;
  openAddMemory: () => void;
};

export const MemoryFABContext = createContext<MemoryFABContextValue | null>(
  null,
);

export function MemoryFABProvider({ children }: { children: ReactNode }) {
  const openerRef = useRef<(() => void) | null>(null);

  const registerOpenAddMemory = useCallback((fn: () => void) => {
    openerRef.current = fn;
    return () => {
      if (openerRef.current === fn) openerRef.current = null;
    };
  }, []);

  const openAddMemory = useCallback(() => {
    openerRef.current?.();
  }, []);

  return (
    <MemoryFABContext.Provider
      value={{ registerOpenAddMemory, openAddMemory }}
    >
      {children}
    </MemoryFABContext.Provider>
  );
}

export function useMemoryFAB() {
  const ctx = useContext(MemoryFABContext);
  if (!ctx) {
    throw new Error("useMemoryFAB must be used within MemoryFABProvider");
  }
  return ctx;
}
