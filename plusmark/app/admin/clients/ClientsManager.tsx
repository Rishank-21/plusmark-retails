"use client";

import { useState } from "react";
import { addClient, updateClient, deleteClient, reorderClients } from "./actions";
import type { TrustedClient, ClientSector } from "@/data/clients";
import {
  Pencil,
  Trash2,
  Plus,
  GripVertical,
  Check,
  X,
  Building2,
  Image as ImageIcon,
  Globe,
  Upload,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  School,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientsManagerProps {
  initialClients: TrustedClient[];
}

const SECTOR_OPTIONS: { value: ClientSector; label: string; icon: typeof Building2 }[] = [
  { value: "school", label: "School / Education", icon: School },
  { value: "university", label: "University / College", icon: GraduationCap },
  { value: "business", label: "Corporate / Business", icon: Building2 },
  { value: "government", label: "Government / PSU", icon: Landmark },
];

export function ClientsManager({ initialClients }: ClientsManagerProps) {
  const [clients, setClients] = useState<TrustedClient[]>(initialClients);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<TrustedClient>>({});
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAdd = async () => {
    if (!formData.name?.trim() || !formData.sector) {
      showToast("Please provide both client name and institution sector", "error");
      return;
    }
    try {
      const result = await addClient(
        { name: formData.name.trim(), sector: formData.sector, logo: formData.logo },
        clients.length
      );
      if (result.success && result.id) {
        setClients([
          ...clients,
          {
            id: result.id,
            name: formData.name.trim(),
            sector: formData.sector,
            logo: formData.logo,
          },
        ]);
        setAdding(false);
        setFormData({});
        showToast("Client logo added successfully!");
      } else {
        showToast("Failed to add client. Please try again.", "error");
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error adding client", "error");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.name?.trim()) {
      showToast("Client name cannot be empty", "error");
      return;
    }
    try {
      await updateClient(id, formData);
      setClients(
        clients.map((c) =>
          c.id === id
            ? {
                ...c,
                name: formData.name?.trim() || c.name,
                sector: formData.sector || c.sector,
                logo: formData.logo,
              }
            : c
        )
      );
      setEditingId(null);
      setFormData({});
      showToast("Client logo updated successfully!");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error updating client", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this client?")) return;
    try {
      await deleteClient(id);
      setClients(clients.filter((c) => c.id !== id));
      showToast("Client removed successfully");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error deleting client", "error");
    }
  };

  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    const newClients = [...clients];
    const from = newClients.findIndex((c) => c.id === draggedId);
    const to = newClients.findIndex((c) => c.id === targetId);
    if (from < 0 || to < 0) return;
    const [removed] = newClients.splice(from, 1);
    newClients.splice(to, 0, removed);
    setClients(newClients);
  };

  const handleDragEnd = async () => {
    if (draggedId) {
      await reorderClients(clients.map((c) => c.id));
      setDraggedId(null);
      showToast("Client order saved");
    }
  };

  const startEdit = (client: TrustedClient) => {
    setEditingId(client.id);
    setAdding(false);
    setFormData(client);
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

      {/* Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-graphite">Institutional Client Logos</h2>
          <p className="text-xs text-steel">
            {clients.length} logo{clients.length !== 1 ? "s" : ""} active. Drag rows to adjust display sequence in the homepage marquee.
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
          <span>Add Client</span>
        </button>
      </div>

      {/* Add Client Form */}
      {adding && (
        <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Building2 className="size-4" />
              </div>
              <div>
                <h3 className="font-semibold text-graphite">Add New Client</h3>
                <p className="text-xs text-steel">Specify client name, sector, and logo</p>
              </div>
            </div>
            <button
              onClick={cancelEdit}
              className="rounded-md p-1.5 text-steel hover:bg-fog hover:text-graphite transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
          <ClientForm formData={formData} setFormData={setFormData} onSave={handleAdd} onCancel={cancelEdit} isNew />
        </div>
      )}

      {/* Clients list */}
      <div className="space-y-2.5">
        {clients.map((client) => {
          const isEditing = editingId === client.id;
          const sectorInfo = SECTOR_OPTIONS.find((s) => s.value === client.sector);
          const SectorIcon = sectorInfo?.icon || Building2;

          if (isEditing) {
            return (
              <div
                key={client.id}
                className="rounded-xl border border-accent/40 bg-white p-6 shadow-md ring-1 ring-accent/20"
              >
                <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                      <Pencil className="size-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-graphite">Edit: {client.name}</h3>
                      <p className="text-xs text-steel">Update organization name, sector, or logo image</p>
                    </div>
                  </div>
                  <button
                    onClick={cancelEdit}
                    className="rounded-md p-1.5 text-steel hover:bg-fog hover:text-graphite transition-colors cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <ClientForm
                  formData={formData}
                  setFormData={setFormData}
                  onSave={() => handleUpdate(client.id)}
                  onCancel={cancelEdit}
                />
              </div>
            );
          }

          return (
            <div
              key={client.id}
              draggable
              onDragStart={() => handleDragStart(client.id)}
              onDragOver={(e) => handleDragOver(e, client.id)}
              onDragEnd={handleDragEnd}
              className={cn(
                "group flex items-center gap-4 rounded-xl border border-line bg-white p-3.5 transition-all hover:border-slate-300 hover:shadow-xs",
                draggedId === client.id && "opacity-40 border-dashed border-accent"
              )}
            >
              {/* Drag Handle */}
              <div
                className="cursor-grab text-line group-hover:text-steel transition-colors"
                title="Drag to reorder"
              >
                <GripVertical className="size-5" />
              </div>

              {/* Logo preview */}
              <div className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-line bg-mist/60 p-2">
                {client.logo ? (
                  <img
                    src={client.logo.src}
                    alt={client.name}
                    className="max-h-10 max-w-10 object-contain"
                  />
                ) : (
                  <ImageIcon className="size-5 text-steel/40" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="truncate font-semibold text-sm text-graphite">{client.name}</h4>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded bg-fog px-2 py-0.5 text-[11px] font-medium text-steel">
                    <SectorIcon className="size-3" />
                    <span className="capitalize">{sectorInfo?.label || client.sector}</span>
                  </span>
                  {client.logo && (
                    <span className="font-mono text-[10px] text-steel/70">
                      {client.logo.width}×{client.logo.height}px
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => startEdit(client)}
                  className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-steel hover:bg-fog hover:text-graphite transition cursor-pointer"
                >
                  <Pencil className="size-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(client.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/50 p-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition cursor-pointer"
                  title="Remove client"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {clients.length === 0 && !adding && (
        <div className="rounded-xl border border-dashed border-line bg-white p-12 text-center">
          <Building2 className="mx-auto size-10 text-steel/40" />
          <h3 className="mt-3 font-semibold text-graphite">No clients registered</h3>
          <p className="mt-1 text-xs text-steel">
            Add client institutions and organizations to showcase in the logo marquee.
          </p>
          <button
            onClick={() => {
              setAdding(true);
              setFormData({});
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-graphite px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-black cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Add Client</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CLIENT FORM (ADD & EDIT)
   ───────────────────────────────────────────────────────────── */

interface ClientFormProps {
  formData: Partial<TrustedClient>;
  setFormData: (data: Partial<TrustedClient>) => void;
  onSave: () => void;
  onCancel: () => void;
  isNew?: boolean;
}

function ClientForm({ formData, setFormData, onSave, onCancel, isNew = false }: ClientFormProps) {
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, WEBP, SVG)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setFormData({
          ...formData,
          logo: { src: base64String, width: img.width, height: img.height },
        });
        setUploading(false);
      };
      img.src = base64String;
    };
    reader.onerror = () => {
      alert("Failed to read image file");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      {/* Name and Sector */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-steel mb-1.5">
            Client / Organization Name *
          </label>
          <input
            type="text"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Delhi Public School, IIT Delhi"
            className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-graphite placeholder:text-steel/50 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-steel mb-1.5">
            Institution Sector *
          </label>
          <select
            value={formData.sector || ""}
            onChange={(e) => setFormData({ ...formData, sector: e.target.value as ClientSector })}
            className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-graphite focus:border-brand focus:ring-1 focus:ring-brand outline-none transition cursor-pointer"
          >
            <option value="">Select sector...</option>
            {SECTOR_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logo Upload Section */}
      <div className="rounded-xl border border-line bg-fog/30 p-5">
        <label className="block text-xs font-mono uppercase tracking-wider text-steel mb-3">
          Client Logo Image (Optional)
        </label>

        {/* Tab toggle */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setUploadMethod("file")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer",
              uploadMethod === "file"
                ? "bg-graphite text-white shadow-xs"
                : "bg-white border border-line text-steel hover:text-graphite"
            )}
          >
            <Upload className="size-3.5" />
            <span>Upload Image File</span>
          </button>
          <button
            type="button"
            onClick={() => setUploadMethod("url")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer",
              uploadMethod === "url"
                ? "bg-graphite text-white shadow-xs"
                : "bg-white border border-line text-steel hover:text-graphite"
            )}
          >
            <Globe className="size-3.5" />
            <span>Image URL</span>
          </button>
        </div>

        {uploadMethod === "file" ? (
          <div>
            <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-white p-6 text-center hover:border-brand transition cursor-pointer">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <Upload className="size-7 text-steel/60 mb-2" />
              <p className="text-xs font-semibold text-graphite">Click to upload logo</p>
              <p className="text-[11px] text-steel mt-0.5">PNG (transparent), SVG, WEBM (Max 2MB)</p>
            </label>
          </div>
        ) : (
          <div>
            <input
              type="text"
              value={formData.logo?.src?.startsWith("data:") ? "" : formData.logo?.src || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  logo: e.target.value ? { src: e.target.value, width: 240, height: 240 } : undefined,
                })
              }
              placeholder="https://... or /images/clients/logo.png"
              className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-graphite placeholder:text-steel/50 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
            />
          </div>
        )}

        {/* Logo preview thumbnail */}
        {formData.logo?.src && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-line bg-white p-3">
            <div className="flex items-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-md border border-line bg-mist/60 p-1">
                <img
                  src={formData.logo.src}
                  alt="Logo preview"
                  className="max-h-12 max-w-12 object-contain"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-graphite">Logo Ready</p>
                <p className="text-[11px] text-steel">
                  {formData.logo.width} × {formData.logo.height} px
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, logo: undefined })}
              className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition cursor-pointer"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
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
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-graphite px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-black transition cursor-pointer disabled:opacity-50"
        >
          <span>{isNew ? "Save & Add Client" : "Save Changes"}</span>
        </button>
      </div>
    </div>
  );
}
