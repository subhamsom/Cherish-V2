"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * When true, mobile top bar and bottom nav translate off-screen.
 * Hides after cumulative scroll down &gt; 20px; shows on any scroll up or when near top.
 */
const ScrollChromeContext = createContext(false);

export function ScrollChromeProvider({ children }: { children: ReactNode }) {
  const [chromeHidden, setChromeHidden] = useState(false);
  const lastY = useRef(0);
  const downAccum = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      lastY.current = y;

      if (y <= 20) {
        setChromeHidden(false);
        downAccum.current = 0;
        return;
      }

      if (delta > 0) {
        downAccum.current += delta;
        if (downAccum.current > 20) setChromeHidden(true);
      } else if (delta < 0) {
        setChromeHidden(false);
        downAccum.current = 0;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <ScrollChromeContext.Provider value={chromeHidden}>
      {children}
    </ScrollChromeContext.Provider>
  );
}

export function useScrollChromeHidden() {
  return useContext(ScrollChromeContext);
}
