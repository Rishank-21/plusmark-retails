"use client";

import { useEffect } from "react";
import { DESIGN_STORAGE_KEY } from "@/lib/design";

/** The design D home always renders in the D palette (also after client-side navigation). */
export function ThemeLock() {
  useEffect(() => {
    document.documentElement.dataset.theme = "d";
    try {
      localStorage.setItem(DESIGN_STORAGE_KEY, "d");
    } catch {
      /* private mode */
    }
  }, []);
  return null;
}
