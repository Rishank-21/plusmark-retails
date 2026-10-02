/**
 * Organizations Plusmark has supplied, shown in this order in the home page "Trusted by" logo strip
 * (components/sections/TrustedBySection.tsx).
 *
 * Logos are the organizations' own published artwork (official websites / their Wikipedia
 * infobox files), only trimmed to their visible edges and saved as PNG in /public/images/clients;
 * never redrawn, recoloured or cropped. To replace one with a file the organization supplies:
 *   1. Save it over /public/images/clients/<id>.png (or add an .svg / .webp next to it).
 *   2. Update `logo` below with the file's intrinsic size (for an SVG, its viewBox).
 * The strip scales every logo to the same height and keeps its proportions. An entry without a
 * `logo` shows a neutral sector icon next to the name instead.
 */

export type ClientSector = "school" | "university" | "government" | "business";

export interface ClientLogo {
  /** Path under /public, e.g. "/images/clients/delhi-public-school.png". */
  src: string;
  /** Intrinsic size of the file in px (for an SVG, its viewBox); only the ratio matters. */
  width: number;
  height: number;
}

export interface TrustedClient {
  id: string;
  name: string;
  sector: ClientSector;
  /** Official logo. Leave unset until the organization's own file is in the project. */
  logo?: ClientLogo;
}

const logo = (id: string, width: number, height: number): ClientLogo => ({
  src: `/images/clients/${id}.png`,
  width,
  height,
});

export const trustedClients: TrustedClient[] = [
  // The Delhi Public School Society emblem (dpsfamily.org), shared by every DPS school.
  { id: "delhi-public-school", name: "Delhi Public School", sector: "school", logo: logo("delhi-public-school", 187, 240) },
  // Kendriya Vidyalaya Sangathan.
  { id: "kendriya-vidyalaya", name: "Kendriya Vidyalaya", sector: "school", logo: logo("kendriya-vidyalaya", 299, 240) },
  // Navodaya Vidyalaya Samiti, which runs the JNVs.
  { id: "jawahar-navodaya-vidyalaya", name: "Jawahar Navodaya Vidyalaya", sector: "school", logo: logo("jawahar-navodaya-vidyalaya", 178, 240) },
  { id: "iit-kharagpur", name: "IIT Kharagpur", sector: "university", logo: logo("iit-kharagpur", 215, 240) },
  { id: "gujarat-university", name: "Gujarat University", sector: "university", logo: logo("gujarat-university", 240, 240) },
  // Government e-Marketplace.
  { id: "gem", name: "GEM — All Departments", sector: "government", logo: logo("gem", 268, 173) },
  // The Tata Sky logo used until the 2022 rename to Tata Play.
  { id: "tata-sky", name: "Tata Sky", sector: "business", logo: logo("tata-sky", 915, 240) },
  { id: "amul-dairy", name: "Amul Dairy", sector: "business", logo: logo("amul-dairy", 385, 240) },
  // Wordmark from banasdairy.coop.
  { id: "banas-dairy", name: "Banas Dairy", sector: "business", logo: logo("banas-dairy", 149, 94) },
  // Maahi Milk Producer Company (maahimilk.com).
  { id: "mahi-dairy", name: "Mahi Dairy", sector: "business", logo: logo("mahi-dairy", 166, 167) },
];
