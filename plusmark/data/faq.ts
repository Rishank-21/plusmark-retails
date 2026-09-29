/**
 * Frequently asked questions. Answers only restate information that is already in the catalog
 * data (company.ts, products.ts, custom.ts, sizes.ts). Anything the catalog does not state —
 * prices, lead times, minimum order quantities, warranty duration — is deferred to the sales team.
 */
export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqGroup {
  id: string;
  title: string;
  items: FaqItem[];
}

export const faqGroups: FaqGroup[] = [
  {
    id: "products",
    title: "Products & Materials",
    items: [
      {
        q: "Which products does Plusmark manufacture?",
        a: "Plusmark manufactures white boards, chalk boards, notice boards, ceramic boards, magnetic boards, school benches and all types of board stands, along with clipboards, exam pads and specialty display boards.",
      },
      {
        q: "What is the difference between the Metallic Premium, Eco Premium, Deluxe Standard and Eco Regular series?",
        a: "Metallic Premium boards use heavy-duty aluminium anodized framing with Signature Dual-Tone Corners and are built for intensive daily institutional use. Eco Premium boards use premium-grade materials with ABS Dual-Tone Corners for regular institutional use. Deluxe Standard boards have Electroplated Chrome Corners and are dependable for everyday use. Eco Regular boards have a lightweight frame with standard plastic corners for light use and budget-friendly applications.",
      },
      {
        q: "What is the difference between an HPL white board and a melamine white board?",
        a: "Metallic Premium and Eco Premium white boards use a High Gloss Marker Grade HPL Sheet — an ultra-smooth, durable surface for effortless writing and easy erasing. Deluxe Standard and Eco Regular white boards use a High Gloss Melamine Writing Surface, which is smooth, easy to clean and suited to regular or lighter use.",
      },
      {
        q: "Are Plusmark chalk boards glare-free?",
        a: "Yes. Plusmark chalk boards use Chalk Grade HPL Sheet surfaces that are non-reflective and glare-free, with clear visibility from all angles. The Metallic Premium and Eco Premium series use Hardcore Chalk Grade HPL Sheet with enhanced scratch resistance.",
      },
      {
        q: "Should I choose a magnetic board or a ceramic board?",
        a: "Resin Coated Steel Magnetic Boards accept magnets, charts and holders and come in white (marker) and green (chalk) surfaces. Ceramic Steel Magnetic Boards use a ceramic steel / porcelain enamel steel surface that is hard and non-porous — suitable for continuous writing and frequent cleaning, for a very long product life.",
      },
      {
        q: "What surfaces are available for notice boards?",
        a: "Notice boards are available with 2 mm Blazer Cloth or Super Fine Velvet Cloth over soft, pin-friendly cores, in multiple colours. Cork and combination (white board + fabric) boards are also available.",
      },
    ],
  },
  {
    id: "sizes",
    title: "Sizes & Customisation",
    items: [
      {
        q: "Which board sizes are available?",
        a: "Standard sizes depend on the series. Metallic Premium boards are shown in 2 × 3, 2 × 4 and 3 × 4 ft. Eco Premium boards range from 1 × 1 ft up to 3 × 4 ft. Each product page lists the sizes currently shown for that board; for other sizes please send an enquiry.",
      },
      {
        q: "Can I order a custom design or layout?",
        a: "Yes. Dry Wipe Schedule Boards can be made in any design and any size to your sketch; fabric notice boards are available in your preferred fabric colour and layout; practice boards can have line marking as per school requirement; and acrylic folder display boards are made with folder size and quantity as required.",
      },
      {
        q: "What do I need to share for a custom schedule board?",
        a: "Please share the quantity of boards, the sizes and a sketch of the board. Sketches can be sent in CorelDRAW, Photoshop or Word format. If Plusmark prepares the design, additional charges apply.",
      },
    ],
  },
  {
    id: "orders",
    title: "Orders, Supply & Warranty",
    items: [
      {
        q: "Does Plusmark supply across India?",
        a: "Yes. Plusmark operates across India and supplies products nationwide to schools, colleges, coaching centres, offices, dealers, distributors, factories and government institutions.",
      },
      {
        q: "Is Plusmark approved on the GEM Portal?",
        a: "Yes. Plusmark is a GEM Portal approved brand, authorized for school and government supplies.",
      },
      {
        q: "Do you work with dealers and distributors?",
        a: "Yes. Dealers and distributors are among Plusmark's long-term clients. Send an enquiry with your city and the product range you are interested in and the team will get in touch.",
      },
      {
        q: "Do Plusmark products come with a warranty?",
        a: "Plusmark provides warranty on all products it manufactures. Please confirm the warranty terms for your order with our authorized distributor or marketing executive.",
      },
      {
        q: "How do I get a price quotation?",
        a: "Use the enquiry form or WhatsApp us with the product, size and quantity you need. Prices depend on series, size and quantity, so the team shares a quotation for your exact requirement.",
      },
      {
        q: "Where is Plusmark located?",
        a: "Plusmark Display System is located at Narolgam, Ahmedabad, Gujarat. The full address and map are on the Contact page.",
      },
    ],
  },
];

/** A short list for the home page preview. */
export const featuredFaqs: FaqItem[] = [
  faqGroups[0].items[1],
  faqGroups[0].items[4],
  faqGroups[1].items[1],
  faqGroups[2].items[1],
  faqGroups[2].items[3],
  faqGroups[2].items[4],
];

export const allFaqs: FaqItem[] = faqGroups.flatMap((g) => g.items);
