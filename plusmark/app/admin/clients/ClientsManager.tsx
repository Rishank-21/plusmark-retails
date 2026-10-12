"use client";

import { useState } from "react";
import { addClient, updateClient, deleteClient, reorderClients } from "./actions";
import type { TrustedClient, ClientSector } from "@/data/clients";
import { ArrowDown, ArrowUp, Building2, GraduationCap, GripVertical, Image as ImageIcon, Landmark, Pencil, Plus, School, Search, Trash2 } from "lucide-react";
import { ChipPicker, Drawer, DropUpload, EmptyState, Field, FormFooter, Stat, btnDanger, btnGhost, btnPrimary, imageSize, inputCls, useOpenOnNew, useToast } from "../form-kit";
import { cn } from "@/lib/utils";

const SECTORS: { value: ClientSector; label: string; icon: typeof Building2 }[] = [
  { value: "school", label: "School", icon: School },
  { value: "university", label: "College / University", icon: GraduationCap },
  { value: "business", label: "Company", icon: Building2 },
  { value: "government", label: "Government", icon: Landmark },
];

type Draft = { name: string; sector?: ClientSector; logo?: TrustedClient["logo"] };

export function ClientsManager({ initialClients }: { initialClients: TrustedClient[] }) {
  const [clients, setClients] = useState(initialClients);
  const [panel, setPanel] = useState<{ mode: "add" } | { mode: "edit"; id: string } | null>(null);
  const [draft, setDraft] = useState<Draft>({ name: "" });
  const [errors, setErrors] = useState<{ name?: string; sector?: string }>({});
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [toast, showToast] = useToast();

  const openAdd = () => {
    setDraft({ name: "", sector: "school" });
    setErrors({});
    setPanel({ mode: "add" });
  };
  const openEdit = (c: TrustedClient) => {
    setDraft({ name: c.name, sector: c.sector, logo: c.logo });
    setErrors({});
    setPanel({ mode: "edit", id: c.id });
  };
  const close = () => !saving && setPanel(null);
  useOpenOnNew(openAdd);

  const save = async () => {
    const name = draft.name.trim();
    const errs: typeof errors = {};
    if (!name) errs.name = "Enter the organisation's name";
    if (!draft.sector) errs.sector = "Choose a type";
    setErrors(errs);
    if (Object.keys(errs).length || !panel) return;

    setSaving(true);
    try {
      const data = { name, sector: draft.sector!, logo: draft.logo };
      if (panel.mode === "add") {
        const res = await addClient(data, clients.length);
        if (!res.id) throw new Error("Could not add the client");
        setClients((cs) => [...cs, { id: res.id!, ...data }]);
        showToast(`${name} added`);
      } else {
        await updateClient(panel.id, data);
        setClients((cs) => cs.map((c) => (c.id === panel.id ? { ...c, ...data } : c)));
        showToast("Changes saved");
      }
      setPanel(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: TrustedClient) => {
    if (!confirm(`Remove "${c.name}" from the home page logos?`)) return;
    try {
      await deleteClient(c.id);
      setClients((cs) => cs.filter((x) => x.id !== c.id));
      showToast("Client removed");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not remove client", "error");
    }
  };

  const persistOrder = async (list: TrustedClient[]) => {
    try {
      await reorderClients(list.map((c) => c.id));
      showToast("Order saved");
    } catch {
      showToast("Could not save the new order", "error");
    }
  };

  const move = (index: number, dir: -1 | 1) => {
    const to = index + dir;
    if (to < 0 || to >= clients.length) return;
    const next = [...clients];
    [next[index], next[to]] = [next[to], next[index]];
    setClients(next);
    persistOrder(next);
  };

  const onDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    setClients((cs) => {
      const next = [...cs];
      const from = next.findIndex((c) => c.id === draggedId);
      const to = next.findIndex((c) => c.id === targetId);
      if (from < 0 || to < 0) return cs;
      next.splice(to, 0, next.splice(from, 1)[0]);
      return next;
    });
  };

  const q = query.trim().toLowerCase();
  const visible = q ? clients.filter((c) => c.name.toLowerCase().includes(q)) : clients;
  const withLogo = clients.filter((c) => c.logo?.src).length;

  return (
    <div className="space-y-5">
      {toast}

      {/* Summary + actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Clients" value={clients.length} />
        <Stat label="With logo" value={withLogo} />
        <Stat label="Name only" value={clients.length - withLogo} hint="Shown with a sector icon" />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-steel/60" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients…"
            aria-label="Search clients"
            className={cn(inputCls(), "pl-9")}
          />
        </div>
        <button type="button" onClick={openAdd} className={btnPrimary}>
          <Plus aria-hidden className="size-4" /> Add client
        </button>
      </div>

      {!q && clients.length > 1 && (
        <p className="px-1 text-xs text-steel">Drag a card (or use the arrows) to change the order of logos on the home page.</p>
      )}

      {visible.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((c) => {
            const index = clients.indexOf(c);
            const sector = SECTORS.find((s) => s.value === c.sector);
            const SectorIcon = sector?.icon ?? Building2;
            return (
              <li
                key={c.id}
                draggable={!q}
                onDragStart={() => setDraggedId(c.id)}
                onDragOver={(e) => onDragOver(e, c.id)}
                onDragEnd={() => {
                  if (draggedId) persistOrder(clients);
                  setDraggedId(null);
                }}
                className={cn(
                  "group flex flex-col rounded-2xl border border-line bg-white transition hover:border-steel/30 hover:shadow-sm",
                  draggedId === c.id && "border-dashed border-brand opacity-50",
                )}
              >
                <div className="relative flex h-28 items-center justify-center rounded-t-2xl bg-mist/60 p-4">
                  {c.logo?.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.logo.src} alt="" className="max-h-16 max-w-[70%] object-contain" />
                  ) : (
                    <span className="flex flex-col items-center gap-1 text-xs text-steel">
                      <SectorIcon aria-hidden className="size-6 text-steel/60" />
                      No logo
                    </span>
                  )}
                  {!q && (
                    <span aria-hidden className="absolute left-2 top-2 cursor-grab text-steel/40 group-hover:text-steel">
                      <GripVertical className="size-4" />
                    </span>
                  )}
                  <span className="absolute right-2 top-2 rounded-md bg-white px-1.5 py-0.5 font-mono text-[0.62rem] text-steel ring-1 ring-fog">
                    #{index + 1}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-graphite">{c.name}</h3>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-steel">
                      <SectorIcon aria-hidden className="size-3.5" /> {sector?.label ?? c.sector}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center gap-2">
                    <button type="button" onClick={() => openEdit(c)} className={btnGhost}>
                      <Pencil aria-hidden className="size-3.5" /> Edit
                    </button>
                    {!q && (
                      <>
                        <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${c.name} earlier`} className={cn(btnGhost, "px-2 disabled:opacity-40")}>
                          <ArrowUp aria-hidden className="size-3.5" />
                        </button>
                        <button type="button" onClick={() => move(index, 1)} disabled={index === clients.length - 1} aria-label={`Move ${c.name} later`} className={cn(btnGhost, "px-2 disabled:opacity-40")}>
                          <ArrowDown aria-hidden className="size-3.5" />
                        </button>
                      </>
                    )}
                    <button type="button" onClick={() => remove(c)} aria-label={`Remove ${c.name}`} className={cn(btnDanger, "ml-auto px-2")}>
                      <Trash2 aria-hidden className="size-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon={Building2}
          title={q ? "No clients match your search" : "No clients yet"}
          text={q ? "Try a different name." : "Add schools, colleges and organisations you supply to show their logos on the home page."}
          action={
            !q && (
              <button type="button" onClick={openAdd} className={btnPrimary}>
                <Plus aria-hidden className="size-4" /> Add client
              </button>
            )
          }
        />
      )}

      <Drawer
        open={!!panel}
        onClose={close}
        title={panel?.mode === "edit" ? "Edit client" : "Add a client"}
        subtitle="Shown in the “Trusted by” logo strip on the home page."
        footer={<FormFooter onCancel={close} onSave={save} saving={saving} saveLabel={panel?.mode === "edit" ? "Save changes" : "Add client"} />}
      >
        <Field label="Organisation name" required htmlFor="client-name" error={errors.name}>
          <input
            id="client-name"
            value={draft.name}
            onChange={(e) => {
              setDraft({ ...draft, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="e.g. Delhi Public School"
            className={inputCls(!!errors.name)}
          />
        </Field>

        <Field label="Type" required error={errors.sector}>
          <ChipPicker label="Type" value={draft.sector} options={SECTORS} onChange={(sector) => setDraft({ ...draft, sector })} />
        </Field>

        <Field label="Logo" hint="A PNG with a transparent background or an SVG looks best. Without a logo, the name is shown with an icon.">
          {draft.logo?.src ? (
            <div className="flex items-center gap-4 rounded-xl border border-line p-3">
              <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-lg bg-mist p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={draft.logo.src} alt="Logo preview" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-graphite">Logo added</p>
                <p className="text-xs text-steel">
                  {draft.logo.width} × {draft.logo.height} px
                </p>
              </div>
              <button type="button" onClick={() => setDraft({ ...draft, logo: undefined })} className={btnDanger}>
                <ImageIcon aria-hidden className="size-3.5" /> Replace
              </button>
            </div>
          ) : (
            <DropUpload
              kind="image"
              maxMb={2}
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              title="Drop the logo here, or click to choose"
              hint="PNG, SVG, JPG or WEBP · up to 2 MB"
              compact
              onUploaded={(f) => setDraft((d) => ({ ...d, logo: { src: f.url, width: f.width ?? 240, height: f.height ?? 240 } }))}
              onLink={async (url) => {
                const size = await imageSize(url);
                setDraft((d) => ({ ...d, logo: { src: url, ...size } }));
              }}
              linkPlaceholder="…or paste a logo link (https://…)"
            />
          )}
        </Field>
      </Drawer>
    </div>
  );
}
