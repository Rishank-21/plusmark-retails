import type { Category, CategorySlug } from "./types.ts";

export const categories: Category[] = [
  {
    slug: "white-boards",
    name: "White Boards",
    summary: "Marker boards in Magnetic, Non-Magnetic, and Ceramic variants with High Gloss Marker Grade HPL Sheet and premium writing surfaces.",
    intro:
      "Plusmark white boards are available in three types: Non-Magnetic boards with High Gloss Marker Grade HPL Sheet and Melamine surfaces in four construction series (Metallic Premium, Eco Premium, Deluxe Standard, Eco Regular), Magnetic boards with resin coated steel surfaces that accept magnets, and Ceramic boards with porcelain enamel steel surfaces for maximum durability and longevity.",
    seoTitle: "White Boards — Magnetic, Non-Magnetic & Ceramic Marker Boards",
    seoDescription:
      "Plusmark white boards: magnetic, non-magnetic and ceramic marker boards with High Gloss HPL Sheet, resin coated steel and porcelain enamel surfaces for offices, schools and institutions.",
    coverProduct: "metallic-premium-white-board",
    subcategories: [
      {
        slug: "white-boards-non-magnetic",
        name: "Non-Magnetic White Boards",
        summary: "High Gloss Marker Grade HPL Sheet and Melamine writing surfaces in Metallic Premium, Eco Premium, Deluxe Standard and Eco Regular series.",
        coverProduct: "metallic-premium-white-board",
      },
      {
        slug: "white-boards-magnetic",
        name: "Magnetic White Boards",
        summary: "Resin coated steel magnetic white boards that accept magnets, charts and holders.",
        coverProduct: "metallic-premium-magnetic-board",
      },
      {
        slug: "white-boards-ceramic",
        name: "Ceramic White Boards",
        summary: "Ceramic steel / porcelain enamel steel magnetic surfaces for very long product life.",
        coverProduct: "metallic-premium-ceramic-board",
      },
    ],
  },
  {
    slug: "chalk-boards",
    name: "Chalk Boards",
    summary: "Chalk boards in Magnetic, Non-Magnetic, and Ceramic variants with Chalk Grade HPL Sheet — non-reflective, glare-free surfaces.",
    intro:
      "Plusmark chalk boards are available in three types: Non-Magnetic boards with Chalk Grade HPL Sheet surfaces that are non-reflective and glare-free in four construction series (Metallic Premium, Eco Premium, Deluxe Standard, Eco Regular), Magnetic boards with resin coated steel green surfaces that accept magnets, and Ceramic boards with porcelain enamel steel green surfaces for maximum durability.",
    seoTitle: "Chalk Boards — Magnetic, Non-Magnetic & Ceramic HPL Chalk Boards",
    seoDescription:
      "Plusmark chalk boards: magnetic, non-magnetic and ceramic chalk boards with Hardcore Chalk Grade HPL Sheet and porcelain enamel surfaces for schools, colleges and classrooms.",
    coverProduct: "metallic-premium-chalk-board",
    subcategories: [
      {
        slug: "chalk-boards-non-magnetic",
        name: "Non-Magnetic Chalk Boards",
        summary: "Hardcore Chalk Grade HPL Sheet with enhanced scratch resistance — non-reflective and glare-free.",
        coverProduct: "metallic-premium-chalk-board",
      },
      {
        slug: "chalk-boards-magnetic",
        name: "Magnetic Chalk Boards",
        summary: "Resin coated steel magnetic chalk boards with green surfaces that accept magnets.",
        coverProduct: "metallic-premium-magnetic-chalk-board",
      },
      {
        slug: "chalk-boards-ceramic",
        name: "Ceramic Chalk Boards",
        summary: "Ceramic steel / porcelain enamel steel magnetic green surfaces for very long product life.",
        coverProduct: "metallic-premium-ceramic-chalk-board",
      },
    ],
  },
  {
    slug: "double-sided-boards",
    name: "Double-Sided Boards",
    summary: "2-in-1 writing surfaces — write with marker on one side and chalk on the other — in premium aluminium frames.",
    intro:
      "Plusmark Double-Sided Boards feature two writing surfaces in one frame: a white board on the front for marker writing and a chalk board on the back for chalk writing. The non-magnetic, easy-to-clean surfaces sit in premium aluminium anodised frames with ABS dual-tone edges, offering quick wall-mount installation that allows horizontal or vertical hanging.",
    seoTitle: "Double-Sided Boards — 2-in-1 White Board & Chalk Board",
    seoDescription:
      "Plusmark Double-Sided Boards with marker writing on one side and chalk writing on the other. Premium aluminium frames, non-magnetic surfaces for offices, classrooms and homes.",
    coverProduct: "eco-premium-both-side-board",
  },
  {
    slug: "notice-boards",
    name: "Notice Boards",
    summary: "Pin-up notice boards with Blazer Cloth, Velvet Cloth, Cork and Fabric surfaces — in Metallic Premium, Eco Premium, Deluxe Standard and Eco Regular series.",
    intro:
      "Plusmark notice boards cover all pin-up surface types from the catalog — Blazer Cloth and Velvet Cloth boards in four frame series (Metallic Premium, Eco Premium, Deluxe Standard and Eco Regular), high-quality natural Cork Notice Boards, Fabric Notice Boards in the customer's preferred colour, and Combination Boards that pair a dry wipe white board surface with a fabric pin-up surface in a single frame.",
    seoTitle: "Notice Boards — Blazer Cloth, Velvet Cloth, Cork, Fabric & Combination Boards",
    seoDescription:
      "Plusmark notice boards: Blazer Cloth, Velvet Cloth, Cork, Fabric and Combination boards in Metallic Premium, Eco Premium, Deluxe Standard and Eco Regular frames for schools, colleges, offices and institutions.",
    coverProduct: "metallic-premium-notice-board",
  },
  {
    slug: "specialty-boards",
    name: "Specialty Display Boards",
    summary: "Acrylic folder display boards for organised display of charts, reports, SOPs and production data.",
    intro:
      "Specialty Display Boards for specific display needs — Acrylic Folder Display Boards give clear visibility through transparent front folders, ideal for organised display of charts, reports, SOPs and production data. Folder size and quantity made as per customer requirement in a strong aluminium frame.",
    seoTitle: "Specialty Display Boards — Acrylic Folder Display Boards",
    seoDescription:
      "Plusmark Acrylic Folder Display Boards with transparent front folders in a strong aluminium frame — folder size and quantity as per customer requirement for industrial and institutional use.",
    coverProduct: "acrylic-folder-display-board",
  },
  {
    slug: "acrylic-door-cover-notice-boards",
    name: "Acrylic Door Cover Notice Boards",
    summary: "Lockable notice boards with transparent acrylic door covers that protect notices from dust and handling.",
    intro:
      "Acrylic Door Covered (ADC) notice boards protect displayed notices behind a transparent acrylic door with a locking system, available in Deluxe 45 mm Triple Aluminium Framing (single and double door) and ECO lightweight aluminium framing.",
    seoTitle: "Acrylic Door Cover Notice Boards — Lockable ADC Notice Boards",
    seoDescription:
      "Plusmark ADC notice boards with transparent acrylic door covers, secure locking and Deluxe 45 mm Triple Aluminium Framing, in single and double door designs.",
    coverProduct: "deluxe-45mm-adc-notice-board-double-door",
  },
  {
    slug: "board-study-essentials",
    name: "Board & Study Essentials",
    summary: "Practice boards for handwriting, lockable key hanger boards and a foldable homework table.",
    intro:
      "The Board & Study Essentials collection covers the Four Line & Square Line Practice Board for handwriting improvement, the lockable Key Hanger Board and the foldable Homework Table — a student study table with a white board writing surface.",
    seoTitle: "Board & Study Essentials — Practice Boards, Key Hanger Boards & Homework Tables",
    seoDescription:
      "Plusmark Four Line & Square Line Practice Board, lockable Key Hanger Board and foldable Homework Table (student study table) with white board writing surface.",
    coverProduct: "four-line-square-line-practice-board",
  },
  {
    slug: "display-boards",
    name: "Display Boards",
    summary: "Grooved boards and black perforated boards with letter and figure sets for information display.",
    intro:
      "Display boards for hotels, reception areas, offices and public places — grooved boards in nine landscape and portrait sizes, black perforated boards with golden anodized frames, and letter and figure sets in 12, 18, 24 and 36 mm sizes.",
    seoTitle: "Display Boards — Grooved Boards, Perforated Boards & Letter Sets",
    seoDescription:
      "Plusmark grooved boards and black perforated display boards with golden anodized frame, plus letter sets of 112 and figure sets of 100 for hotels, offices and receptions.",
    coverProduct: "perforated-board",
  },
  {
    slug: "board-stands",
    name: "Board Stands & Storage",
    summary: "Board stands, newspaper and magazine stands, file racks, first aid boxes and letter boxes.",
    intro:
      "Plusmark manufactures all types of board stands, alongside newspaper stands, magazine stands, file racks, first aid boxes and letter boxes. Contact Plusmark for specifications of each model.",
    seoTitle: "Board Stands, Newspaper Stands & Magazine Stands",
    seoDescription:
      "Plusmark three leg, four leg, revolving, zig zag and telescopic board stands, newspaper and magazine stands, file racks, first aid boxes and letter boxes.",
    coverProduct: "three-leg-stand",
  },
  {
    slug: "clipboards",
    name: "Clipboards",
    summary: "MDF and acrylic clipboards with Chrome Electroplated Clips and Dual-Side Cap Rivets.",
    intro:
      "Plusmark clipboards combine Chrome Electroplated Clips with a rust-resistant finish and Dual-Side Cap Rivets, on Pre-Lam, Graphic and Laminate MDF bases or Crystal Clear, Heavy-Duty Clear Acrylic and Crystal Colour acrylic bases.",
    seoTitle: "Clipboards — MDF & Acrylic Clipboards",
    seoDescription:
      "Plusmark clipboards with Chrome Electroplated Clips and Dual-Side Cap Rivets on Pre-Lam, Graphic and Laminate MDF bases and crystal clear acrylic bases.",
    coverProduct: "laminate-mdf-base-clipboard",
  },
  {
    slug: "school-benches",
    name: "School Benches",
    summary: "School bench models PDS-SB 801 to PDS-SB 815, supporting educational infrastructure development.",
    intro:
      "Plusmark is expanding into the manufacturing of School Benches, supporting educational infrastructure development. The catalog lists fifteen models, PDS-SB 801 to PDS-SB 815. Contact Plusmark for dimensions and specifications of each model.",
    seoTitle: "School Benches — PDS-SB 801 to 815",
    seoDescription:
      "Plusmark school bench models PDS-SB 801 to PDS-SB 815 for schools and educational institutions. Enquire for model specifications.",
    coverProduct: "pds-sb-807",
  },
  {
    slug: "schedule-boards",
    name: "Schedule Boards",
    summary: "Dry wipe schedule boards available in any design and any size.",
    intro:
      "The Dry Wipe Schedule Board is available in any design and any size. Share the quantity, sizes and a sketch of the board (CorelDRAW, Photoshop or Word file) before ordering.",
    seoTitle: "Dry Wipe Schedule Boards — Any Design, Any Size",
    seoDescription:
      "Custom Plusmark dry wipe schedule boards available in any design and any size. Share quantity, sizes and a sketch in CorelDRAW, Photoshop or Word format.",
    coverProduct: "dry-wipe-schedule-board",
  },
];

// Create a flattened map of all categories and subcategories
const flattenedCategories = categories.flatMap((c) => {
  const result: Category[] = [c];
  if (c.subcategories) {
    // Convert subcategories to full Category objects for the map
    c.subcategories.forEach((sub) => {
      result.push({
        slug: sub.slug,
        name: sub.name,
        summary: sub.summary,
        intro: sub.summary, // Use summary as intro for subcategories
        seoTitle: `${sub.name} | ${c.name}`,
        seoDescription: sub.summary,
        coverProduct: sub.coverProduct,
      });
    });
  }
  return result;
});

export const categoryMap = Object.fromEntries(
  flattenedCategories.map((c) => [c.slug, c]),
) as Record<CategorySlug, Category>;

export function getCategory(slug: string): Category | undefined {
  return flattenedCategories.find((c) => c.slug === slug);
}
