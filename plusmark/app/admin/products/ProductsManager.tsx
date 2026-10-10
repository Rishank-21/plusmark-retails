"use client";

import { useState } from "react";
import { addProduct, updateProduct, deleteProduct, type ProductData } from "./actions";
import {
  Pencil,
  Trash2,
  Plus,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Package,
  Star,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowUp,
  ArrowDown,
  FileText,
  Sliders,
  Layers,
  Sparkles,
} from "lucide-react";
import type { CategorySlug, Series, Spec } from "@/data/types";
import { cn } from "@/lib/utils";

interface ProductsManagerProps {
  initialProducts: ProductData[];
}

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

const SERIES_OPTIONS: Series[] = [
  "Metallic Premium",
  "Eco Premium",
  "Deluxe Standard",
  "Eco Regular",
  "Deluxe",
  "ECO",
  "Clipboard",
  "School Bench",
  "Stand & Storage",
  "Essentials",
  "Display",
  "Specialty",
  "Custom",
];

export function ProductsManager({ initialProducts }: ProductsManagerProps) {
  const [products, setProducts] = useState<ProductData[]>(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<ProductData>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || p.categorySlug === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAdd = async () => {
    if (!formData.slug?.trim() || !formData.name?.trim() || !formData.categorySlug || !formData.series || !formData.shortDescription?.trim()) {
      showToast("Please fill in: Slug, Name, Category, Series, and Short Description", "error");
      return;
    }
    try {
      const result = await addProduct(formData as Omit<ProductData, "id">);
      if (result.success && result.id) {
        setProducts([...products, { id: result.id, ...formData } as ProductData]);
        setAdding(false);
        setFormData({});
        showToast("Product added to catalog successfully!");
      } else {
        showToast("Failed to add product", "error");
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error adding product", "error");
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateProduct(id, formData);
      setProducts(products.map((p) => (p.id === id ? ({ ...p, ...formData } as ProductData) : p)));
      setEditingId(null);
      setFormData({});
      showToast("Product updated successfully!");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error updating product", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product from catalog?")) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      showToast("Product deleted from catalog");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error deleting product", "error");
    }
  };

  const startEdit = (product: ProductData) => {
    setEditingId(product.id);
    setAdding(false);
    setFormData(product);
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

      {/* Search & Actions Bar */}
      <div className="rounded-xl border border-line bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-graphite">Catalog Products</h2>
            <p className="text-xs text-steel">
              Showing {filteredProducts.length} of {products.length} registered products
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
            <span>Add New Product</span>
          </button>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <div className="relative flex-1">
            <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-steel/60" />
            <input
              type="text"
              placeholder="Search by product name or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-line bg-white pl-10 pr-3.5 py-2 text-xs text-graphite placeholder:text-steel/50 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-line bg-white px-3.5 py-2 text-xs text-graphite focus:border-brand focus:ring-1 focus:ring-brand outline-none transition cursor-pointer sm:w-64"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add Product Form */}
      {adding && (
        <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Plus className="size-4" />
              </div>
              <div>
                <h3 className="font-semibold text-graphite">Add New Product</h3>
                <p className="text-xs text-steel">Configure technical specs, gallery, and A+ banners</p>
              </div>
            </div>
            <button
              onClick={cancelEdit}
              className="rounded-md p-1.5 text-steel hover:bg-fog hover:text-graphite transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
          <ProductForm formData={formData} setFormData={setFormData} onSave={handleAdd} onCancel={cancelEdit} isNew />
        </div>
      )}

      {/* Products List */}
      <div className="space-y-3">
        {filteredProducts.map((product) => {
          const isEditing = editingId === product.id;

          if (isEditing) {
            return (
              <div
                key={product.id}
                className="rounded-xl border border-accent/40 bg-white p-6 shadow-md ring-1 ring-accent/20"
              >
                <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                      <Pencil className="size-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-graphite">Edit: {product.name}</h3>
                      <p className="text-xs text-steel">Update specifications, images, and content</p>
                    </div>
                  </div>
                  <button
                    onClick={cancelEdit}
                    className="rounded-md p-1.5 text-steel hover:bg-fog hover:text-graphite transition-colors cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <ProductForm
                  formData={formData}
                  setFormData={setFormData}
                  onSave={() => handleUpdate(product.id)}
                  onCancel={cancelEdit}
                />
              </div>
            );
          }

          const primaryImage = product.image || product.gallery?.[0];

          return (
            <div
              key={product.id}
              className="group flex flex-col gap-4 rounded-xl border border-line bg-white p-4 transition-all hover:border-slate-300 hover:shadow-xs sm:flex-row sm:items-center sm:gap-5"
            >
              {/* Product Thumbnail */}
              <div className="flex size-20 shrink-0 items-center justify-center rounded-lg border border-line bg-mist/60 overflow-hidden">
                {primaryImage ? (
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="size-full object-contain p-1"
                  />
                ) : (
                  <ImageIcon className="size-6 text-steel/40" />
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-graphite text-sm sm:text-base truncate">
                    {product.name}
                  </h3>
                  {product.featured && (
                    <span className="inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                      <Star className="size-3 fill-amber-500 text-amber-500" />
                      Featured
                    </span>
                  )}
                </div>
                <p className="font-mono text-xs text-steel/70 mt-0.5">{product.slug}</p>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="rounded bg-fog px-2 py-0.5 text-[11px] font-medium text-graphite">
                    {product.series}
                  </span>
                  <span className="rounded bg-fog px-2 py-0.5 text-[11px] text-steel">
                    {CATEGORIES.find((c) => c.value === product.categorySlug)?.label || product.categorySlug}
                  </span>
                  {product.gallery && product.gallery.length > 0 && (
                    <span className="rounded bg-fog px-2 py-0.5 text-[11px] text-steel">
                      {product.gallery.length} photos
                    </span>
                  )}
                  {product.aplusImages && product.aplusImages.length > 0 && (
                    <span className="rounded bg-fog px-2 py-0.5 text-[11px] text-brand font-medium">
                      {product.aplusImages.length} A+ banners
                    </span>
                  )}
                </div>

                <p className="mt-2 line-clamp-1 text-xs text-steel">{product.shortDescription}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-line/50 pt-3 sm:border-0 sm:pt-0 shrink-0">
                <button
                  type="button"
                  onClick={() => startEdit(product)}
                  className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-steel hover:bg-fog hover:text-graphite transition cursor-pointer"
                >
                  <Pencil className="size-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(product.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/50 p-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition cursor-pointer"
                  title="Delete product"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && !adding && (
        <div className="rounded-xl border border-dashed border-line bg-white p-12 text-center">
          <Package className="mx-auto size-10 text-steel/40" />
          <h3 className="mt-3 font-semibold text-graphite">No products found</h3>
          <p className="mt-1 text-xs text-steel">
            Try adjusting your search query or category filter.
          </p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PRODUCT FORM COMPONENT
   ───────────────────────────────────────────────────────────── */

interface ProductFormProps {
  formData: Partial<ProductData>;
  setFormData: (data: Partial<ProductData>) => void;
  onSave: () => void;
  onCancel: () => void;
  isNew?: boolean;
}

function ProductForm({ formData, setFormData, onSave, onCancel, isNew = false }: ProductFormProps) {
  const [activeTab, setActiveTab] = useState<"general" | "gallery" | "aplus" | "specs">("general");
  const [uploading, setUploading] = useState(false);

  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    const gallery = [...(formData.gallery || [])];
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) continue;
      const reader = new FileReader();
      await new Promise<void>((resolve) => {
        reader.onload = (event) => {
          const base64String = event.target?.result as string;
          gallery.push(base64String);
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
    setFormData({ ...formData, gallery, image: gallery[0] || formData.image });
    setUploading(false);
  };

  const removeImage = (index: number) => {
    const gallery = [...(formData.gallery || [])];
    gallery.splice(index, 1);
    setFormData({ ...formData, gallery, image: gallery[0] || "" });
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const gallery = [...(formData.gallery || [])];
    const [moved] = gallery.splice(fromIndex, 1);
    gallery.splice(toIndex, 0, moved);
    setFormData({ ...formData, gallery, image: gallery[0] || formData.image });
  };

  const addArrayItem = (field: keyof ProductData, value: string) => {
    if (!value.trim()) return;
    const current = (formData[field] as string[]) || [];
    setFormData({ ...formData, [field]: [...current, value.trim()] });
  };

  const removeArrayItem = (field: keyof ProductData, index: number) => {
    const current = [...((formData[field] as string[]) || [])];
    current.splice(index, 1);
    setFormData({ ...formData, [field]: current });
  };

  const addSpecification = (label: string, value: string) => {
    if (!label.trim() || !value.trim()) return;
    const specs = formData.specifications || [];
    setFormData({
      ...formData,
      specifications: [...specs, { label: label.trim(), value: value.trim() }],
    });
  };

  const removeSpecification = (index: number) => {
    const specs = [...(formData.specifications || [])];
    specs.splice(index, 1);
    setFormData({ ...formData, specifications: specs });
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-line gap-2 overflow-x-auto pb-px">
        {[
          { id: "general", label: "General Details", icon: FileText },
          { id: "gallery", label: `Product Photos (${formData.gallery?.length || 0})`, icon: ImageIcon },
          { id: "aplus", label: `A+ Banners (${formData.aplusImages?.length || 0})`, icon: Layers },
          { id: "specs", label: "Specs & Features", icon: Sliders },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={cn(
              "inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition cursor-pointer",
              activeTab === id
                ? "border-brand text-brand bg-fog/30 rounded-t-lg"
                : "border-transparent text-steel hover:text-graphite hover:border-line"
            )}
          >
            <Icon className="size-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: GENERAL ── */}
      {activeTab === "general" && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-steel mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Metallic Premium White Board"
                className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-graphite placeholder:text-steel/50 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-steel mb-1.5">
                Product Slug (URL ID) *
              </label>
              <input
                type="text"
                value={formData.slug || ""}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. metallic-premium-white-board"
                className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm font-mono text-graphite placeholder:text-steel/50 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-steel mb-1.5">
                Category *
              </label>
              <select
                value={formData.categorySlug || ""}
                onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value as CategorySlug })}
                className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-graphite focus:border-brand focus:ring-1 focus:ring-brand outline-none transition cursor-pointer"
              >
                <option value="">Select category...</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-steel mb-1.5">
                Series *
              </label>
              <select
                value={formData.series || ""}
                onChange={(e) => setFormData({ ...formData, series: e.target.value as Series })}
                className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-graphite focus:border-brand focus:ring-1 focus:ring-brand outline-none transition cursor-pointer"
              >
                <option value="">Select series...</option>
                {SERIES_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-steel mb-1.5">
              Short Description *
            </label>
            <input
              type="text"
              value={formData.shortDescription || ""}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              placeholder="Short one-line summary for cards and catalog listings..."
              className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-graphite placeholder:text-steel/50 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-steel mb-1.5">
              Full Product Description
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Comprehensive product copy and background..."
              className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-graphite placeholder:text-steel/50 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
            />
          </div>

          <div className="flex items-center gap-6 rounded-lg border border-line bg-fog/20 p-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured || false}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="size-4 rounded accent-brand"
              />
              <span className="text-xs font-semibold text-graphite">Feature this product on homepage</span>
            </label>
          </div>
        </div>
      )}

      {/* ── TAB 2: GALLERY PHOTOS ── */}
      {activeTab === "gallery" && (
        <div className="space-y-4">
          <div className="rounded-xl border-2 border-dashed border-line bg-fog/30 p-6 text-center hover:border-brand transition">
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              onChange={handleMultipleImageUpload}
              disabled={uploading}
              className="hidden"
              id="gallery-file-input"
            />
            <label htmlFor="gallery-file-input" className="cursor-pointer">
              <Upload className="mx-auto size-8 text-steel/60 mb-2" />
              <p className="text-xs font-semibold text-graphite">Click to upload product photos</p>
              <p className="text-[11px] text-steel mt-0.5">PNG, JPG, WEBP (Max 5MB each)</p>
            </label>
            {uploading && <p className="text-xs text-brand font-medium mt-2">Processing images...</p>}
          </div>

          {formData.gallery && formData.gallery.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {formData.gallery.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-square rounded-lg border border-line bg-white p-1 overflow-hidden"
                >
                  <img src={img} alt={`Gallery ${idx + 1}`} className="size-full object-contain" />
                  {idx === 0 && (
                    <span className="absolute left-2 top-2 rounded bg-brand px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                      PRIMARY
                    </span>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/60 opacity-0 group-hover:opacity-100 transition">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(idx, idx - 1)}
                        className="rounded bg-white/20 p-1 text-white hover:bg-white/40"
                        title="Move backward"
                      >
                        <ArrowUp className="size-3" />
                      </button>
                    )}
                    {idx < formData.gallery!.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(idx, idx + 1)}
                        className="rounded bg-white/20 p-1 text-white hover:bg-white/40"
                        title="Move forward"
                      >
                        <ArrowDown className="size-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="rounded bg-red-500/80 p-1 text-white hover:bg-red-600"
                      title="Remove image"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: A+ LISTING BANNERS ── */}
      {activeTab === "aplus" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-900 leading-relaxed">
            <strong>Note:</strong> The core Plusmark brand banner is automatically positioned first on all A+ showcase listings. Only add product-specific infographics or feature banners below.
          </div>
          <AplusImagesField
            images={formData.aplusImages || []}
            onAdd={(label, alt, src) => {
              const images = formData.aplusImages || [];
              setFormData({ ...formData, aplusImages: [...images, { label, alt, src }] });
            }}
            onRemove={(index) => {
              const images = [...(formData.aplusImages || [])];
              images.splice(index, 1);
              setFormData({ ...formData, aplusImages: images });
            }}
            onMove={(fromIndex, toIndex) => {
              const images = [...(formData.aplusImages || [])];
              const [moved] = images.splice(fromIndex, 1);
              images.splice(toIndex, 0, moved);
              setFormData({ ...formData, aplusImages: images });
            }}
          />
        </div>
      )}

      {/* ── TAB 4: SPECS & FEATURES ── */}
      {activeTab === "specs" && (
        <div className="space-y-6">
          {/* Key Features */}
          <div className="rounded-xl border border-line bg-fog/20 p-4">
            <label className="block text-xs font-mono uppercase tracking-wider text-steel mb-2">
              Key Features Bullet Points
            </label>
            <DynamicListField
              items={formData.features || []}
              onAdd={(val) => addArrayItem("features", val)}
              onRemove={(idx) => removeArrayItem("features", idx)}
              placeholder="e.g. Hardcore Chalk Grade HPL surface"
            />
          </div>

          {/* Specifications Table */}
          <div className="rounded-xl border border-line bg-fog/20 p-4">
            <label className="block text-xs font-mono uppercase tracking-wider text-steel mb-2">
              Technical Specifications (Key / Value)
            </label>
            <SpecificationsField
              specs={formData.specifications || []}
              onAdd={addSpecification}
              onRemove={removeSpecification}
            />
          </div>

          {/* Available Sizes */}
          <div className="rounded-xl border border-line bg-fog/20 p-4">
            <label className="block text-xs font-mono uppercase tracking-wider text-steel mb-2">
              Available Sizes
            </label>
            <DynamicListField
              items={formData.sizes || []}
              onAdd={(val) => addArrayItem("sizes", val)}
              onRemove={(idx) => removeArrayItem("sizes", idx)}
              placeholder="e.g. 2×3 feet, 4×6 feet"
            />
          </div>
        </div>
      )}

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
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-graphite px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-black transition cursor-pointer disabled:opacity-50"
        >
          <span>{isNew ? "Save Product to Catalog" : "Save Changes"}</span>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   HELPERS & FIELD SUB-COMPONENTS
   ───────────────────────────────────────────────────────────── */

function DynamicListField({
  items,
  onAdd,
  onRemove,
  placeholder,
}: {
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (input.trim()) {
      onAdd(input.trim());
      setInput("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-line bg-white px-3 py-2 text-xs text-graphite placeholder:text-steel/50 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-lg bg-graphite px-3 py-2 text-xs font-medium text-white hover:bg-black transition cursor-pointer"
        >
          Add
        </button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs text-graphite"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="text-steel hover:text-red-600 transition cursor-pointer"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SpecificationsField({
  specs,
  onAdd,
  onRemove,
}: {
  specs: Spec[];
  onAdd: (l: string, v: string) => void;
  onRemove: (i: number) => void;
}) {
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");

  const handleAdd = () => {
    if (label.trim() && value.trim()) {
      onAdd(label.trim(), value.trim());
      setLabel("");
      setValue("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Property (e.g. Frame Material)"
          className="sm:w-1/3 rounded-lg border border-line bg-white px-3 py-2 text-xs text-graphite placeholder:text-steel/50 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
          placeholder="Value (e.g. Satin Finish Aluminium)"
          className="flex-1 rounded-lg border border-line bg-white px-3 py-2 text-xs text-graphite placeholder:text-steel/50 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-lg bg-graphite px-4 py-2 text-xs font-medium text-white hover:bg-black transition cursor-pointer"
        >
          Add Spec
        </button>
      </div>

      {specs.length > 0 && (
        <div className="rounded-lg border border-line bg-white divide-y divide-line overflow-hidden">
          {specs.map((spec, idx) => (
            <div key={idx} className="flex items-center justify-between px-3.5 py-2 text-xs">
              <div>
                <span className="font-semibold text-graphite">{spec.label}: </span>
                <span className="text-steel">{spec.value}</span>
              </div>
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="text-steel hover:text-red-600 transition cursor-pointer p-1"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AplusImagesField({
  images,
  onAdd,
  onRemove,
  onMove,
}: {
  images: Array<{ label: string; alt: string; src: string }>;
  onAdd: (label: string, alt: string, src: string) => void;
  onRemove: (index: number) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
}) {
  const [label, setLabel] = useState("");
  const [alt, setAlt] = useState("");
  const [src, setSrc] = useState("");

  const handleAdd = () => {
    if (label.trim() && alt.trim() && src.trim()) {
      onAdd(label.trim(), alt.trim(), src.trim());
      setLabel("");
      setAlt("");
      setSrc("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Input box */}
      <div className="rounded-lg border border-line bg-fog/20 p-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-steel mb-1">Banner Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Surface & Writing Feel"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-xs text-graphite outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-steel mb-1">Alt Text</label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="e.g. Glare-free scratch-resistant surface..."
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-xs text-graphite outline-none focus:border-brand"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-steel mb-1">Banner Image URL / Path</label>
          <input
            type="text"
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            placeholder="e.g. /images/aplus/metallic-premium-white-board/01.webp or Cloudinary URL"
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-xs text-graphite outline-none focus:border-brand font-mono"
          />
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!label.trim() || !alt.trim() || !src.trim()}
          className="rounded-lg bg-graphite px-4 py-2 text-xs font-semibold text-white hover:bg-black transition cursor-pointer disabled:opacity-50"
        >
          Add Banner
        </button>
      </div>

      {/* Existing banners list */}
      {images.length > 0 && (
        <div className="space-y-2">
          {images.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-lg border border-line bg-white p-2.5 text-xs"
            >
              <img
                src={item.src}
                alt={item.alt}
                className="h-10 w-20 rounded border border-line object-cover bg-mist/60"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-graphite truncate">{item.label}</p>
                <p className="text-[11px] text-steel truncate">{item.alt}</p>
              </div>
              <div className="flex items-center gap-1">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => onMove(idx, idx - 1)}
                    className="p-1 text-steel hover:text-graphite cursor-pointer"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                )}
                {idx < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => onMove(idx, idx + 1)}
                    className="p-1 text-steel hover:text-graphite cursor-pointer"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="p-1 text-red-500 hover:text-red-700 cursor-pointer ml-1"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductsManager;
