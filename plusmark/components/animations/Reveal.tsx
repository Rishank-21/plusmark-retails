"use client";

import { useEffect, useRef } from "react";

type RevealProps = React.HTMLAttributes<HTMLElement> & {
  delay?: number;
  as?: "div" | "li" | "section" | "article";
  children?: React.ReactNode;
};

/**
 * Scroll-reveal wrapper. Content is server-rendered and fully visible without JS:
 * the hidden start state only applies when <html> has the `js` class (set by an
 * inline script before paint). An IntersectionObserver then adds `is-in`.
 */
export function Reveal({ delay = 0, as = "div", children, style, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as as "div";
  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      data-reveal=""
      style={{ ...style, transitionDelay: delay ? `${delay}s` : undefined }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
