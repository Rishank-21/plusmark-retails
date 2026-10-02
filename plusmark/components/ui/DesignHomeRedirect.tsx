"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DESIGN_HOMES, type DesignId } from "@/lib/design";

/**
 * Designs D and E have their own home pages. The pre-paint script handles full page loads of
 * "/"; this covers client-side navigation (logo / Home link) while one of them is active.
 */
export function DesignHomeRedirect() {
  const router = useRouter();
  useEffect(() => {
    const home = DESIGN_HOMES[document.documentElement.dataset.theme as DesignId];
    if (home) router.replace(home);
  }, [router]);
  return null;
}
