import type { CategorySlug, Product } from "./types.ts";
import { products } from "./products.ts";

export interface Subcategory {
  id: string;
  label: string;
  description: string;
  productSlugs: string[];
}

export interface CategorySubcategoriesConfig {
  filterLabel: string;
  allLabel: string;
  subcategories: Subcategory[];
}

export const subcategoryConfigs: Partial<Record<CategorySlug, CategorySubcategoriesConfig>> = {
  "white-boards": {
    filterLabel: "Surface Type",
    allLabel: "All White Boards",
    subcategories: [
      {
        id: "non-magnetic",
        label: "Non-Magnetic",
        description: "Marker grade HPL and Melamine writing surfaces for effortless dry wiping.",
        productSlugs: [
          "metallic-premium-white-board",
          "eco-premium-white-board",
          "eco-premium-both-side-board",
          "deluxe-standard-white-board",
          "eco-regular-white-board",
        ],
      },
      {
        id: "magnetic",
        label: "Magnetic",
        description: "Resin coated steel and ceramic steel surfaces that securely accept magnets.",
        productSlugs: [
          "metallic-premium-magnetic-board",
          "deluxe-standard-magnetic-board",
          "eco-regular-magnetic-board",
          "metallic-premium-ceramic-board",
          "deluxe-standard-ceramic-board",
        ],
      },
    ],
  },
  "chalk-boards": {
    filterLabel: "Surface Type",
    allLabel: "All Chalk Boards",
    subcategories: [
      {
        id: "non-magnetic",
        label: "Non-Magnetic",
        description: "Hardcore Chalk Grade HPL Sheet — glare-free and scratch resistant.",
        productSlugs: [
          "metallic-premium-chalk-board",
          "eco-premium-chalk-board",
          "deluxe-standard-chalk-board",
          "eco-regular-chalk-board",
        ],
      },
      {
        id: "magnetic",
        label: "Magnetic",
        description: "Resin coated and ceramic steel green chalk surfaces that accept magnets.",
        productSlugs: [
          "metallic-premium-magnetic-chalk-board",
          "deluxe-standard-magnetic-chalk-board",
          "eco-regular-magnetic-chalk-board",
          "metallic-premium-ceramic-chalk-board",
          "deluxe-standard-ceramic-chalk-board",
        ],
      },
    ],
  },
  "notice-boards": {
    filterLabel: "Display Type",
    allLabel: "All Notice Boards",
    subcategories: [
      {
        id: "pin-up",
        label: "Pin-Up Boards",
        description: "Blazer cloth, velvet cloth, cork and fabric pin-up surfaces.",
        productSlugs: [
          "metallic-premium-notice-board",
          "eco-premium-notice-board",
          "deluxe-standard-notice-board",
          "eco-regular-notice-board",
          "cork-notice-board",
          "fabric-notice-board",
          "combination-board",
        ],
      },
      {
        id: "adc",
        label: "Acrylic Door Cover (ADC / Lockable)",
        description: "Lockable notice boards with clear acrylic doors protecting notices from dust.",
        productSlugs: [
          "deluxe-45mm-adc-notice-board-double-door",
          "deluxe-45mm-adc-notice-board-single-door",
          "eco-adc-notice-board-single-door",
        ],
      },
    ],
  },
  "clipboards": {
    filterLabel: "Base Material",
    allLabel: "All Clipboards",
    subcategories: [
      {
        id: "mdf",
        label: "MDF Base",
        description: "Pre-Lam MDF, Graphic MDF, and Laminate wood finish writing clipboards.",
        productSlugs: [
          "pre-lam-mdf-base-clipboard",
          "graphic-mdf-base-clipboard",
          "laminate-mdf-base-clipboard",
        ],
      },
      {
        id: "acrylic",
        label: "Acrylic Base",
        description: "Crystal Clear, Heavy-Duty shatter-resistant, and Crystal-Tint acrylic clipboards.",
        productSlugs: [
          "crystal-clear-base-clipboard",
          "heavy-duty-clear-acrylic-clipboard",
          "crystal-colour-base-clipboard",
        ],
      },
    ],
  },
  "board-stands": {
    filterLabel: "Product Type",
    allLabel: "All Stands & Storage",
    subcategories: [
      {
        id: "stands",
        label: "Display Stands",
        description: "Heavy-duty three leg, four leg, revolving, zig-zag and telescopic stands.",
        productSlugs: [
          "three-leg-stand",
          "four-leg-stand",
          "revolving-stand",
          "zig-zag-stand",
          "telescopic-stand",
          "pds-500",
        ],
      },
      {
        id: "storage",
        label: "Storage & Racks",
        description: "Newspaper stands, magazine stands, file racks, letter boxes and first aid boxes.",
        productSlugs: [
          "newspaper-stand",
          "magazine-stand",
          "file-rack",
          "first-aid-box",
          "letter-box",
        ],
      },
    ],
  },
};

export function getCategorySubcategories(slug: CategorySlug): CategorySubcategoriesConfig | null {
  return subcategoryConfigs[slug] ?? null;
}

export function getAllProductsForCategory(slug: CategorySlug): Product[] {
  const config = subcategoryConfigs[slug];
  if (!config) {
    return products.filter((p) => p.categorySlug === slug);
  }
  const ordered: Product[] = [];
  const seen = new Set<string>();
  for (const s of config.subcategories) {
    for (const pSlug of s.productSlugs) {
      if (!seen.has(pSlug)) {
        seen.add(pSlug);
        const prod = products.find((p) => p.slug === pSlug);
        if (prod) ordered.push(prod);
      }
    }
  }
  return ordered;
}
