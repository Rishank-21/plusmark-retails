"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Video } from "@/data/media";
import { videoEmbed, withAutoplay } from "@/lib/video-embed";

type VideoMode = "scroll" | "normal";

export function VideoRing({ videos, mode = "scroll" }: { videos: Video[]; mode?: VideoMode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [playing, setPlaying] = useState<Video | null>(null);
  const openVideo = (video: Video) => {
    setPlaying(video);
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();

  return (
    <>
      {mode === "scroll" ? <ScrollReel videos={videos} onOpen={openVideo} /> : <NormalShelf videos={videos} onOpen={openVideo} />}
      <dialog
        ref={dialog}
        onClose={() => setPlaying(null)}
        onClick={(event) => event.target === dialog.current && close()}
        aria-label={playing?.title ?? "Video"}
        className="m-auto w-[min(92vw,72rem)] overflow-hidden rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-[#15123a]/75 backdrop:backdrop-blur-sm"
      >
        {playing && (
          <div>
            <div className="relative aspect-video bg-[#15123a]">
              {(() => {
                const embed = videoEmbed(playing.src).embedUrl;
                return embed ? (
                  <iframe key={playing.src} src={withAutoplay(embed)} title={playing.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="size-full border-0" />
                ) : (
                  <video key={playing.src} className="size-full" src={playing.src} poster={playing.poster} controls autoPlay playsInline />
                );
              })()}
            </div>
            <div className="flex items-start justify-between gap-4 p-5 md:p-6">
              <div>
                <p className="font-display text-lg font-semibold text-graphite">{playing.title}</p>
                <p className="mt-1 text-sm text-steel">{playing.caption}</p>
              </div>
              <button type="button" onClick={close} aria-label="Close video" className="xd-btn-ghost !h-11 shrink-0 !px-3"><X aria-hidden className="size-5" /></button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

function ScrollReel({ videos, onOpen }: { videos: Video[]; onOpen: (video: Video) => void }) {
  const section = useRef<HTMLElement>(null);
  const [radius, setRadius] = useState(560);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.5 });
  const rotate = useTransform(progress, [0, 1], [18, -342]);
  const tilt = useTransform(progress, [0, 0.5, 1], [-6, -2, -6]);
  const { scrollYProgress: arrive } = useScroll({ target: section, offset: ["start end", "start start"] });
  const enter = useTransform(arrive, [0, 1], [0.9, 1]);
  const enterOpacity = useTransform(arrive, [0, 0.6], [0.4, 1]);
  const count = videos.length;

  useEffect(() => {
    const measure = () => {
      const card = window.innerWidth < 640 ? 220 : 320;
      setRadius(Math.round(card / (2 * Math.tan(Math.PI / Math.max(count, 1))) + 40));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [count]);

  return (
    <section id="xd-films" ref={section} aria-labelledby="xd-films-title" className="relative z-10 h-[260vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center overflow-hidden">
        <div className="relative z-10 px-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">On camera · 1080p</p>
          <h2 id="xd-films-title" className="mt-4 font-display text-[clamp(2.25rem,4.4vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-graphite">Spin the <span className="xd-grad-text">film reel.</span></h2>
        </div>
        <motion.div style={{ scale: enter, opacity: enterOpacity }} className="relative mt-10 h-[46vh] w-full [perspective:1800px] sm:h-[52vh]">
          <motion.ul className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]" style={{ rotateY: rotate, rotateX: tilt }}>
            {videos.map((video, index) => (
              <li key={`${video.src}-${index}`} className="absolute -translate-x-1/2 -translate-y-1/2 [backface-visibility:hidden]" style={{ transform: `rotateY(${(360 / Math.max(count, 1)) * index}deg) translateZ(${radius}px)` }}>
                <VideoCard video={video} onOpen={onOpen} compact index={index} />
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
}

function NormalShelf({ videos, onOpen }: { videos: Video[]; onOpen: (video: Video) => void }) {
  const shelf = useRef<HTMLUListElement>(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (videos.length < 2 || paused) return;
    const interval = window.setInterval(() => {
      const list = shelf.current;
      const card = list?.querySelector<HTMLElement>("li");
      if (!list || !card) return;
      const step = card.getBoundingClientRect().width + 24;
      const atEnd = list.scrollLeft + list.clientWidth >= list.scrollWidth - step / 2;
      list.scrollTo({ left: atEnd ? 0 : list.scrollLeft + step, behavior: "smooth" });
    }, 4500);
    return () => window.clearInterval(interval);
  }, [paused, videos.length]);

  return (
    <section id="xd-films" aria-labelledby="xd-films-title" className="relative z-10 py-20 md:py-28">
      <div className="container-x"><div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center"><h2 id="xd-films-title" className="font-display text-[clamp(2.25rem,4.4vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-graphite">See the <span className="xd-grad-text">difference.</span></h2><p className="max-w-xl text-sm leading-relaxed text-steel">Swipe through the Plusmark range, installations and real product details.</p></div></div>
      <div className="mt-10 overflow-hidden md:mt-14" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)} onTouchStart={() => setPaused(true)} onTouchEnd={() => setPaused(false)}>
        <ul ref={shelf} className="scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto px-[max(1.25rem,calc((100vw-80rem)/2))] pb-5 sm:gap-6">
          {videos.map((video, index) => <li key={`${video.src}-${index}`} className="w-[min(82vw,30rem)] shrink-0 snap-start sm:w-[min(68vw,38rem)] lg:w-[min(48vw,42rem)]"><VideoCard video={video} onOpen={onOpen} index={index} /></li>)}
        </ul>
      </div>
    </section>
  );
}

function VideoCard({ video, onOpen, compact = false, index = 0 }: { video: Video; onOpen: (video: Video) => void; compact?: boolean; index?: number }) {
  return (
    <button type="button" onClick={() => onOpen(video)} className={compact ? "group block w-[220px] overflow-hidden rounded-xl bg-white text-left shadow-[0_1px_2px_rgb(27_23_64/0.06),0_30px_60px_-30px_rgb(27_23_64/0.5)] ring-1 ring-[rgb(27_23_64/0.08)] transition-transform duration-300 hover:-translate-y-1 sm:w-[320px]" : "group block w-full overflow-hidden rounded-[1.5rem] bg-white text-left shadow-[0_22px_60px_-34px_rgb(20_25_30/0.55)] ring-1 ring-black/[0.07] transition-[box-shadow,transform] duration-500 hover:-translate-y-1 motion-reduce:hover:translate-y-0"}>
      <span className={`relative block aspect-video overflow-hidden bg-[#17191c] ${compact ? "" : ""}`}>
        {video.poster ? <img src={video.poster} alt={compact ? video.title : ""} loading={index < 2 ? "eager" : "lazy"} className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" /> : <span className="absolute inset-0 bg-gradient-to-br from-graphite to-steel" />}
        <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#15123a]/55 via-transparent to-transparent"><span className="flex size-11 items-center justify-center rounded-full bg-white/90 text-graphite shadow-xl transition-transform duration-300 group-hover:scale-105"><Play aria-hidden className="size-5 translate-x-0.5 fill-current" /></span></span>
      </span>
      <span className={compact ? "block px-4 py-3" : "block px-5 py-5 sm:px-6 sm:py-6"}><span className={compact ? "block truncate text-sm font-semibold text-graphite" : "block font-display text-lg font-semibold text-graphite sm:text-xl"}>{video.title}</span>{!compact && video.caption && <span className="mt-2 block line-clamp-2 text-sm leading-relaxed text-steel">{video.caption}</span>}</span>
    </button>
  );
}
