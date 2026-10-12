"use client";

/**
 * Small shared building blocks for the admin managers (products, videos, clients):
 * a side panel for add/edit forms, labelled fields, chip pickers, tag inputs, a drag-and-drop
 * uploader and toasts. Kept deliberately plain so every form reads top-to-bottom.
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, Link2, Loader2, Upload, X } from "lucide-react";
import { getUploadSignature } from "./upload-actions";
import { cn } from "@/lib/utils";

/* ───────────────────────── Styles ───────────────────────── */

export const inputCls = (error?: boolean) =>
  cn(
    "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-graphite outline-none transition placeholder:text-steel/50",
    "focus:border-brand focus:ring-2 focus:ring-brand/15",
    error ? "border-red-400 focus:border-red-500 focus:ring-red-500/15" : "border-line",
  );

export const btnPrimary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-graphite px-5 text-sm font-semibold text-white shadow-xs transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer";
export const btnSecondary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-medium text-graphite transition hover:bg-mist disabled:opacity-60 cursor-pointer";
export const btnDanger =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-xs font-medium text-red-600 transition hover:bg-red-50 cursor-pointer";
export const btnGhost =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-3 text-xs font-medium text-graphite transition hover:bg-mist cursor-pointer";

/* ───────────────────────── Toasts ───────────────────────── */

type Toast = { message: string; type: "success" | "error" };

export function useToast() {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const show = useCallback((message: string, type: Toast["type"] = "success") => {
    window.clearTimeout(timer.current);
    setToast({ message, type });
    timer.current = window.setTimeout(() => setToast(null), 3500);
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const node = toast ? (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className={cn(
        "fixed bottom-6 right-6 z-[70] flex max-w-sm animate-rise items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg",
        toast.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900",
      )}
    >
      {toast.type === "success" ? (
        <CheckCircle2 aria-hidden className="size-4 shrink-0 text-emerald-600" />
      ) : (
        <AlertCircle aria-hidden className="size-4 shrink-0 text-red-600" />
      )}
      <span>{toast.message}</span>
    </div>
  ) : null;

  return [node, show] as const;
}

/* ───────────────────────── Side panel ───────────────────────── */

export function Drawer({
  open,
  title,
  subtitle,
  onClose,
  footer,
  children,
  wide,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    // Focus the first field so typing can start straight away.
    const first =
      panel.current?.querySelector<HTMLElement>("input:not([type=hidden]):not([type=file]):not(.sr-only), select, textarea") ??
      panel.current?.querySelector<HTMLElement>("button");
    first?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      prevFocus?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button type="button" aria-label="Close panel" tabIndex={-1} onClick={onClose} className="absolute inset-0 animate-fade bg-ink/40 backdrop-blur-[2px]" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn("relative flex h-full w-full animate-drawer flex-col bg-white shadow-2xl", wide ? "max-w-3xl" : "max-w-xl")}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div className="min-w-0">
            <h2 id={titleId} className="truncate font-display text-lg font-semibold text-graphite">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-xs text-steel">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-steel transition hover:bg-mist hover:text-graphite cursor-pointer">
            <X aria-hidden className="size-4" />
          </button>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 border-t border-line bg-mist/60 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

/** Save / Cancel pair for a drawer footer. */
export function FormFooter({ onCancel, onSave, saving, saveLabel, disabled }: { onCancel: () => void; onSave: () => void; saving: boolean; saveLabel: string; disabled?: boolean }) {
  return (
    <>
      <button type="button" onClick={onCancel} className={btnSecondary}>
        Cancel
      </button>
      <button type="button" onClick={onSave} disabled={saving || disabled} className={btnPrimary}>
        {saving && <Loader2 aria-hidden className="size-4 animate-spin" />}
        {saving ? "Saving…" : saveLabel}
      </button>
    </>
  );
}

/* ───────────────────────── Fields ───────────────────────── */

export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: React.ReactNode;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-graphite">
        {label}
        {required ? <span className="text-red-500"> *</span> : <span className="ml-1.5 text-xs font-normal text-steel">(optional)</span>}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle aria-hidden className="size-3.5" /> {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-steel">{hint}</p>
      )}
    </div>
  );
}

