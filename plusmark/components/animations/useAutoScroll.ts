"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Endless horizontal auto-scroll for an `overflow-x-auto` track whose children are rendered
 * twice (the second copy is decorative). The track stays a real scroller, so users can still
 * swipe or use the buttons. Motion pauses while the pointer is over it, while it is touched,
 * while something inside has focus, and for a moment after a manual nudge. It never runs for
 * reduced-motion users or while off screen.
 */
export function useAutoScroll<T extends HTMLElement>({ speed = 36, reverse = false }: { speed?: number; reverse?: boolean } = {}) {
  const ref = useRef<T>(null);
  const hover = useRef(false);
  const touch = useRef(false);
  const focus = useRef(false);
  const holdUntil = useRef(0);
  const touchTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let raf = 0;
    let last = 0;
    let pos = -1;

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "10% 0px" });
    io.observe(el);

    const tick = (t: number) => {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;
      const half = el.scrollWidth / 2;
      if (pos < 0) pos = reverse ? half : 0;
      const paused = hover.current || touch.current || focus.current || t < holdUntil.current;
      if (!visible || rm.matches || paused || half <= el.clientWidth / 2) {
        // follow manual scrolling so auto-scroll resumes from where the user left it
        pos = el.scrollLeft;
      } else {
        pos += (reverse ? -speed : speed) * dt;
        if (pos >= half) pos -= half;
        if (pos <= 0) pos += half;
        el.scrollLeft = pos;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.clearTimeout(touchTimer.current);
    };
  }, [speed, reverse]);

  /** Scroll by one step (e.g. a card width) and hold auto-scroll briefly. */
  const nudge = useCallback((dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    holdUntil.current = performance.now() + 2500;
    const child = el.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const step = (child?.offsetWidth ?? el.clientWidth * 0.8) + gap;
    const half = el.scrollWidth / 2;
    // stay inside the doubled track so both directions keep going
    if (dir < 0 && el.scrollLeft < step) el.scrollLeft += half;
    if (dir > 0 && el.scrollLeft + el.clientWidth + step > el.scrollWidth) el.scrollLeft -= half;
    el.scrollBy({ left: dir * step, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, []);

  const handlers = {
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") hover.current = true;
    },
    onPointerLeave: (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") hover.current = false;
    },
    onTouchStart: () => {
      window.clearTimeout(touchTimer.current);
      touch.current = true;
    },
    onTouchEnd: () => {
      // give momentum scrolling and a tap on "View product" time to finish
      window.clearTimeout(touchTimer.current);
      touchTimer.current = window.setTimeout(() => (touch.current = false), 2500);
    },
    onTouchCancel: () => {
      window.clearTimeout(touchTimer.current);
      touchTimer.current = window.setTimeout(() => (touch.current = false), 2500);
    },
    onFocus: () => (focus.current = true),
    onBlur: (e: React.FocusEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) focus.current = false;
    },
  };

  return { ref, nudge, handlers };
}
