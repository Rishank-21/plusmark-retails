"use client";

import { useEffect } from "react";
import { DESIGN_STORAGE_KEY, type DesignId } from "@/lib/design";

/** A design's own home page always renders in that design's palette (also after client-side navigation). */
export function ThemeLock({ id = "d" }: { id?: DesignId }) {
  useEffect(() => {
    document.documentElement.dataset.theme = id;
    try {
      localStorage.setItem(DESIGN_STORAGE_KEY, id);
    } catch {
      /* private mode */
    }
  }, [id]);
  return null;
}
