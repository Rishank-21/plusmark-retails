"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Video } from "@/data/media";

/**
 * Pinned 3D carousel of the Drive films (CSS 3D, no WebGL): scrolling spins the ring,
 * clicking a card opens the 1080p film in a dialog.
 */
export function VideoRing({ videos }: { videos: Video[] }) {
  const section = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [playing, setPlaying] = useState<Video | null>(null);
  const [radius, setRadius] = useState(560);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.5 });
  const rotate = useTransform(p, [0, 1], [18, -342]);
  const tilt = useTransform(p, [0, 0.5, 1], [-6, -2, -6]);
  // cinematic entrance: the reel settles from 90% to 100% as the section arrives
  const { scrollYProgress: arrive } = useScroll({ target: section, offset: ["start end", "start start"] });
  const enter = useTransform(arrive, [0, 1], [0.9, 1]);
  const enterO = useTransform(arrive, [0, 0.6], [0.4, 1]);

  const n = videos.length;
  useEffect(() => {
    const measure = () => {
      const card = window.innerWidth < 640 ? 220 : 320;
      setRadius(Math.round(card / (2 * Math.tan(Math.PI / n)) + 40));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [n]);

  const openVideo = (v: Video) => {
    setPlaying(v);
    dialog.current?.showModal();
  };
  const close = () => {
    dialog.current?.close();
  };

  return (
    <section id="xd-films" ref={section} aria-labelledby="xd-films-title" className="relative z-10 h-[260vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center overflow-hidden">
        <div className="relative z-10 px-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">On camera · 1080p</p>
          <h2 id="xd-films-title" className="mt-4 font-display text-[clamp(2.25rem,4.4vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-graphite">
            Spin the <span className="xd-grad-text">film reel.</span>
          </h2>
        </div>

        <motion.div style={{ scale: enter, opacity: enterO }} className="relative mt-10 h-[46vh] w-full [perspective:1800px] sm:h-[52vh]">
          <motion.ul
            className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]"
            style={{ rotateY: rotate, rotateX: tilt }}
          >
            {videos.map((v, i) => (
              <li
                key={v.src}
                className="absolute -translate-x-1/2 -translate-y-1/2 [backface-visibility:hidden]"
                style={{ transform: `rotateY(${(360 / n) * i}deg) translateZ(${radius}px)` }}
              >
                <button
                  type="button"
                  onClick={() => openVideo(v)}
                  className="group block w-[220px] overflow-hidden rounded-xl bg-white text-left shadow-[0_1px_2px_rgb(27_23_64/0.06),0_30px_60px_-30px_rgb(27_23_64/0.5)] ring-1 ring-[rgb(27_23_64/0.08)] transition-transform duration-300 hover:-translate-y-1 sm:w-[320px]"
                >
                  <span className="relative block aspect-video overflow-hidden bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {v.poster && (
                      <img
                        src={v.poster}
                        alt={v.title}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#15123a]/55 via-transparent to-transparent">
                      <span className="flex size-11 items-center justify-center rounded-full bg-white/90 text-graphite shadow-[0_8px_20px_-8px_rgb(27_23_64/0.5)] backdrop-blur transition-transform duration-300 group-hover:scale-105">
                        <Play aria-hidden className="size-5 translate-x-0.5 fill-current" />
                      </span>
                    </span>
                  </span>
                  <span className="block px-4 py-3">
                    <span className="block truncate text-sm font-semibold text-graphite">{v.title}</span>
                    <span className="sr-only">Play video</span>
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </div>

      <dialog
        ref={dialog}
        onClose={() => setPlaying(null)}
        onClick={(e) => e.target === dialog.current && close()}
        aria-label={playing?.title ?? "Video"}
        className="m-auto w-[min(92vw,72rem)] overflow-hidden rounded-xl bg-white p-0 shadow-2xl backdrop:bg-[#15123a]/75 backdrop:backdrop-blur-sm"
      >
        {playing && (
          <div>
            <div className="relative aspect-video bg-[#15123a]">
              <video key={playing.src} className="size-full" src={playing.src} poster={playing.poster} controls autoPlay playsInline />
            </div>
            <div className="flex items-start justify-between gap-4 p-5 md:p-6">
              <div>
                <p className="font-display text-lg font-semibold text-graphite">{playing.title}</p>
                <p className="mt-1 text-sm text-steel">{playing.caption}</p>
              </div>
              <button type="button" onClick={close} aria-label="Close video" className="xd-btn-ghost !h-11 shrink-0 !px-3">
                <X aria-hidden className="size-5" />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
