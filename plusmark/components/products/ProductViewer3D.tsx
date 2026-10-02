"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, Pause, Play, RotateCcw, Box } from "lucide-react";
import { getDeviceTier, type DeviceTier } from "@/components/three/capabilities";
import { cn } from "@/lib/utils";
import { useSelectedSize } from "./SizeSelection";

const ViewerCanvas = dynamic(() => import("./ViewerCanvas"), { ssr: false });

interface ProductViewer3DProps {
  model?: string;
  fallback: string;
  alt: string;
  name: string;
  representative?: boolean;
  priority?: boolean;
  /** Product photos. When more than one (or a model exists) a thumbnail strip is shown. */
  images?: string[];
}

export type ViewerHandle = { reset: () => void };

/** Hover magnifier: lens size (px) and magnification. */
const LENS = 200;
const ZOOM = 2.5;

/**
 * Product page viewer: server-visible image first (LCP-friendly), then the GLB
 * viewer is lazily mounted when in view and WebGL is available.
 */
export function ProductViewer3D({ model, fallback, alt, name, representative, priority, images }: ProductViewer3DProps) {
  const photos = images && images.length > 0 ? images : [fallback];
  /** "3d" = model view (image shown until the model is ready); "size" = selected size photo; number = photo index. */
  const [view, setView] = useState<"3d" | "size" | number>(model ? "3d" : 0);
  const size = useSelectedSize();
  // Picking a size in the SizePicker switches the stage to that size's photo.
  useEffect(() => {
    if (size) setView("size");
  }, [size]);
  const photo = view === "size" && size ? size.image : view === "3d" || view === "size" ? fallback : photos[view];
  const showStrip = photos.length > 1 || (!!model && photos.length > 0);
  const wrap = useRef<HTMLDivElement>(null);
  const handle = useRef<ViewerHandle | null>(null);
  const [tier, setTier] = useState<DeviceTier | "pending">("pending");
  const [near, setNear] = useState(false);
  const [status, setStatus] = useState<"idle" | "ready" | "error">("idle");
  const [autoRotate, setAutoRotate] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    setTier(model ? getDeviceTier() : "none");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setAutoRotate(false);
  }, [model]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onFs = () => setFullscreen(document.fullscreenElement === wrap.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await wrap.current?.requestFullscreen();
    } catch {
      /* fullscreen not permitted — ignore */
    }
  };

  const use3D = view === "3d" && !!model && tier !== "pending" && tier !== "none" && near && status !== "error";
  const ready = use3D && status === "ready";
  /** 3D view expected (or loading): keep the photo hidden so it never flashes before the model.
   *  The photo only shows as a fallback (no WebGL / model error) or when a photo is picked. */
  const want3D = view === "3d" && !!model && tier !== "none" && status !== "error";

  /* Hover magnifier: only while a photo (not the 3D model) is on the stage, mouse pointers only. */
  const [loaded, setLoaded] = useState<{ src: string; w: number; h: number } | null>(null);
  const [lens, setLens] = useState<{ x: number; y: number; bx: number; by: number; bw: number; bh: number } | null>(null);
  const natural = loaded?.src === photo ? loaded : null;
  const zoomable = !want3D && !!natural && !fullscreen;
  useEffect(() => {
    setLens(null);
  }, [photo, zoomable]);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!zoomable || e.pointerType !== "mouse" || !natural || !wrap.current) return;
    const r = wrap.current.getBoundingClientRect();
    // Rendered image rect inside the stage (object-contain).
    const scale = Math.min(r.width / natural.w, r.height / natural.h);
    const iw = natural.w * scale, ih = natural.h * scale;
    const ix = (r.width - iw) / 2, iy = (r.height - ih) / 2;
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const px = x - ix, py = y - iy;
    if (px < 0 || py < 0 || px > iw || py > ih) return setLens(null);
    setLens({ x, y, bx: -(px * ZOOM - LENS / 2), by: -(py * ZOOM - LENS / 2), bw: iw * ZOOM, bh: ih * ZOOM });
  };

  return (
    <div className="min-w-0">
    <div
      ref={wrap}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setLens(null)}
      className={cn(
        // Plain white stage: product photos and the 3D board show their true colours (a tinted
        // studio gradient made white boards read beige).
        "group relative aspect-[4/3] w-full overflow-hidden bg-white ring-1 ring-fog",
        fullscreen && "!aspect-auto h-full",
        zoomable && "cursor-crosshair",
      )}
    >
      <Image
        onLoad={(e) => {
          const img = e.currentTarget;
          if (img.naturalWidth && img.naturalHeight) setLoaded({ src: photo, w: img.naturalWidth, h: img.naturalHeight });
        }}
        key={photo}
        data-3d-photo
        src={photo}
        alt={
          view === "size" && size
            ? `${alt} — ${size.label}`
            : typeof view !== "number" || view === 0
              ? alt
              : `${alt} — photo ${view + 1}`
        }
        fill
        priority={priority && photo === fallback}
        sizes="(min-width: 1024px) 58vw, 100vw"
        className={cn("object-contain mix-blend-multiply transition-opacity duration-700", want3D && "opacity-0")}
      />

      {lens && (
        <div
          aria-hidden
          className="pointer-events-none absolute z-10 overflow-hidden rounded-md bg-white bg-no-repeat shadow-xl ring-2 ring-white/90"
          style={{
            width: LENS,
            height: LENS,
            left: lens.x - LENS / 2,
            top: lens.y - LENS / 2,
            backgroundImage: `url("${photo}")`,
            backgroundSize: `${lens.bw}px ${lens.bh}px`,
            backgroundPosition: `${lens.bx}px ${lens.by}px`,
          }}
        />
      )}

      {use3D && (
        <div className={cn("absolute inset-0 transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}>
          <ViewerCanvas
            url={model!}
            tier={tier as Exclude<DeviceTier, "none">}
            autoRotate={autoRotate}
            handle={handle}
            onReady={() => setStatus("ready")}
            onError={() => setStatus("error")}
            label={`Interactive 3D model of the ${name}. Drag to rotate, scroll or pinch to zoom.`}
          />
        </div>
      )}

      {want3D && status === "idle" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center" aria-live="polite">
          <span className="flex items-center gap-3 bg-white/85 px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-steel ring-1 ring-line">
            <span className="font-display font-bold tracking-[0.2em] text-graphite">PLUSMARK</span>
            Loading 3D model…
          </span>
        </div>
      )}

      {ready && (
        <div className="absolute right-3 top-3 flex gap-1 opacity-80 transition-opacity hover:opacity-100 focus-within:opacity-100">
          <ViewerButton label="Reset view" onClick={() => handle.current?.reset()}>
            <RotateCcw className="size-3.5" />
          </ViewerButton>
          <ViewerButton
            label={autoRotate ? "Pause auto rotate" : "Start auto rotate"}
            pressed={autoRotate}
            onClick={() => setAutoRotate((v) => !v)}
          >
            {autoRotate ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </ViewerButton>
          <ViewerButton label={fullscreen ? "Exit fullscreen" : "Fullscreen"} onClick={toggleFullscreen}>
            {fullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </ViewerButton>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-steel">
        {ready ? (
          <>
            <Box aria-hidden className="size-3.5" />
            {representative ? "Representative 3D model" : "Interactive 3D · drag to rotate"}
          </>
        ) : view === "size" && size ? (
          <span className="bg-graphite px-2.5 py-1 text-white">Size · {size.label}</span>
        ) : view === "3d" && status === "error" ? (
          <span>3D view unavailable — showing product image</span>
        ) : null}
      </div>
    </div>

      {showStrip && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label={`${name} images`}>
          {model && (
            <li className="shrink-0">
              <button
                type="button"
                onClick={() => setView("3d")}
                aria-pressed={view === "3d"}
                aria-label="Show interactive 3D model"
                className={cn(
                  "flex size-16 flex-col items-center justify-center gap-1 bg-white font-mono text-[0.55rem] uppercase tracking-[0.12em] text-steel ring-1 transition md:size-20",
                  view === "3d" ? "ring-2 ring-accent" : "ring-fog hover:ring-line",
                )}
              >
                <Box aria-hidden className="size-4" />
                3D
              </button>
            </li>
          )}
          {photos.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                onClick={() => setView(i)}
                aria-pressed={view === i}
                aria-label={`Show photo ${i + 1} of ${photos.length}`}
                className={cn(
                  "relative block size-16 overflow-hidden bg-white ring-1 transition md:size-20",
                  view === i ? "ring-2 ring-accent" : "ring-fog hover:ring-line",
                )}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-contain" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ViewerButton({
  label,
  onClick,
  pressed,
  children,
}: {
  label: string;
  onClick: () => void;
  pressed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      className="flex size-8 items-center justify-center bg-white/85 text-graphite ring-1 ring-line backdrop-blur transition-colors hover:bg-white"
    >
      {children}
    </button>
  );
}
