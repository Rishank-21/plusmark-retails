"use client";

import { useState } from "react";
import { addVideo, updateVideo, deleteVideo, reorderVideos, type VideoWithId } from "./actions";
import { ArrowDown, ArrowUp, Check, ExternalLink, Film, GripVertical, Pencil, Play, Plus, Search, Tag, Trash2, Video as VideoIcon, X } from "lucide-react";
import { Drawer, DropUpload, EmptyState, Field, FormFooter, MoreSection, Stat, btnDanger, btnGhost, btnPrimary, inputCls, useOpenOnNew, useToast } from "../form-kit";
import { cn } from "@/lib/utils";

export type ProductOption = { slug: string; name: string };

/** YouTube / Vimeo links play in an iframe; anything else is treated as a video file URL. */
function embedInfo(url?: string): { type: "youtube" | "vimeo" | "file"; embedUrl?: string } {
  const u = url?.trim() ?? "";
  const yt = u.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (yt) return { type: "youtube", embedUrl: `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0` };
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${vm[1]}` };
  return { type: "file" };
}

/** YouTube thumbnail when no poster was set. */
function thumbFor(v: Pick<VideoWithId, "src" | "poster">) {
  if (v.poster) return v.poster;
  const yt = v.src.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  return yt ? `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg` : "";
}

type Draft = { src: string; poster: string; title: string; caption: string; productSlugs: string[] };
const emptyDraft: Draft = { src: "", poster: "", title: "", caption: "", productSlugs: [] };

export function VideosManager({ initialVideos, products }: { initialVideos: VideoWithId[]; products: ProductOption[] }) {
  const [videos, setVideos] = useState(initialVideos);
  const [panel, setPanel] = useState<{ mode: "add" } | { mode: "edit"; id: string } | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [errors, setErrors] = useState<{ src?: string; title?: string }>({});
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<VideoWithId | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [toast, showToast] = useToast();

  const nameOf = (slug: string) => products.find((p) => p.slug === slug)?.name ?? slug;

  const openAdd = () => {
    setDraft(emptyDraft);
    setErrors({});
    setPanel({ mode: "add" });
  };
  const openEdit = (v: VideoWithId) => {
    setDraft({ src: v.src, poster: v.poster ?? "", title: v.title, caption: v.caption ?? "", productSlugs: v.productSlugs ?? [] });
    setErrors({});
    setPanel({ mode: "edit", id: v.id });
  };
  const close = () => !saving && setPanel(null);
  useOpenOnNew(openAdd);

  const save = async () => {
    const errs: typeof errors = {};
    if (!draft.src.trim()) errs.src = "Upload a video or paste a link";
    if (!draft.title.trim()) errs.title = "Give the video a title";
    setErrors(errs);
    if (Object.keys(errs).length || !panel) return;

    setSaving(true);
    try {
      const data = {
        src: draft.src.trim(),
        poster: draft.poster.trim(),
        title: draft.title.trim(),
        caption: draft.caption.trim(),
        productSlugs: draft.productSlugs,
      };
      if (panel.mode === "add") {
        const res = await addVideo(data, videos.length);
        if (!res.id) throw new Error("Could not add the video");
        setVideos((vs) => [...vs, { id: res.id!, ...data }]);
        showToast("Video published");
      } else {
        await updateVideo(panel.id, data);
        setVideos((vs) => vs.map((v) => (v.id === panel.id ? { ...v, ...data } : v)));
        showToast("Changes saved");
      }
      setPanel(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (v: VideoWithId) => {
    if (!confirm(`Delete the video "${v.title}"?`)) return;
    try {
      await deleteVideo(v.id);
      setVideos((vs) => vs.filter((x) => x.id !== v.id));
      showToast("Video deleted");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not delete video", "error");
    }
  };

  const persistOrder = async (list: VideoWithId[]) => {
    try {
      await reorderVideos(list.map((v) => v.id));
      showToast("Order saved");
    } catch {
      showToast("Could not save the new order", "error");
    }
  };

  const move = (index: number, dir: -1 | 1) => {
    const to = index + dir;
    if (to < 0 || to >= videos.length) return;
    const next = [...videos];
    [next[index], next[to]] = [next[to], next[index]];
    setVideos(next);
    persistOrder(next);
  };

  const onDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    setVideos((vs) => {
      const next = [...vs];
      const from = next.findIndex((v) => v.id === draggedId);
      const to = next.findIndex((v) => v.id === targetId);
      if (from < 0 || to < 0) return vs;
      next.splice(to, 0, next.splice(from, 1)[0]);
      return next;
    });
  };

  const linked = videos.filter((v) => v.productSlugs?.length).length;

  return (
    <div className="space-y-5">
      {toast}

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Videos" value={videos.length} />
        <Stat label="On product pages" value={linked} />
        <Stat label="Reel only" value={videos.length - linked} hint="Home page film reel" />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="px-1 text-sm text-steel">Drag a row (or use the arrows) to change the order in the film reel.</p>
        <button type="button" onClick={openAdd} className={btnPrimary}>
          <Plus aria-hidden className="size-4" /> Add video
        </button>
      </div>

      {videos.length ? (
        <ul className="space-y-3">
          {videos.map((v, index) => {
            const thumb = thumbFor(v);
            return (
              <li
                key={v.id}
                draggable
                onDragStart={() => setDraggedId(v.id)}
                onDragOver={(e) => onDragOver(e, v.id)}
                onDragEnd={() => {
                  if (draggedId) persistOrder(videos);
                  setDraggedId(null);
                }}
                className={cn(
                  "group flex flex-col gap-4 rounded-2xl border border-line bg-white p-3 transition hover:border-steel/30 hover:shadow-sm sm:flex-row sm:items-center",
                  draggedId === v.id && "border-dashed border-brand opacity-50",
                )}
              >
                <span aria-hidden className="hidden cursor-grab pl-1 text-steel/40 group-hover:text-steel sm:block">
                  <GripVertical className="size-5" />
                </span>
                <button
                  type="button"
                  onClick={() => setPreview(v)}
                  aria-label={`Play ${v.title}`}
                  className="group/t relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-graphite sm:w-48 cursor-pointer"
                >
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt="" className="size-full object-cover transition-transform duration-500 group-hover/t:scale-105" />
                  ) : (
                    <span className="flex size-full items-center justify-center text-white/40">
                      <Film aria-hidden className="size-7" />
                    </span>
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition group-hover/t:bg-black/10">
                    <span className="flex size-10 items-center justify-center rounded-full bg-white/95 shadow-md transition-transform group-hover/t:scale-110">
                      <Play aria-hidden className="ml-0.5 size-4 fill-graphite text-graphite" />
                    </span>
                  </span>
                  <span className="absolute left-2 top-2 rounded-md bg-black/70 px-1.5 py-0.5 font-mono text-[0.62rem] text-white">#{index + 1}</span>
                </button>

                <div className="min-w-0 flex-1 px-1">
                  <h3 className="truncate font-semibold text-graphite">{v.title}</h3>
                  {v.caption && <p className="mt-0.5 line-clamp-2 text-sm text-steel">{v.caption}</p>}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {v.productSlugs?.length ? (
                      v.productSlugs.map((s) => (
                        <span key={s} className="inline-flex items-center gap-1 rounded-md bg-mist px-2 py-0.5 text-xs text-graphite ring-1 ring-fog">
                          <Tag aria-hidden className="size-3 text-steel" /> {nameOf(s)}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-steel">Film reel only</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-line pt-3 sm:border-0 sm:pt-0">
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${v.title} up`} className={cn(btnGhost, "px-2 disabled:opacity-40")}>
                    <ArrowUp aria-hidden className="size-3.5" />
                  </button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === videos.length - 1} aria-label={`Move ${v.title} down`} className={cn(btnGhost, "px-2 disabled:opacity-40")}>
                    <ArrowDown aria-hidden className="size-3.5" />
                  </button>
                  <button type="button" onClick={() => openEdit(v)} className={btnGhost}>
                    <Pencil aria-hidden className="size-3.5" /> Edit
                  </button>
                  <button type="button" onClick={() => remove(v)} aria-label={`Delete ${v.title}`} className={cn(btnDanger, "px-2")}>
                    <Trash2 aria-hidden className="size-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon={VideoIcon}
          title="No videos yet"
          text="Add product demos or installation videos for the home page film reel and product pages."
          action={
            <button type="button" onClick={openAdd} className={btnPrimary}>
              <Plus aria-hidden className="size-4" /> Add video
            </button>
          }
        />
      )}

      {/* Add / edit */}
      <Drawer
        open={!!panel}
        onClose={close}
        title={panel?.mode === "edit" ? "Edit video" : "Add a video"}
        subtitle="Upload a file or paste a YouTube, Vimeo or MP4 link."
        footer={<FormFooter onCancel={close} onSave={save} saving={saving} saveLabel={panel?.mode === "edit" ? "Save changes" : "Publish video"} />}
      >
        <Field label="Video" required error={errors.src}>
          {draft.src ? (
            <VideoPreview src={draft.src} poster={draft.poster} onClear={() => setDraft({ ...draft, src: "", poster: "" })} />
          ) : (
            <DropUpload
              kind="video"
              maxMb={100}
              accept="video/mp4,video/quicktime,video/webm"
              title="Drop a video here, or click to choose"
              hint="MP4, MOV or WEBM · up to 100 MB"
              onUploaded={(f) => {
                setDraft((d) => ({ ...d, src: f.url, poster: d.poster || f.posterUrl || "" }));
                setErrors((e) => ({ ...e, src: undefined }));
              }}
              onLink={(url) => {
                setDraft((d) => ({ ...d, src: url }));
                setErrors((e) => ({ ...e, src: undefined }));
              }}
              linkPlaceholder="…or paste a YouTube, Vimeo or MP4 link"
            />
          )}
        </Field>

        <Field label="Title" required htmlFor="video-title" error={errors.title}>
          <input
            id="video-title"
            value={draft.title}
            onChange={(e) => {
              setDraft({ ...draft, title: e.target.value });
              if (errors.title) setErrors({ ...errors, title: undefined });
            }}
            placeholder="e.g. Metallic Premium White Board"
            className={inputCls(!!errors.title)}
          />
        </Field>

        <Field label="Short caption" htmlFor="video-caption" hint="One line shown under the video.">
          <textarea
            id="video-caption"
            rows={2}
            value={draft.caption}
            onChange={(e) => setDraft({ ...draft, caption: e.target.value })}
            placeholder="e.g. Aluminium frame, marker-grade HPL surface and easy wall mounting."
            className={inputCls()}
          />
        </Field>

        <Field label="Show on product pages" hint="Leave empty to show this video only in the home page film reel.">
          <ProductPicker options={products} selected={draft.productSlugs} onChange={(productSlugs) => setDraft({ ...draft, productSlugs })} />
        </Field>

        <MoreSection title="Thumbnail" summary={draft.poster ? "Custom thumbnail set" : "Picked automatically for uploads"}>
          <Field label="Thumbnail image link" htmlFor="video-poster" hint="The still image shown before the video plays.">
            <input
              id="video-poster"
              type="url"
              value={draft.poster}
              onChange={(e) => setDraft({ ...draft, poster: e.target.value })}
              placeholder="https://…"
              className={inputCls()}
            />
          </Field>
        </MoreSection>
      </Drawer>

      {/* Player */}
      {preview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={preview.title}
          className="fixed inset-0 z-[60] flex animate-fade items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setPreview(null)}
          onKeyDown={(e) => e.key === "Escape" && setPreview(null)}
        >
          <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-ink text-white shadow-2xl ring-1 ring-white/10">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
              <h3 className="truncate text-sm font-semibold">{preview.title}</h3>
              <div className="flex items-center gap-1">
                <a href={preview.src} target="_blank" rel="noopener noreferrer" aria-label="Open video in a new tab" className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white">
                  <ExternalLink aria-hidden className="size-4" />
                </a>
                <button type="button" autoFocus onClick={() => setPreview(null)} aria-label="Close" className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white cursor-pointer">
                  <X aria-hidden className="size-4" />
                </button>
              </div>
            </div>
            <Player src={preview.src} poster={preview.poster} autoPlay />
            <div className="flex items-center justify-between gap-3 px-5 py-3">
              <p className="line-clamp-1 text-xs text-white/60">{preview.caption}</p>
              <button
                type="button"
                onClick={() => {
                  const v = preview;
                  setPreview(null);
                  openEdit(v);
                }}
                className="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20 cursor-pointer"
              >
                Edit details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Player({ src, poster, autoPlay }: { src: string; poster?: string; autoPlay?: boolean }) {
  const info = embedInfo(src);
  return (
    <div className="aspect-video w-full bg-black">
      {info.embedUrl ? (
        <iframe
          src={autoPlay ? `${info.embedUrl}${info.embedUrl.includes("?") ? "&" : "?"}autoplay=1` : info.embedUrl}
          title="Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="size-full border-0"
        />
      ) : (
        <video key={src} src={src} poster={poster || undefined} controls autoPlay={autoPlay} playsInline className="size-full object-contain">
          Your browser can&apos;t play this video.
        </video>
      )}
    </div>
  );
}

function VideoPreview({ src, poster, onClear }: { src: string; poster?: string; onClear: () => void }) {
  const info = embedInfo(src);
  const label = info.type === "youtube" ? "YouTube" : info.type === "vimeo" ? "Vimeo" : "Video file";
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <Player src={src} poster={poster} />
      <div className="flex items-center gap-3 bg-mist/60 px-3 py-2.5">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
          <Check aria-hidden className="size-3" /> {label}
        </span>
        <span className="min-w-0 flex-1 truncate font-mono text-[0.68rem] text-steel">{src}</span>
        <button type="button" onClick={onClear} className={btnGhost}>
          Change
        </button>
      </div>
    </div>
  );
}

