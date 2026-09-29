"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { DESIGNS, DESIGN_STORAGE_KEY, EXPERIENCE_PATH, type DesignId } from "@/lib/design";

/**
 * Floating "Design A / B / C / D" picker so the client can compare the site variants.
 * The choice is stored in localStorage and can be shared as a link with ?design=b.
 * The pre-paint script in app/layout.tsx applies the stored choice before first render.
 * A–C restyle the same pages; D also swaps the home page for its own 3D layout (/experience).
 */
function applyDesign(id: DesignId) {
  const root = document.documentElement;
  if (id === "a") delete root.dataset.theme;
  else root.dataset.theme = id;
  try {
    localStorage.setItem(DESIGN_STORAGE_KEY, id);
  } catch {
    /* private mode: choice lasts for this page only */
  }
}

export function ThemeSwitcher() {
  const [current, setCurrent] = useState<DesignId>("a");
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const t = document.documentElement.dataset.theme as DesignId | undefined;
    // Sync with the value the pre-paint script (or the D home page) already applied.
    setCurrent(t && DESIGNS.some((d) => d.id === t) ? t : "a");
  }, [pathname]);

  const choose = (id: DesignId) => {
    setCurrent(id);
    applyDesign(id);
    // Home pages differ between D and A–C: jump to the matching one.
    if (id === "d" && pathname === "/") return router.push(EXPERIENCE_PATH);
    if (id !== "d" && pathname === EXPERIENCE_PATH) return router.push(`/?design=${id}`);
    const url = new URL(window.location.href);
    url.searchParams.set("design", id);
    window.history.replaceState(window.history.state, "", url);
  };

  const active = DESIGNS.find((d) => d.id === current) ?? DESIGNS[0];

  return (
    <div className="fixed bottom-5 left-5 z-40 md:bottom-7 md:left-7">
      {open && (
        <ul className="mb-2 w-72 space-y-2 rounded-2xl bg-white/95 p-3 text-xs shadow-[var(--shadow-lift)] ring-1 ring-line backdrop-blur">
          {DESIGNS.map((d) => (
            <li key={d.id}>
              <span className="font-semibold text-graphite">
                {d.id.toUpperCase()} · {d.name}
              </span>
              <span className="block text-steel">{d.note}</span>
            </li>
          ))}
        </ul>
      )}
      <div
        role="group"
        aria-label="Website design variant"
        className="flex items-center gap-1 rounded-full bg-white/90 p-1.5 shadow-[var(--shadow-lift)] ring-1 ring-line backdrop-blur"
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="hidden rounded-full px-3 py-1.5 text-left font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel sm:block"
        >
          Design · <span className="text-graphite">{active.name}</span>
        </button>
        {DESIGNS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => choose(d.id)}
            aria-pressed={current === d.id}
            aria-label={`Design ${d.id.toUpperCase()}: ${d.name}`}
            title={`${d.name} — ${d.note}`}
            className={cn(
              "flex size-9 items-center justify-center rounded-full text-xs font-bold transition-[box-shadow,transform] duration-300 hover:scale-105",
              current === d.id ? "ring-2 ring-offset-2 ring-offset-white" : "ring-1 ring-line",
            )}
            style={{
              background: `linear-gradient(135deg, ${d.swatch[0]} 0 50%, ${d.swatch[1]} 50% 100%)`,
              color: "#fff",
              // ring colour follows the variant's own deep tone
              ["--tw-ring-color" as string]: current === d.id ? d.swatch[0] : undefined,
            }}
          >
            {d.id.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
