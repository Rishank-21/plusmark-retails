"use client";

import { useMemo, useState } from "react";
import { addProduct, updateProduct, deleteProduct, type ProductData } from "./actions";
import { ArrowLeft, ArrowRight, Image as ImageIcon, Package, Pencil, Plus, Search, Star, Trash2, X } from "lucide-react";
import type { CategorySlug, Series, Spec } from "@/data/types";
import { Drawer, DropUpload, EmptyState, Field, FormFooter, MoreSection, Stat, TagInput, btnDanger, btnGhost, btnPrimary, btnSecondary, inputCls, useOpenOnNew, useToast } from "../form-kit";
import { cn } from "@/lib/utils";

const CATEGORIES: { value: CategorySlug; label: string }[] = [
  { value: "white-boards-non-magnetic", label: "White Boards — Non-Magnetic" },
  { value: "white-boards-magnetic", label: "White Boards — Magnetic" },
  { value: "white-boards-ceramic", label: "White Boards — Ceramic" },
  { value: "chalk-boards-non-magnetic", label: "Chalk Boards — Non-Magnetic" },
  { value: "chalk-boards-magnetic", label: "Chalk Boards — Magnetic" },
  { value: "chalk-boards-ceramic", label: "Chalk Boards — Ceramic" },
  { value: "double-sided-boards", label: "Double-Sided Boards" },
  { value: "notice-boards", label: "Notice Boards" },
  { value: "specialty-boards", label: "Specialty Boards" },
  { value: "acrylic-door-cover-notice-boards", label: "Acrylic Door / Notice Boards" },
  { value: "board-study-essentials", label: "Board Study Essentials" },
  { value: "display-boards", label: "Display Boards" },
  { value: "board-stands", label: "Board Stands" },
  { value: "clipboards", label: "Clipboards" },
  { value: "school-benches", label: "School Benches" },
  { value: "schedule-boards", label: "Schedule Boards" },
];

const MAIN_SERIES: Series[] = ["Metallic Premium", "Eco Premium", "Deluxe Standard", "Eco Regular"];
const OTHER_SERIES: Series[] = ["Deluxe", "ECO", "Clipboard", "School Bench", "Stand & Storage", "Essentials", "Display", "Specialty", "Custom"];

const STANDARD_SIZES = ["1 × 1 ft", "1.5 × 2 ft", "2 × 2 ft", "2 × 3 ft", "2 × 4 ft", "3 × 4 ft", "4 × 4 ft", "5 × 4 ft", "6 × 4 ft", "8 × 4 ft"];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/×/g, "x")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

type Draft = {
  name: string;
  slug: string;
  slugTouched: boolean;
  categorySlug?: CategorySlug;
  series?: Series;
  shortDescription: string;
  description: string;
  featured: boolean;
  gallery: string[];
  sizes: string[];
  features: string[];
  specifications: Spec[];
  aplusImages: { label: string; alt: string; src: string }[];
};

type Errors = Partial<Record<"name" | "slug" | "categorySlug" | "series" | "shortDescription", string>>;

const emptyDraft = (): Draft => ({
  name: "",
  slug: "",
  slugTouched: false,
  shortDescription: "",
  description: "",
  featured: false,
  gallery: [],
  sizes: [],
  features: [],
  specifications: [],
  aplusImages: [],
});

/** The website can only show photos from this site or the Plusmark Cloudinary account. */
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "drt0rpkn2";
const siteImageLinkError = (url: string) =>
  url.startsWith("/") || url.startsWith(`https://res.cloudinary.com/${CLOUD}/image/upload/`)
    ? null
    : "Only Plusmark Cloudinary image links work here. Download the photo and upload it instead.";

const catLabel = (slug?: string) => CATEGORIES.find((c) => c.value === slug)?.label ?? slug ?? "";

