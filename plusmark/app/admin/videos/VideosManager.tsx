"use client";

import { useState, useRef, useEffect } from "react";
import {
  addVideo,
  updateVideo,
  deleteVideo,
  reorderVideos,
  uploadVideoToCloudinary,
  uploadVideoFileToCloudinary,
  type VideoWithId,
} from "./actions";
import {
  Pencil,
  Trash2,
  Plus,
  GripVertical,
  Play,
  Upload,
  Link as LinkIcon,
  Film,
  Video as VideoIcon,
  Tag,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VideosManagerProps {
  initialVideos: VideoWithId[];
}

/** Helper to parse YouTube, Vimeo or direct video URLs */
function getVideoEmbedInfo(url?: string): {
  isEmbed: boolean;
  type: "youtube" | "vimeo" | "direct";
  embedUrl?: string;
} {
  if (!url) return { isEmbed: false, type: "direct" };
  const trimmed = url.trim();

  // YouTube match (watch?v=, youtu.be/, shorts/, embed/)
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return {
      isEmbed: true,
      type: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
    };
  }

  // Vimeo match
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      isEmbed: true,
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
    };
  }

  return { isEmbed: false, type: "direct" };
}

const COMMON_SLUGS = [
  "eco-premium-white-board",
  "metallic-premium-white-board",
  "eco-premium-chalk-board",
  "metallic-premium-chalk-board",
  "eco-premium-notice-board",
  "metallic-premium-notice-board",
  "eco-premium-both-side-board",
  "metallic-premium-both-side-board",
];

