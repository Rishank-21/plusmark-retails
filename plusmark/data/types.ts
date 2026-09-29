/**
 * Shared product data types.
 * Every value stored against these types must come from the Plusmark catalog.
 */

export type CategorySlug =
  | "white-boards"
  | "chalk-boards"
  | "notice-boards"
  | "magnetic-boards"
  | "ceramic-boards"
  | "specialty-boards"
  | "acrylic-door-cover-notice-boards"
  | "board-study-essentials"
  | "display-boards"
  | "board-stands"
  | "clipboards"
  | "school-benches"
  | "schedule-boards";

export interface Category {
  slug: CategorySlug;
  name: string;
  /** Short one-line description, catalog-derived. */
  summary: string;
  /** Longer intro paragraph for the category page. */
  intro: string;
  seoTitle: string;
  seoDescription: string;
  /** Representative product slug used for category imagery. */
  coverProduct: string;
}

export interface Spec {
  label: string;
  value: string;
}

/**
 * Construction series used in the catalog. Used by the "Product type" filter.
 */
export type Series =
  | "Metallic Premium"
  | "Eco Premium"
  | "Deluxe Standard"
  | "Eco Regular"
  | "Deluxe"
  | "ECO"
  | "Clipboard"
  | "School Bench"
  | "Stand & Storage"
  | "Essentials"
  | "Display"
  | "Specialty"
  | "Custom";

export interface Product {
  slug: string;
  name: string;
  categorySlug: CategorySlug;
  series: Series;
  shortDescription: string;
  description: string;
  features: string[];
  specifications: Spec[];
  applications: string[];
  variants: string[];
  colors: string[];
  sizes: string[];
  /** Selectable sizes with a photo each (from the Plusmark Drive). Empty when not available. */
  sizeOptions: { label: string; image: string }[];
  /** Catalog-supplied guidance / notes (e.g. "Selection Guidance"). */
  notes: string[];
  /** Small tags shown near the title — only verbatim catalog phrases. */
  highlights: string[];
  /**
   * "full"    → the catalog provides detailed specification copy.
   * "listing" → the catalog only lists the product name/model; details on request.
   */
  catalogDetail: "full" | "listing";
  image: string;
  imageAlt: string;
  /** Product photos (first entry is `image`). Always has at least one entry. */
  gallery: string[];
  /** Path to a GLB model, if one exists. */
  model?: string;
  /** Image shown when WebGL / the model is unavailable. */
  modelFallback: string;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
}
