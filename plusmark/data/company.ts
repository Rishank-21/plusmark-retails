/** Company information — verbatim or closely paraphrased from the catalog "About Us" page. */

export const company = {
  name: "Plusmark Display System",
  legalName: "Plusmark Display System",
  shortName: "Plusmark",
  tagline: "Quality Jo Pehchaan Ban Jaaye",
  subline: "Best Quality. Best Rate.",
  catalogTitle: "Plusmark Writing & Display System",
  established: 2015,
  website: "https://www.plusmarkboards.com",
  websiteLabel: "www.plusmarkboards.com",
  about: [
    "Established in 2015, Plusmark Brands is a trusted and reputed Indian manufacturing brand specializing in high-quality educational and institutional products. Our mission is to deliver durable, high-performance products that combine superior quality with the best market rates.",
    "With a strong focus on quality, reliability, and customer satisfaction, Plusmark Brands has earned long-term trust from schools, institutions, and government organizations across India. We are recognized as a dependable manufacturing partner known for consistent quality and timely delivery.",
  ],
  manufacturingRange: [
    "White Boards",
    "Chalk Boards",
    "Notice Boards",
    "Ceramic Boards",
    "Magnetic Boards",
    "School Benches",
    "All Types of Board Stands",
  ],
  expansion:
    "In addition to our core product range, we have successfully launched a complete range of Exam Pads and are expanding into the manufacturing of School Benches, supporting educational infrastructure development.",
  panIndia:
    "Plusmark Brands operates across India and supplies products nationwide. We are a GEM Portal approved brand, authorized for school and government supplies, reflecting our commitment to quality standards, regulatory compliance, and transparent business practices.",
  quality:
    "Quality is the foundation of everything we do. Each product is manufactured using premium-grade materials, modern production techniques, and strict quality control processes, ensuring long-lasting performance with a superior finish at competitive prices.",
  warranty:
    "We provide warranty on all products manufactured by us. Customers are requested to confirm warranty terms with our authorized distributor or marketing executive.",
  clients: [
    "Schools, Colleges & Universities",
    "Dealer & Distributors",
    "Training & Coaching Centers",
    "Government & Private Institutions",
    "Factories & Industrial Units",
  ],
} as const;

/** Registered business location — as listed on the Google Maps business profile. */
export const location = {
  street: "Survey No. 181/1, Nr. Radha Krishna Packaging, Venus Denim Lane, Shahwadi Gam, Narolgam",
  city: "Ahmedabad",
  region: "Gujarat",
  postalCode: "382405",
  country: "IN",
  plusCode: "XH7H+P3 Ahmedabad, Gujarat",
  /** Search query used for the embedded map and the directions link. */
  mapsQuery: "Plusmark Display System, Narolgam, Ahmedabad, Gujarat 382405",
} as const;

export const fullAddress = `${location.street}, ${location.city}, ${location.region} ${location.postalCode}`;
export const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(location.mapsQuery)}&output=embed`;
export const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.mapsQuery)}`;

/** Owner's number from the Google Maps profile (099139 67888). */
const OWNER_PHONE = "+919913967888";

/** Contact channels. Environment variables override the defaults. */
export const contactChannels = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || OWNER_PHONE,
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || OWNER_PHONE,
  /** Human-readable form for display. */
  phoneLabel: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+91 99139 67888",
};

/** wa.me link with an optional prefilled message. */
export function whatsappHref(message?: string) {
  const num = contactChannels.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${num}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}
