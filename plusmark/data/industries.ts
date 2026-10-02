/**
 * Industries served — from the catalog "Our Happy Clients" list.
 * Product links are chosen from the catalog "Usage" / "Application" statements.
 */
export interface Industry {
  slug: string;
  name: string;
  summary: string;
  /** Why these products — each line references a catalog usage statement. */
  products: string[];
  icon: "school" | "graduation" | "truck" | "factory" | "presentation" | "landmark";
  /** Real scene photo for the card (cropped from the A+ banners by scripts/industry-scenes.mjs). */
  image: string;
  imageAlt: string;
}

const scene = (slug: string) => `/images/industries/${slug}.webp`;

export const industries: Industry[] = [
  {
    slug: "schools",
    name: "Schools",
    icon: "school",
    image: scene("schools"),
    imageAlt: "Teacher writing on a Plusmark chalk board in a school classroom",
    summary:
      "Chalk boards, white boards and notice boards for classrooms, practice boards for primary and early learning classes, and school benches.",
    products: [
      "metallic-premium-chalk-board",
      "eco-premium-white-board",
      "four-line-square-line-practice-board",
      "pds-sb-807",
    ],
  },
  {
    slug: "colleges-universities",
    name: "Colleges & Universities",
    icon: "graduation",
    image: scene("colleges-universities"),
    imageAlt: "Lecturer explaining equations on a Plusmark white board while students raise their hands",
    summary:
      "Boards built for intensive daily institutional use, including ceramic steel surfaces designed for very long product life.",
    products: [
      "metallic-premium-chalk-board",
      "metallic-premium-notice-board",
      "metallic-premium-ceramic-board",
      "metallic-premium-white-board",
    ],
  },
  {
    slug: "dealers-distributors",
    name: "Dealer & Distributors",
    icon: "truck",
    image: scene("dealers-distributors"),
    imageAlt: "Sales team planning on a Plusmark magnetic white board in an office meeting room",
    summary:
      "A complete manufacturing range — white, chalk, notice, ceramic and magnetic boards, school benches and all types of board stands — supplied Pan India.",
    products: [
      "deluxe-standard-white-board",
      "eco-regular-chalk-board",
      "three-leg-stand",
      "laminate-mdf-base-clipboard",
    ],
  },
  {
    slug: "factories-industrial-units",
    name: "Factories & Industrial Units",
    icon: "factory",
    image: scene("factories-industrial-units"),
    imageAlt: "Team reviewing a strategy plan on a Plusmark chalk board at the workplace",
    summary:
      "Acrylic folder display boards for charts, reports, SOPs and production data, and lockable key hanger boards for companies and workshops.",
    products: ["acrylic-folder-display-board", "key-hanger-board", "eco-adc-notice-board-single-door"],
  },
  {
    slug: "training-coaching-centers",
    name: "Training & Coaching Centers",
    icon: "presentation",
    image: scene("training-coaching-centers"),
    imageAlt: "Trainer presenting on a Plusmark white board to a group of trainees",
    summary:
      "Boards suited to coaching centres, training rooms and tuition classes across Deluxe Standard, Eco Premium and Eco Regular series.",
    products: [
      "deluxe-standard-white-board",
      "eco-premium-chalk-board",
      "deluxe-standard-notice-board",
      "eco-regular-white-board",
    ],
  },
  {
    slug: "government-private-institutions",
    name: "Government & Private Institutions",
    icon: "landmark",
    image: scene("government-private-institutions"),
    imageAlt: "Plusmark notice board with pinned notices on an office wall",
    summary:
      "GEM Portal approved supply of notice boards and acrylic door cover notice boards for government offices, institutions, hospitals and public areas.",
    products: [
      "metallic-premium-notice-board",
      "deluxe-45mm-adc-notice-board-double-door",
      "deluxe-45mm-adc-notice-board-single-door",
    ],
  },
];