export function VideosManager({ initialVideos }: VideosManagerProps) {
  const [videos, setVideos] = useState<VideoWithId[]>(initialVideos);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<VideoWithId>>({});
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<VideoWithId | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAdd = async () => {
    if (!formData.src?.trim() || !formData.title?.trim()) {
      showToast("Please provide both a video URL/file and a title", "error");
      return;
    }
    try {
      const result = await addVideo(
        {
          src: formData.src.trim(),
          poster: formData.poster?.trim() || "",
          title: formData.title.trim(),
          caption: formData.caption?.trim() || "",
          productSlugs: formData.productSlugs || [],
        },
        videos.length
      );
      if (result.success && result.id) {
        setVideos([
          ...videos,
          {
            id: result.id,
            src: formData.src.trim(),
            poster: formData.poster?.trim() || "",
            title: formData.title.trim(),
            caption: formData.caption?.trim() || "",
            productSlugs: formData.productSlugs || [],
          },
        ]);
        setAdding(false);
        setFormData({});
        showToast("Video added successfully!");
      } else {
        showToast("Failed to add video. Please try again.", "error");
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error adding video", "error");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.title?.trim()) {
      showToast("Video title cannot be empty", "error");
      return;
    }
    try {
      await updateVideo(id, formData);
      setVideos(
        videos.map((v) =>
          v.id === id
            ? {
                ...v,
                src: formData.src?.trim() || v.src,
                poster: formData.poster !== undefined ? formData.poster.trim() : v.poster,
                title: formData.title?.trim() || v.title,
                caption: formData.caption !== undefined ? formData.caption.trim() : v.caption,
                productSlugs: formData.productSlugs !== undefined ? formData.productSlugs : v.productSlugs,
              }
            : v
        )
      );
      setEditingId(null);
      setFormData({});
      showToast("Video updated successfully!");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error updating video", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    try {
      await deleteVideo(id);
      setVideos(videos.filter((v) => v.id !== id));
      showToast("Video deleted successfully");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error deleting video", "error");
    }
  };

  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    const nv = [...videos];
    const from = nv.findIndex((v) => v.id === draggedId);
    const to = nv.findIndex((v) => v.id === targetId);
    if (from < 0 || to < 0) return;
    const [removed] = nv.splice(from, 1);
    nv.splice(to, 0, removed);
    setVideos(nv);
  };

  const handleDragEnd = async () => {
    if (draggedId) {
      await reorderVideos(videos.map((v) => v.id));
      setDraggedId(null);
      showToast("Video order saved");
    }
  };

  const startEdit = (video: VideoWithId) => {
    setEditingId(video.id);
    setAdding(false);
    setFormData(video);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAdding(false);
    setFormData({});
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-200",
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          )}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="size-4 text-red-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-graphite">Product Videos Catalog</h2>
          <p className="text-xs text-steel">
            {videos.length} video{videos.length !== 1 ? "s" : ""} in total. Drag items to reorder the showroom carousel.
          </p>
        </div>
        <button
          onClick={() => {
            setAdding(true);
            setEditingId(null);
            setFormData({});
          }}
          disabled={adding || editingId !== null}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-graphite px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-black disabled:opacity-50 cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Add New Video</span>
        </button>
      </div>

      {/* Add Video Form Drawer */}
      {adding && (
        <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <VideoIcon className="size-4" />
              </div>
              <div>
                <h3 className="font-semibold text-graphite">Add New Video</h3>
                <p className="text-xs text-steel">Upload or paste a video URL with details</p>
              </div>
            </div>
            <button
              onClick={cancelEdit}
              className="rounded-md p-1.5 text-steel hover:bg-fog hover:text-graphite transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
          <VideoForm
            formData={formData}
            setFormData={setFormData}
            onSave={handleAdd}
            onCancel={cancelEdit}
            isNew
          />
        </div>
      )}

      {/* Videos List */}
      <div className="space-y-3">
        {videos.map((video, index) => {
          const isEditing = editingId === video.id;

          if (isEditing) {
            return (
              <div
                key={video.id}
                className="rounded-xl border border-accent/40 bg-white p-6 shadow-md ring-1 ring-accent/20"
              >
                <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                      <Pencil className="size-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-graphite">Edit: {video.title}</h3>
                      <p className="text-xs text-steel">Update video source, metadata, or linked products</p>
                    </div>
                  </div>
                  <button
                    onClick={cancelEdit}
                    className="rounded-md p-1.5 text-steel hover:bg-fog hover:text-graphite transition-colors cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <VideoForm
                  formData={formData}
                  setFormData={setFormData}
                  onSave={() => handleUpdate(video.id)}
                  onCancel={cancelEdit}
                />
              </div>
            );
          }

          return (
            <div
              key={video.id}
              draggable
              onDragStart={() => handleDragStart(video.id)}
              onDragOver={(e) => handleDragOver(e, video.id)}
              onDragEnd={handleDragEnd}
              className={cn(
                "group flex flex-col gap-4 rounded-xl border border-line bg-white p-4 transition-all hover:border-slate-300 hover:shadow-xs sm:flex-row sm:items-center sm:gap-5",
                draggedId === video.id && "opacity-40 border-dashed border-accent"
              )}
            >
              {/* Drag Handle */}
              <div
                className="hidden sm:flex cursor-grab items-center justify-center text-line group-hover:text-steel transition-colors"
                title="Drag to reorder"
              >
                <GripVertical className="size-5" />
              </div>

              {/* Video Thumbnail with Interactive Play Button */}
              <button
                type="button"
                onClick={() => setPreviewVideo(video)}
                className="relative aspect-video w-full sm:w-44 shrink-0 overflow-hidden rounded-lg border border-line bg-graphite group/thumb cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-accent"
                title="Click to play video"
              >
                {video.poster ? (
                  <img
                    src={video.poster}
                    alt={video.title}
                    className="size-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-slate-900 text-slate-400">
                    <VideoIcon className="size-8 opacity-60" />
                  </div>
                )}
                {/* Play Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-all group-hover/thumb:bg-black/20">
                  <div className="flex size-10 items-center justify-center rounded-full bg-white/90 text-graphite shadow-md transition-transform group-hover/thumb:scale-110">
                    <Play className="size-5 ml-0.5 fill-graphite text-graphite" />
                  </div>
                </div>
                <span className="absolute bottom-1.5 left-1.5 rounded bg-black/75 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">
                  ▶ PLAY
                </span>
              </button>

              {/* Video Information */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-steel/80">#{index + 1}</span>
                  <h3 className="truncate font-semibold text-graphite text-sm sm:text-base">
                    {video.title}
                  </h3>
                </div>
                {video.caption && (
                  <p className="mt-1 line-clamp-2 text-xs text-steel">{video.caption}</p>
                )}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  {video.productSlugs && video.productSlugs.length > 0 ? (
                    video.productSlugs.map((slug) => (
                      <span
                        key={slug}
                        className="inline-flex items-center gap-1 rounded bg-fog px-2 py-0.5 font-mono text-[10px] text-graphite"
                      >
                        <Tag className="size-2.5 text-steel" />
                        {slug}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-steel/70 italic">
                      Shown on homepage / showroom only
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-line/50 pt-3 sm:border-0 sm:pt-0 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewVideo(video)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-graphite hover:bg-fog transition cursor-pointer"
                >
                  <Play className="size-3.5 fill-graphite" />
                  <span>Play</span>
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(video)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-steel hover:bg-fog hover:text-graphite transition cursor-pointer"
                >
                  <Pencil className="size-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(video.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition cursor-pointer"
                  title="Delete video"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {videos.length === 0 && !adding && (
        <div className="rounded-xl border border-dashed border-line bg-white p-12 text-center">
          <VideoIcon className="mx-auto size-10 text-steel/40" />
          <h3 className="mt-3 font-semibold text-graphite">No videos configured</h3>
          <p className="mt-1 text-xs text-steel">
            Add your first product demonstration or installation video.
          </p>
          <button
            onClick={() => {
              setAdding(true);
              setFormData({});
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-graphite px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-black cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Add Video</span>
          </button>
        </div>
      )}

      {/* ── MODAL VIDEO PLAYER ── */}
      {previewVideo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewVideo(null);
          }}
        >
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-slate-950 text-white shadow-2xl border border-white/10">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
              <div className="flex items-center gap-2.5 min-w-0 pr-4">
                <span className="flex size-2 rounded-full bg-emerald-400" />
                <h3 className="truncate font-semibold text-sm sm:text-base text-slate-100">
                  {previewVideo.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewVideo.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
                  title="Open source video URL in new tab"
                >
                  <ExternalLink className="size-4" />
                </a>
                <button
                  onClick={() => setPreviewVideo(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
                  title="Close preview (Esc)"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Video Viewport */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              {(() => {
                const embedInfo = getVideoEmbedInfo(previewVideo.src);
                if (embedInfo.isEmbed && embedInfo.embedUrl) {
                  return (
                    <iframe
                      src={embedInfo.embedUrl}
                      title={previewVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="size-full border-0"
                    />
                  );
                }

                return (
                  <video
                    key={previewVideo.src}
                    src={previewVideo.src}
                    poster={previewVideo.poster}
                    controls
                    autoPlay
                    playsInline
                    className="size-full object-contain"
                  >
                    Your browser does not support the video tag.
                  </video>
                );
              })()}
            </div>

            {/* Modal Footer / Details */}
            <div className="border-t border-white/10 bg-slate-900/90 px-5 py-4">
              {previewVideo.caption && (
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {previewVideo.caption}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-400">Linked Products:</span>
                  {previewVideo.productSlugs && previewVideo.productSlugs.length > 0 ? (
                    previewVideo.productSlugs.map((slug) => (
                      <span
                        key={slug}
                        className="rounded bg-white/10 px-2 py-0.5 font-mono text-[11px] text-slate-200"
                      >
                        {slug}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">None (Showroom only)</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = previewVideo;
                    setPreviewVideo(null);
                    startEdit(toEdit);
                  }}
                  className="rounded-md bg-white/10 px-3 py-1 font-medium text-white hover:bg-white/20 transition cursor-pointer"
                >
                  Edit Video Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   VIDEO FORM (USED FOR BOTH ADD & EDIT)
   ───────────────────────────────────────────────────────────── */

interface VideoFormProps {
  formData: Partial<VideoWithId>;
  setFormData: (data: Partial<VideoWithId>) => void;
  onSave: () => void;
  onCancel: () => void;
  isNew?: boolean;
}

function VideoForm({ formData, setFormData, onSave, onCancel, isNew = false }: VideoFormProps) {
  const [productSlugInput, setProductSlugInput] = useState("");
  const [uploadMethod, setUploadMethod] = useState<"file" | "direct" | "youtube">("direct");
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect upload method if editing
  useEffect(() => {
    if (formData.src) {
      const embed = getVideoEmbedInfo(formData.src);
      if (embed.isEmbed) {
        setUploadMethod("youtube");
      } else {
        setUploadMethod("direct");
      }
    }
  }, [formData.src]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      alert("Please select a video file (MP4, MOV, WEBM)");
      return;
    }
    if (file.size > 80 * 1024 * 1024) {
      alert("Video file size must be under 80MB");
      return;
    }

    setUploading(true);
    setUploadStatus("Reading file...");
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64String = event.target?.result as string;
        setUploadStatus("Uploading to Cloudinary CDN...");
        const result = await uploadVideoFileToCloudinary(base64String);
        if (result.success && result.cloudinaryUrl) {
          setFormData({
            ...formData,
            src: result.cloudinaryUrl,
            poster: result.posterUrl || formData.poster || "",
          });
          setUploadStatus("Uploaded successfully!");
        } else {
          alert(`Upload failed: ${result.error || "Unknown error"}`);
          setUploadStatus("");
        }
        setUploading(false);
      };
      reader.onerror = () => {
        alert("Failed to read video file");
        setUploading(false);
        setUploadStatus("");
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert(`Error uploading video: ${err instanceof Error ? err.message : "Error"}`);
      setUploading(false);
      setUploadStatus("");
    }
  };

  const addProductSlug = (slugToAdd?: string) => {
    const slug = (slugToAdd || productSlugInput).trim();
    if (!slug) return;
    const slugs = formData.productSlugs || [];
    if (!slugs.includes(slug)) {
      setFormData({ ...formData, productSlugs: [...slugs, slug] });
    }
    setProductSlugInput("");
  };

  const removeProductSlug = (slugToRemove: string) => {
    setFormData({
      ...formData,
      productSlugs: (formData.productSlugs || []).filter((s) => s !== slugToRemove),
    });
  };

  const embedInfo = getVideoEmbedInfo(formData.src);

  return (
    <div className="space-y-6">
      {/* ── Section 1: Video Source ── */}
      <div className="rounded-xl border border-line bg-fog/30 p-5">
        <label className="block text-xs font-mono uppercase tracking-wider text-steel mb-3">
          1. Video Source & Player
        </label>

        {/* Method selector tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: "direct", label: "Cloudinary / MP4 URL", icon: LinkIcon },
            { id: "youtube", label: "YouTube / Vimeo", icon: Film },
            { id: "file", label: "Upload Video File", icon: Upload },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setUploadMethod(id as typeof uploadMethod)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer",
                uploadMethod === id
                  ? "bg-graphite text-white shadow-xs"
                  : "bg-white border border-line text-steel hover:text-graphite"
              )}
            >
              <Icon className="size-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Direct / Cloudinary Link */}
        {uploadMethod === "direct" && (
          <div className="space-y-2">
            <input
              type="url"
              value={formData.src || ""}
              onChange={(e) => setFormData({ ...formData, src: e.target.value })}
              placeholder="https://res.cloudinary.com/... or https://example.com/video.mp4"
              className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-graphite placeholder:text-steel/50 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
            />
            <p className="text-[11px] text-steel">
              Direct HTTPS video link (Cloudinary MP4, AWS S3, or CDN URL).
            </p>
          </div>
        )}

        {/* YouTube / Vimeo Embed */}
        {uploadMethod === "youtube" && (
          <div className="space-y-2">
            <input
              type="url"
              value={formData.src || ""}
              onChange={(e) => setFormData({ ...formData, src: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/... or Vimeo"
              className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-graphite placeholder:text-steel/50 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
            />
            <p className="text-[11px] text-steel">
              Paste standard YouTube URL, Shorts URL, or Vimeo video link.
            </p>
          </div>
        )}

        {/* File Upload to Cloudinary */}
        {uploadMethod === "file" && (
          <div className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-white p-6 text-center hover:border-brand transition cursor-pointer"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <Upload className="size-8 text-steel/60 mb-2" />
              <p className="text-xs font-semibold text-graphite">Click to select a video file</p>
              <p className="text-[11px] text-steel mt-0.5">MP4, MOV, or WEBM (Max 80MB)</p>
            </div>
            {uploading && (
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700">
                <Loader2 className="size-4 animate-spin shrink-0" />
                <span>{uploadStatus}</span>
              </div>
            )}
            {uploadStatus.includes("successfully") && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{uploadStatus}</span>
              </div>
            )}
          </div>
        )}

        {/* ── LIVE INTERACTIVE VIDEO PREVIEW RIGHT IN THE FORM ── */}
        {formData.src && (
          <div className="mt-4 overflow-hidden rounded-xl border border-line bg-black">
            <div className="flex items-center justify-between bg-graphite px-3 py-1.5 text-white text-[11px]">
              <span className="flex items-center gap-1.5 font-mono">
                <Play className="size-3 fill-emerald-400 text-emerald-400" />
                Live Video Preview (Click to test playback)
              </span>
              <span className="text-slate-400 uppercase font-mono text-[10px]">
                {embedInfo.type}
              </span>
            </div>
            <div className="relative aspect-video w-full flex items-center justify-center">
              {embedInfo.isEmbed && embedInfo.embedUrl ? (
                <iframe
                  src={embedInfo.embedUrl}
                  title="Video preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="size-full border-0"
                />
              ) : (
                <video
                  key={formData.src}
                  src={formData.src}
                  poster={formData.poster}
                  controls
                  playsInline
                  className="size-full object-contain"
                >
                  Your browser does not support the video preview.
                </video>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Section 2: Details ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-steel mb-1.5">
            Video Title *
          </label>
          <input
            type="text"
            value={formData.title || ""}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Metallic Premium White Board — Feature Showcase"
            className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-graphite placeholder:text-steel/50 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-steel mb-1.5">
            Caption / Description
          </label>
          <textarea
            value={formData.caption || ""}
            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
            rows={2}
            placeholder="Short description of what the user is seeing in this video clip..."
            className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-graphite placeholder:text-steel/50 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-steel mb-1.5">
            Custom Poster / Thumbnail Image URL
          </label>
          <input
            type="url"
            value={formData.poster || ""}
            onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
            placeholder="https://... (Optional: If empty, Cloudinary auto-generates poster frame)"
            className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-graphite placeholder:text-steel/50 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
          />
        </div>
      </div>

      {/* ── Section 3: Linked Products ── */}
      <div className="rounded-xl border border-line bg-fog/30 p-5">
        <label className="block text-xs font-mono uppercase tracking-wider text-steel mb-1.5">
          Linked Products (Optional)
        </label>
        <p className="text-xs text-steel mb-3">
          Attach product slugs to show this video on specific product detail pages. Leave empty to show only on homepage showroom.
        </p>

        {/* Existing tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3 min-h-[30px]">
          {formData.productSlugs && formData.productSlugs.length > 0 ? (
            formData.productSlugs.map((slug) => (
              <span
                key={slug}
                className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-mono text-graphite"
              >
                <span>{slug}</span>
                <button
                  type="button"
                  onClick={() => removeProductSlug(slug)}
                  className="text-steel hover:text-red-500 transition cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-xs text-steel/70 italic">No products linked yet.</span>
          )}
        </div>

        {/* Input to add custom slug */}
        <div className="flex gap-2">
          <input
            type="text"
            value={productSlugInput}
            onChange={(e) => setProductSlugInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addProductSlug();
              }
            }}
            placeholder="Type product slug (e.g. eco-premium-white-board) and press Enter"
            className="flex-1 rounded-lg border border-line bg-white px-3 py-2 text-xs font-mono text-graphite placeholder:text-steel/50 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
          />
          <button
            type="button"
            onClick={() => addProductSlug()}
            className="rounded-lg bg-fog border border-line px-3 py-2 text-xs font-medium text-graphite hover:bg-line transition cursor-pointer"
          >
            Add
          </button>
        </div>

        {/* Quick suggestions */}
        <div className="mt-3">
          <span className="text-[11px] font-mono uppercase text-steel">Quick Suggestions:</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {COMMON_SLUGS.map((slug) => {
              const isSelected = formData.productSlugs?.includes(slug);
              if (isSelected) return null;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => addProductSlug(slug)}
                  className="rounded bg-white border border-line/80 px-2 py-0.5 text-[10px] font-mono text-steel hover:text-graphite hover:border-brand transition cursor-pointer"
                >
                  + {slug}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-line px-4 py-2 text-xs font-semibold text-steel hover:bg-fog hover:text-graphite transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-1.5 rounded-lg bg-graphite px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-black transition cursor-pointer"
        >
          <span>{isNew ? "Save & Publish Video" : "Save Changes"}</span>
        </button>
      </div>
    </div>
  );
}
