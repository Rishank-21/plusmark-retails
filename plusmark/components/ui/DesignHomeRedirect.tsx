"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EXPERIENCE_PATH } from "@/lib/design";

/**
 * Design D has its own home page. The pre-paint script handles full page loads of "/";
 * this covers client-side navigation (logo / Home link) while design D is active.
 */
export function DesignHomeRedirect() {
  const router = useRouter();
  useEffect(() => {
    if (document.documentElement.dataset.theme === "d") router.replace(EXPERIENCE_PATH);
  }, [router]);
  return null;
}