/** Searchable checklist of catalog products, by name rather than slug. */
function ProductPicker({ options, selected, onChange }: { options: ProductOption[]; selected: string[]; onChange: (s: string[]) => void }) {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const list = term ? options.filter((o) => o.name.toLowerCase().includes(term)) : options;
  const toggle = (slug: string) => onChange(selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug]);

  return (
    <div className="rounded-xl border border-line">
      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 border-b border-line p-3">
          {selected.map((s) => (
            <li key={s} className="inline-flex items-center gap-1 rounded-md bg-graphite py-1 pl-2.5 pr-1 text-xs text-white">
              {options.find((o) => o.slug === s)?.name ?? s}
              <button type="button" onClick={() => toggle(s)} aria-label="Remove" className="rounded p-0.5 hover:bg-white/15 cursor-pointer">
                <X aria-hidden className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="relative border-b border-line">
        <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-steel/60" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          className="w-full bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-steel/50"
        />
      </div>
      <ul className="max-h-56 overflow-y-auto p-1.5">
        {list.length ? (
          list.map((o) => {
            const on = selected.includes(o.slug);
            return (
              <li key={o.slug}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => toggle(o.slug)}
                  className={cn("flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition cursor-pointer", on ? "bg-accent-soft/60 text-graphite" : "hover:bg-mist")}
                >
                  <span className={cn("flex size-4 shrink-0 items-center justify-center rounded border", on ? "border-brand bg-brand text-white" : "border-line bg-white")}>
                    {on && <Check aria-hidden className="size-3" />}
                  </span>
                  <span className="truncate">{o.name}</span>
                </button>
              </li>
            );
          })
        ) : (
          <li className="px-3 py-4 text-center text-sm text-steel">No products match “{q}”.</li>
        )}
      </ul>
    </div>
  );
}