/** Single choice shown as tappable chips instead of a dropdown. */
export function ChipPicker<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T | undefined;
  options: { value: T; label: string; icon?: React.ComponentType<{ className?: string }> }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = o.value === value;
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition cursor-pointer",
              on ? "border-graphite bg-graphite text-white shadow-xs" : "border-line bg-white text-graphite hover:border-steel/50",
            )}
          >
            {Icon && <Icon className="size-4" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * List input: type and press Enter (or a comma) to add. Pasting several lines adds them all.
 * Optional one-click suggestions sit underneath.
 */
export function TagInput({
  id,
  values,
  onChange,
  placeholder,
  suggestions,
  allowComma = true,
}: {
  id?: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  /** Turn off for values that may contain commas (e.g. feature sentences). */
  allowComma?: boolean;
}) {
  const [input, setInput] = useState("");
  const add = (raw: string[]) => {
    const next = [...values];
    for (const r of raw) {
      const v = r.trim();
      if (v && !next.includes(v)) next.push(v);
    }
    onChange(next);
  };
  const commit = () => {
    if (!input.trim()) return;
    add(allowComma ? input.split(",") : [input]);
    setInput("");
  };
  const remaining = suggestions?.filter((s) => !values.includes(s)) ?? [];

  return (
    <div>
      <div className="rounded-lg border border-line bg-white p-2 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
        {values.length > 0 && (
          <ul className="mb-2 flex flex-wrap gap-1.5">
            {values.map((v, i) => (
              <li key={v} className="inline-flex max-w-full items-center gap-1 rounded-md bg-mist py-1 pl-2.5 pr-1 text-xs text-graphite ring-1 ring-fog">
                <span className="truncate">{v}</span>
                <button
                  type="button"
                  aria-label={`Remove ${v}`}
                  onClick={() => onChange(values.filter((_, j) => j !== i))}
                  className="rounded p-0.5 text-steel hover:bg-white hover:text-red-600 cursor-pointer"
                >
                  <X aria-hidden className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <input
          id={id}
          value={input}
          onChange={(e) => {
            const v = e.target.value;
            if (allowComma && v.endsWith(",")) {
              add([v.slice(0, -1)]);
              setInput("");
            } else setInput(v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            } else if (e.key === "Backspace" && !input && values.length) {
              onChange(values.slice(0, -1));
            }
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            if (text.includes("\n")) {
              e.preventDefault();
              add(text.split(/\r?\n/));
            }
          }}
          onBlur={commit}
          placeholder={values.length ? "Add another…" : placeholder}
          className="w-full bg-transparent px-1.5 py-1 text-sm text-graphite outline-none placeholder:text-steel/50"
        />
      </div>
      {remaining.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-steel">Quick add:</span>
          {remaining.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add([s])}
              className="rounded-md border border-dashed border-line px-2 py-0.5 text-xs text-steel transition hover:border-brand hover:text-brand cursor-pointer"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Collapsible group for optional fields, so the required ones stay in focus. */
export function MoreSection({ title, summary, defaultOpen, children }: { title: string; summary?: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="rounded-xl border border-line">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer"
      >
        <span>
          <span className="block text-sm font-semibold text-graphite">{title}</span>
          {summary && <span className="block text-xs text-steel">{summary}</span>}
        </span>
        <ChevronDown aria-hidden className={cn("size-4 shrink-0 text-steel transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="space-y-5 border-t border-line px-4 py-5">{children}</div>}
    </div>
  );
}

/* ───────────────────────── Uploads ───────────────────────── */

export type UploadedFile = { url: string; width?: number; height?: number; posterUrl?: string };

/** Upload one file straight to Cloudinary with progress. Falls back to an error message. */
export async function uploadToCloudinary(file: File, kind: "image" | "video", onProgress?: (pct: number) => void): Promise<UploadedFile> {
  const sig = await getUploadSignature(kind);
  if (!sig.ok) throw new Error(sig.error);
  const body = new FormData();
  body.append("file", file);
  body.append("api_key", sig.apiKey);
  body.append("timestamp", String(sig.timestamp));
  body.append("signature", sig.signature);
  body.append("folder", sig.folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloudName}/${kind}/upload`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && res.secure_url) {
          resolve({
            url: res.secure_url,
            width: res.width,
            height: res.height,
            // Same poster-frame transform the static videos use (frame at 1 s, as JPG).
            posterUrl:
              kind === "video"
                ? String(res.secure_url).replace("/video/upload/", "/video/upload/so_1,f_jpg,q_auto/").replace(/\.\w+$/, ".jpg")
                : undefined,
          });
        } else reject(new Error(res?.error?.message || `Upload failed (${xhr.status})`));
      } catch {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(body);
  });
}

/**
 * Drag-and-drop / click-to-choose uploader with an "or paste a link" box underneath.
 * Uploads go to Cloudinary; `onUploaded` is called once per finished file.
 */
export function DropUpload({
  kind,
  multiple,
  maxMb,
  accept,
  title,
  hint,
  onUploaded,
  onLink,
  linkPlaceholder,
  compact,
  validateLink,
}: {
  kind: "image" | "video";
  multiple?: boolean;
  maxMb: number;
  accept: string;
  title: string;
  hint: string;
  onUploaded: (file: UploadedFile) => void;
  /** When set, shows a paste-a-link input that calls this with the URL. */
  onLink?: (url: string) => void;
  linkPlaceholder?: string;
  compact?: boolean;
  /** Return an error message to reject a pasted link. */
  validateLink?: (url: string) => string | null;
}) {
  const inputId = useId();
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [link, setLink] = useState("");

  const handleFiles = async (list: FileList | null) => {
    const files = Array.from(list ?? []).slice(0, multiple ? 20 : 1);
    if (!files.length) return;
    setError("");
    for (const file of files) {
      if (!file.type.startsWith(`${kind}/`)) {
        setError(`"${file.name}" is not ${kind === "image" ? "an image" : "a video"} file.`);
        continue;
      }
      if (file.size > maxMb * 1024 * 1024) {
        setError(`"${file.name}" is larger than ${maxMb} MB.`);
        continue;
      }
      try {
        setProgress(0);
        onUploaded(await uploadToCloudinary(file, kind, setProgress));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
    }
    setProgress(null);
  };

  const submitLink = () => {
    const url = link.trim();
    if (!url) return;
    if (!/^(https?:\/\/|\/)/.test(url)) {
      setError("Links should start with https:// (or / for a file on this site).");
      return;
    }
    const problem = validateLink?.(url);
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    onLink?.(url);
    setLink("");
  };

  const busy = progress !== null;

  return (
    <div className="space-y-3">
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (!busy) handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed text-center transition",
          compact ? "px-4 py-5" : "px-6 py-8",
          drag ? "border-brand bg-accent-soft/50" : "border-line bg-mist/50 hover:border-steel/50 hover:bg-mist",
          busy && "pointer-events-none",
        )}
      >
        <input
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={busy}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
          className="sr-only"
        />
        {busy ? (
          <>
            <Loader2 aria-hidden className="size-6 animate-spin text-brand" />
            <p className="mt-2 text-sm font-medium text-graphite">Uploading… {progress}%</p>
            <span className="mt-3 block h-1.5 w-48 overflow-hidden rounded-full bg-fog">
              <span className="block h-full rounded-full bg-brand transition-[width]" style={{ width: `${progress}%` }} />
            </span>
          </>
        ) : (
          <>
            <span className="flex size-10 items-center justify-center rounded-full bg-white shadow-xs ring-1 ring-line">
              <Upload aria-hidden className="size-4 text-graphite" />
            </span>
            <p className="mt-3 text-sm font-semibold text-graphite">{title}</p>
            <p className="mt-0.5 text-xs text-steel">{hint}</p>
          </>
        )}
      </label>

      {onLink && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Link2 aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-steel/60" />
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitLink();
                }
              }}
              placeholder={linkPlaceholder ?? "…or paste a link"}
              aria-label={linkPlaceholder ?? "Paste a link"}
              className={cn(inputCls(), "pl-9")}
            />
          </div>
          <button type="button" onClick={submitLink} disabled={!link.trim()} className={btnSecondary}>
            Use link
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle aria-hidden className="size-3.5 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

/** Reads an image's natural size so logos keep their proportions. */
export function imageSize(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth || 240, height: img.naturalHeight || 240 });
    img.onerror = () => resolve({ width: 240, height: 240 });
    img.src = src;
  });
}

/** Empty-state card used by every manager. */
export function EmptyState({ icon: Icon, title, text, action }: { icon: React.ComponentType<{ className?: string }>; title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-mist">
        <Icon className="size-5 text-steel" />
      </span>
      <h3 className="mt-4 font-semibold text-graphite">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-steel">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Small count tile shown above each manager's list. */
export function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white px-4 py-3.5">
      <p className="text-xs font-medium text-steel">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-graphite">{value}</p>
      {hint && <p className="text-[11px] text-steel">{hint}</p>}
    </div>
  );
}

/** Opens the "add" form once when the page is visited with ?new=1 (dashboard quick actions). */
export function useOpenOnNew(open: () => void) {
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const url = new URL(window.location.href);
    if (url.searchParams.get("new") !== "1") return;
    url.searchParams.delete("new");
    window.history.replaceState(null, "", url.pathname + url.search);
    open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
