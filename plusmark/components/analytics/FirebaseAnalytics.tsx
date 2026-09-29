"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { Analytics } from "firebase/analytics";
import { firebaseConfig } from "@/lib/firebase-config";

/**
 * Firebase (Google) Analytics for the public site. Loaded lazily after hydration so it
 * never blocks rendering, and skipped on /admin. Logs a page_view on every client-side
 * route change (the SDK only logs the first one automatically).
 */
export function FirebaseAnalytics() {
  const pathname = usePathname();
  const analytics = useRef<Promise<Analytics | null> | null>(null);
  const lastLogged = useRef<string | null>(null);

  useEffect(() => {
    if (!firebaseConfig.measurementId || pathname.startsWith("/admin")) return;

    // The SDK logs the landing page_view itself on init; we only log later navigations.
    const isInit = !analytics.current;
    analytics.current ??= (async () => {
      const [{ initializeApp, getApps }, { getAnalytics, isSupported }] = await Promise.all([
        import("firebase/app"),
        import("firebase/analytics"),
      ]);
      if (!(await isSupported())) return null;
      const app = getApps()[0] ?? initializeApp(firebaseConfig);
      return getAnalytics(app);
    })().catch((err) => {
      console.warn("[analytics] Firebase Analytics unavailable", err);
      return null;
    });

    if (isInit) {
      lastLogged.current = pathname;
      return;
    }
    if (lastLogged.current === pathname) return;
    lastLogged.current = pathname;
    void analytics.current.then(async (a) => {
      if (!a) return;
      const { logEvent } = await import("firebase/analytics");
      logEvent(a, "page_view", {
        page_path: pathname,
        page_location: window.location.href,
        page_title: document.title,
      });
    });
  }, [pathname]);

  return null;
}