export function ProductsManager({ initialProducts }: { initialProducts: ProductData[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [panel, setPanel] = useState<{ mode: "add" } | { mode: "edit"; id: string } | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [toast, showToast] = useToast();

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) => (!category || p.categorySlug === category) && (!q || p.name.toLowerCase().includes(q) || p.slug.includes(q) || p.series?.toLowerCase().includes(q)),
    );
  }, [products, query, category]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    if (k in errors) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const openAdd = () => {
    setDraft(emptyDraft());
    setErrors({});
    setPanel({ mode: "add" });
  };
  const openEdit = (p: ProductData) => {
    const gallery = p.gallery?.length ? p.gallery : p.image ? [p.image] : [];
    setDraft({
      name: p.name,
      slug: p.slug,
      slugTouched: true,
      categorySlug: p.categorySlug,
      series: p.series,
      shortDescription: p.shortDescription ?? "",
      description: p.description ?? "",
      featured: !!p.featured,
      gallery,
      sizes: p.sizes ?? [],
      features: p.features ?? [],
      specifications: p.specifications ?? [],
      aplusImages: p.aplusImages ?? [],
    });
    setErrors({});
    setPanel({ mode: "edit", id: p.id });
  };
  const close = () => !saving && setPanel(null);
  useOpenOnNew(openAdd);

  const save = async () => {
    if (!panel) return;
    const slug = slugify(draft.slug || draft.name);
    const errs: Errors = {};
    if (!draft.name.trim()) errs.name = "Enter the product name";
    if (!draft.categorySlug) errs.categorySlug = "Choose a category";
    if (!draft.series) errs.series = "Choose a series";
    if (!draft.shortDescription.trim()) errs.shortDescription = "Add a one-line summary";
    if (!slug) errs.slug = "Enter a web address";
    else if (products.some((p) => p.slug === slug && (panel.mode === "add" || p.id !== panel.id))) {
      errs.slug = "Another product already uses this web address";
    }
    setErrors(errs);
    if (Object.keys(errs).length) {
      showToast("Please fill in the highlighted fields", "error");
      return;
    }

    const data: Omit<ProductData, "id"> = {
      slug,
      name: draft.name.trim(),
      categorySlug: draft.categorySlug!,
      series: draft.series!,
      shortDescription: draft.shortDescription.trim(),
      description: draft.description.trim(),
      featured: draft.featured,
      gallery: draft.gallery,
      image: draft.gallery[0] ?? "",
      sizes: draft.sizes,
      features: draft.features,
      specifications: draft.specifications.filter((s) => s.label.trim() && s.value.trim()).map((s) => ({ label: s.label.trim(), value: s.value.trim() })),
      aplusImages: draft.aplusImages.map((a) => ({ ...a, label: a.label.trim() || "Banner", alt: a.alt.trim() || a.label.trim() || draft.name.trim() })),
    };

    setSaving(true);
    try {
      if (panel.mode === "add") {
        const res = await addProduct(data);
        if (!res.id) throw new Error("Could not add the product");
        setProducts((ps) => [...ps, { id: res.id!, ...data }].sort((a, b) => a.name.localeCompare(b.name)));
        showToast(`${data.name} added`);
      } else {
        await updateProduct(panel.id, data);
        setProducts((ps) => ps.map((p) => (p.id === panel.id ? { ...p, ...data } : p)));
        showToast("Changes saved");
      }
      setPanel(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: ProductData) => {
    if (!confirm(`Delete "${p.name}" from the catalog?`)) return;
    try {
      await deleteProduct(p.id, p.slug);
      setProducts((ps) => ps.filter((x) => x.id !== p.id));
      showToast("Product deleted");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not delete product", "error");
    }
  };

  const movePhoto = (i: number, dir: -1 | 1) => {
    const g = [...draft.gallery];
    const to = i + dir;
    if (to < 0 || to >= g.length) return;
    [g[i], g[to]] = [g[to], g[i]];
    set("gallery", g);
  };

  return (
    <div className="space-y-5">
      {toast}

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Products" value={products.length} />
        <Stat label="Featured" value={products.filter((p) => p.featured).length} />
        <Stat label="Without photos" value={products.filter((p) => !(p.image || p.gallery?.length)).length} />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-steel/60" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or series…" aria-label="Search products" className={cn(inputCls(), "pl-9")} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category" className={cn(inputCls(), "cursor-pointer lg:w-64")}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <button type="button" onClick={openAdd} className={btnPrimary}>
          <Plus aria-hidden className="size-4" /> Add product
        </button>
      </div>

      {(query || category) && (
        <p className="px-1 text-xs text-steel">
          Showing {visible.length} of {products.length} products
        </p>
      )}

      {visible.length ? (
        <ul className="grid gap-3 md:grid-cols-2">
          {visible.map((p) => {
            const img = p.image || p.gallery?.[0];
            return (
              <li key={p.id} className="group flex gap-4 rounded-2xl border border-line bg-white p-3 transition hover:border-steel/30 hover:shadow-sm">
                <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-mist">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" className="size-full object-contain p-1.5 mix-blend-multiply" />
                  ) : (
                    <ImageIcon aria-hidden className="size-6 text-steel/40" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start gap-2">
                    <h3 className="line-clamp-2 text-sm font-semibold text-graphite">{p.name}</h3>
                    {p.featured && (
                      <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[0.65rem] font-semibold text-amber-700 ring-1 ring-amber-200">
                        <Star aria-hidden className="size-3 fill-amber-500 text-amber-500" /> Featured
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-xs text-steel">
                    {p.series} · {catLabel(p.categorySlug)}
                  </p>
                  <p className="mt-1 text-xs text-steel">
                    {p.sizes?.length ? `${p.sizes.length} size${p.sizes.length === 1 ? "" : "s"}` : "No sizes"} · {p.gallery?.length || (img ? 1 : 0)} photo
                    {(p.gallery?.length || (img ? 1 : 0)) === 1 ? "" : "s"}
                  </p>
                  <div className="mt-auto flex items-center gap-2 pt-3">
                    <button type="button" onClick={() => openEdit(p)} className={btnGhost}>
                      <Pencil aria-hidden className="size-3.5" /> Edit
                    </button>
                    <button type="button" onClick={() => remove(p)} aria-label={`Delete ${p.name}`} className={cn(btnDanger, "ml-auto px-2")}>
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
          icon={Package}
          title={query || category ? "No products match" : "No products yet"}
          text={query || category ? "Try a different search or category." : "Add your first product to the catalog."}
          action={
            query || category ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("");
                }}
                className={btnSecondary}
              >
                Clear filters
              </button>
            ) : (
              <button type="button" onClick={openAdd} className={btnPrimary}>
                <Plus aria-hidden className="size-4" /> Add product
              </button>
            )
          }
        />
      )}

      <Drawer
        open={!!panel}
        wide
        onClose={close}
        title={panel?.mode === "edit" ? `Edit ${draft.name || "product"}` : "Add a product"}
        subtitle="Only the fields marked * are needed. Everything else can be added later."
        footer={<FormFooter onCancel={close} onSave={save} saving={saving} saveLabel={panel?.mode === "edit" ? "Save changes" : "Add product"} />}
      >
        {/* 1. Basics */}
        <section aria-labelledby="p-basics" className="space-y-5">
          <h3 id="p-basics" className="text-xs font-semibold uppercase tracking-[0.12em] text-steel">
            Basics
          </h3>
          <Field label="Product name" required htmlFor="p-name" error={errors.name}>
            <input
              id="p-name"
              value={draft.name}
              onChange={(e) => {
                const name = e.target.value;
                setDraft((d) => ({ ...d, name, slug: d.slugTouched ? d.slug : slugify(name) }));
                if (errors.name || errors.slug) setErrors((er) => ({ ...er, name: undefined, slug: undefined }));
              }}
              placeholder="e.g. Metallic Premium White Board"
              className={inputCls(!!errors.name)}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" required htmlFor="p-cat" error={errors.categorySlug}>
              <select
                id="p-cat"
                value={draft.categorySlug ?? ""}
                onChange={(e) => set("categorySlug", (e.target.value || undefined) as CategorySlug | undefined)}
                className={cn(inputCls(!!errors.categorySlug), "cursor-pointer")}
              >
                <option value="">Choose a category…</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Series" required htmlFor="p-series" error={errors.series}>
              <select
                id="p-series"
                value={draft.series ?? ""}
                onChange={(e) => set("series", (e.target.value || undefined) as Series | undefined)}
                className={cn(inputCls(!!errors.series), "cursor-pointer")}
              >
                <option value="">Choose a series…</option>
                <optgroup label="Board series">
                  {MAIN_SERIES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </optgroup>
                <optgroup label="Other">
                  {OTHER_SERIES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </optgroup>
              </select>
            </Field>
          </div>

          <Field
            label="One-line summary"
            required
            htmlFor="p-short"
            error={errors.shortDescription}
            hint={`Shown on product cards. ${draft.shortDescription.length}/160`}
          >
            <input
              id="p-short"
              maxLength={160}
              value={draft.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
              placeholder="e.g. Heavy-duty aluminium frame with high-gloss marker grade HPL surface."
              className={inputCls(!!errors.shortDescription)}
            />
          </Field>

          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line px-4 py-3">
            <span>
              <span className="block text-sm font-medium text-graphite">Feature on the home page</span>
              <span className="block text-xs text-steel">Highlights this product in featured lists.</span>
            </span>
            <input type="checkbox" checked={draft.featured} onChange={(e) => set("featured", e.target.checked)} className="peer sr-only" />
            <span
              aria-hidden
              className="relative h-6 w-11 shrink-0 rounded-full bg-fog transition after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:bg-brand peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40"
            />
          </label>
        </section>

        {/* 2. Photos */}
        <section aria-labelledby="p-photos" className="space-y-3 border-t border-line pt-6">
          <h3 id="p-photos" className="text-xs font-semibold uppercase tracking-[0.12em] text-steel">
            Photos <span className="font-normal normal-case tracking-normal">(optional · the first photo is the main one)</span>
          </h3>
          {draft.gallery.length > 0 && (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {draft.gallery.map((src, i) => (
                <li key={`${src}-${i}`} className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-mist">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Photo ${i + 1}`} className="size-full object-contain p-1.5 mix-blend-multiply" />
                  {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-md bg-graphite px-1.5 py-0.5 text-[0.6rem] font-semibold text-white">Main</span>}
                  <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                    <span className="flex gap-1">
                      <button type="button" disabled={i === 0} onClick={() => movePhoto(i, -1)} aria-label="Move photo left" className="rounded-md bg-white/95 p-1 shadow disabled:opacity-40 cursor-pointer">
                        <ArrowLeft aria-hidden className="size-3.5" />
                      </button>
                      <button type="button" disabled={i === draft.gallery.length - 1} onClick={() => movePhoto(i, 1)} aria-label="Move photo right" className="rounded-md bg-white/95 p-1 shadow disabled:opacity-40 cursor-pointer">
                        <ArrowRight aria-hidden className="size-3.5" />
                      </button>
                    </span>
                    <button type="button" onClick={() => set("gallery", draft.gallery.filter((_, j) => j !== i))} aria-label="Remove photo" className="rounded-md bg-white/95 p-1 text-red-600 shadow cursor-pointer">
                      <X aria-hidden className="size-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <DropUpload
            kind="image"
            multiple
            maxMb={10}
            accept="image/png,image/jpeg,image/webp"
            title="Drop product photos here, or click to choose"
            hint="Select several at once · PNG, JPG or WEBP · up to 10 MB each"
            compact={draft.gallery.length > 0}
            onUploaded={(f) => setDraft((d) => ({ ...d, gallery: [...d.gallery, f.url] }))}
            onLink={(url) => setDraft((d) => ({ ...d, gallery: [...d.gallery, url] }))}
            validateLink={siteImageLinkError}
            linkPlaceholder="…or paste a Cloudinary image link"
          />
        </section>

        {/* 3. Sizes */}
        <section aria-labelledby="p-sizes" className="space-y-3 border-t border-line pt-6">
          <h3 id="p-sizes" className="text-xs font-semibold uppercase tracking-[0.12em] text-steel">
            Sizes <span className="font-normal normal-case tracking-normal">(optional)</span>
          </h3>
          <TagInput
            id="p-sizes-input"
            values={draft.sizes}
            onChange={(v) => set("sizes", v)}
            placeholder="Type a size and press Enter, e.g. 4 × 6 ft"
            suggestions={STANDARD_SIZES}
          />
          <p className="text-xs text-steel">These appear in the size picker on the product page and in the enquiry form.</p>
        </section>

        {/* 4. Optional detail, folded away */}
        <div className="space-y-3 border-t border-line pt-6">
          <MoreSection title="Description & key features" summary={draft.features.length ? `${draft.features.length} features` : "Longer text and bullet points"}>
            <Field label="Full description" htmlFor="p-desc">
              <textarea id="p-desc" rows={4} value={draft.description} onChange={(e) => set("description", e.target.value)} placeholder="A paragraph about the product…" className={inputCls()} />
            </Field>
            <Field label="Key features" hint="Press Enter after each feature. Pasting several lines adds them all.">
              <TagInput values={draft.features} onChange={(v) => set("features", v)} placeholder="e.g. Scratch-resistant HPL surface" allowComma={false} />
            </Field>
          </MoreSection>

          <MoreSection title="Specifications" summary={draft.specifications.length ? `${draft.specifications.length} rows` : "Frame, surface, thickness…"}>
            <SpecsEditor specs={draft.specifications} onChange={(v) => set("specifications", v)} />
          </MoreSection>

          <MoreSection title="A+ banners" summary={draft.aplusImages.length ? `${draft.aplusImages.length} banners` : "Wide infographic images"}>
            <p className="text-xs text-steel">The Plusmark brand banner is added first automatically. Only add banners specific to this product.</p>
            {draft.aplusImages.length > 0 && (
              <ul className="space-y-2">
                {draft.aplusImages.map((a, i) => (
                  <li key={`${a.src}-${i}`} className="flex items-center gap-3 rounded-xl border border-line p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.src} alt="" className="h-12 w-28 shrink-0 rounded-md bg-mist object-cover" />
                    <input
                      value={a.label}
                      onChange={(e) => set("aplusImages", draft.aplusImages.map((x, j) => (j === i ? { ...x, label: e.target.value, alt: e.target.value } : x)))}
                      placeholder="Banner title, e.g. Surface & writing feel"
                      aria-label={`Title for banner ${i + 1}`}
                      className={cn(inputCls(), "py-2")}
                    />
                    <button type="button" onClick={() => set("aplusImages", draft.aplusImages.filter((_, j) => j !== i))} aria-label="Remove banner" className={cn(btnDanger, "px-2")}>
                      <X aria-hidden className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <DropUpload
              kind="image"
              multiple
              maxMb={10}
              accept="image/png,image/jpeg,image/webp"
              title="Drop banner images here, or click to choose"
              hint="Wide images · up to 10 MB each"
              compact
              onUploaded={(f) => setDraft((d) => ({ ...d, aplusImages: [...d.aplusImages, { src: f.url, label: "", alt: "" }] }))}
              onLink={(url) => setDraft((d) => ({ ...d, aplusImages: [...d.aplusImages, { src: url, label: "", alt: "" }] }))}
              validateLink={siteImageLinkError}
              linkPlaceholder="…or paste a banner image link"
            />
          </MoreSection>

          <MoreSection title="Web address" summary={`/products/${slugify(draft.slug || draft.name) || "…"}`} defaultOpen={!!errors.slug}>
            <Field label="Web address" required htmlFor="p-slug" error={errors.slug} hint="Filled in from the name automatically. Only change it if you need to.">
              <div className={cn(inputCls(!!errors.slug), "flex items-center gap-1 p-0 pl-3.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15")}>
                <span className="shrink-0 text-sm text-steel">/products/</span>
                <input
                  id="p-slug"
                  value={draft.slug}
                  onChange={(e) => {
                    setDraft((d) => ({ ...d, slug: e.target.value, slugTouched: true }));
                    if (errors.slug) setErrors((er) => ({ ...er, slug: undefined }));
                  }}
                  onBlur={() => setDraft((d) => ({ ...d, slug: slugify(d.slug) }))}
                  className="min-w-0 flex-1 bg-transparent py-2.5 pr-3.5 font-mono text-sm outline-none"
                />
              </div>
            </Field>
          </MoreSection>
        </div>
      </Drawer>
    </div>
  );
}

/** Editable two-column table: property and value, one row each. */
function SpecsEditor({ specs, onChange }: { specs: Spec[]; onChange: (s: Spec[]) => void }) {
  const update = (i: number, patch: Partial<Spec>) => onChange(specs.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  return (
    <div className="space-y-2">
      {specs.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <input value={s.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Property, e.g. Frame" aria-label={`Property ${i + 1}`} className={cn(inputCls(), "w-2/5 py-2")} />
          <input value={s.value} onChange={(e) => update(i, { value: e.target.value })} placeholder="Value, e.g. Anodised aluminium" aria-label={`Value ${i + 1}`} className={cn(inputCls(), "flex-1 py-2")} />
          <button type="button" onClick={() => onChange(specs.filter((_, j) => j !== i))} aria-label={`Remove row ${i + 1}`} className={cn(btnDanger, "px-2")}>
            <X aria-hidden className="size-3.5" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...specs, { label: "", value: "" }])} className={btnGhost}>
        <Plus aria-hidden className="size-3.5" /> Add row
      </button>
    </div>
  );
}

export default ProductsManager;
