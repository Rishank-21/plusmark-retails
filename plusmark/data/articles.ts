/**
 * Blog articles. Every factual claim restates what the catalog already documents (categories.ts,
 * quality.ts, sizes.ts, custom.ts, company.ts) — prices, lead times, minimum order quantities and
 * warranty durations are deliberately left to the sales team, same rule as data/faq.ts.
 */

export interface ArticleSection {
  heading: string;
  /** Paragraph copy, in reading order. */
  body: string[];
  bullets?: string[];
  /** Optional two/three-column comparison table rendered as real markup, not prose. */
  table?: { head: string[]; rows: string[][] };
}

export interface Article {
  slug: string;
  /** Page H1 and the base for the document title. */
  title: string;
  seoTitle: string;
  /** Meta description — kept under 160 characters so Google does not truncate mid-word. */
  description: string;
  /** Card dek on the blog index. */
  excerpt: string;
  topic: string;
  published: string;
  updated: string;
  readMinutes: number;
  /** Product photo used as the article cover and social card. */
  coverProduct: string;
  intro: string[];
  sections: ArticleSection[];
  /** Product or category slugs linked from the article. */
  related: string[];
  faq?: { q: string; a: string }[];
}

export const articles: Article[] = [
  {
    slug: "magnetic-vs-non-magnetic-white-board",
    title: "Magnetic vs Non-Magnetic White Boards: Which One Does Your Room Actually Need?",
    seoTitle: "Magnetic vs Non-Magnetic White Boards",
    description:
      "Magnetic white boards have a resin coated steel surface that holds charts and holders. Compare magnetic and non-magnetic boards and pick the right one.",
    excerpt:
      "The difference is not a sticker on the box — it is the surface itself. Here is how to tell which one your classroom, cabin or planning wall needs.",
    topic: "Choosing",
    published: "2026-09-12",
    updated: "2026-10-08",
    readMinutes: 5,
    coverProduct: "metallic-premium-magnetic-board",
    intro: [
      "Most buyers choose board size first and surface second. For magnetic boards the order matters the other way round, because magnetism is built into the surface at manufacture and cannot be added later.",
      "A Plusmark magnetic board uses a resin coated steel surface. The steel underneath is what accepts a magnet; the resin coating on top is what takes marker ink and wipes clean. A non-magnetic board skips the steel and uses a High Gloss Marker Grade HPL sheet instead, which writes and erases just as well but will not hold anything up.",
    ],
    sections: [
      {
        heading: "What magnets on a board are actually for",
        body: [
          "Magnets turn a board from a writing surface into a display surface. The rooms that get the most out of that are the ones where information changes every day and someone has to pin it up without damaging the wall or the board.",
        ],
        bullets: [
          "Planning walls in operations and production teams, where charts, shift rosters and SOP sheets move around weekly",
          "Coaching centres and tuition classrooms that put up answer keys, maps and revision sheets beside the writing area",
          "Offices and cabins where a single board carries both today's notes and a standing timetable",
          "Laboratories and staff rooms that display notices next to working notes",
        ],
      },
      {
        heading: "Where a non-magnetic board is the better buy",
        body: [
          "If nothing ever gets pinned or stuck to the board, the magnetic surface buys you nothing you will use. Non-magnetic Marker Grade HPL boards write and erase the same way, and they are the right call for rooms that are used purely for writing.",
          "Lecture halls, seminar rooms, interview rooms and classroom walls where the teacher writes and wipes and nothing else lives on the board are typical non-magnetic installations. The budget you save goes into size — a larger non-magnetic board usually serves a lecture room better than a smaller magnetic one.",
        ],
      },
      {
        heading: "How to tell the two apart in a finished board",
        body: [
          "Check the product category rather than the frame or the corners. Plusmark lists these as separate types so you do not have to guess from the photo.",
        ],
        table: {
          head: ["", "Magnetic white boards", "Non-magnetic white boards"],
          rows: [
            ["Surface", "Resin coated steel", "High Gloss Marker Grade HPL"],
            ["Holds magnets", "Yes", "No"],
            ["Marker performance", "Writes and wipes clean", "Writes and wipes clean"],
            ["Typical rooms", "Planning walls, offices, coaching", "Classrooms, lecture halls, seminar rooms"],
            ["Available series", "Metallic Premium, Deluxe Standard, Eco Regular", "Metallic Premium, Eco Premium, Deluxe Standard, Eco Regular"],
          ],
        },
      },
      {
        heading: "Magnetic is also available in chalk",
        body: [
          "Resin coated steel comes in green as well as white, so a chalk-writing board can hold magnets too. Schools that still teach with chalk but want charts on the board use magnetic chalk boards — listed separately from the non-magnetic chalk range.",
        ],
      },
      {
        heading: "Before you order",
        body: [
          "Decide what has to live on the board besides writing. If the answer is charts, rosters or holders, order magnetic. If the answer is nothing, order non-magnetic and spend the difference on size.",
          "Every Plusmark magnetic and non-magnetic white board is made in standard sizes and in custom sizes. Send the room dimensions and the quantity through the enquiry form and the team will confirm what is available in that series.",
        ],
      },
    ],
    related: ["white-boards-magnetic", "white-boards-non-magnetic", "metallic-premium-magnetic-board", "white-boards"],
    faq: [
      {
        q: "Can a non-magnetic white board be made magnetic later?",
        a: "No. Magnetism comes from the steel layer inside a resin coated steel surface, which is fixed at manufacture. A board ordered non-magnetic stays non-magnetic, so decide before you order.",
      },
      {
        q: "Do magnetic boards write as smoothly as non-magnetic ones?",
        a: "Both are made for marker use and wipe clean. Plusmark magnetic boards use resin coated steel and non-magnetic boards use High Gloss Marker Grade HPL sheet, and both are offered across the institutional series.",
      },
    ],
  },
  {
    slug: "white-board-surface-guide",
    title: "Six Board Surfaces Explained, and What Each One Is Really For",
    seoTitle: "White Board Surfaces: HPL, Ceramic, Melamine",
    description:
      "Marker Grade HPL, Chalk Grade HPL, resin coated steel, ceramic steel, melamine and blazer cloth — what each board surface is built for.",
    excerpt:
      "Surface decides how a board ages. A quick field guide to the six writing and display surfaces Plusmark manufactures, ordered by how hard the room works.",
    topic: "Materials",
    published: "2026-09-20",
    updated: "2026-10-14",
    readMinutes: 6,
    coverProduct: "metallic-premium-white-board",
    intro: [
      "Two boards of the same size, in the same frame, can behave completely differently for five years because the skin is different. Surface is the part that gets written on, erased, knocked and cleaned, and it is the part that finally decides when a board is replaced.",
      "Plusmark builds six surfaces. Here is what each one is and which room it belongs in.",
    ],
    sections: [
      {
        heading: "Marker Grade HPL — the everyday classroom surface",
        body: [
          "High Gloss Marker Grade HPL sheet is the standard white board surface: ultra-smooth, high-gloss, made for effortless writing and easy erasing, and resistant to wear. This is what most schools, colleges and offices should order when the board is used for marker writing all day.",
          "It is the surface behind the white boards in the Metallic Premium, Eco Premium, Deluxe Standard and Eco Regular series, so the same writing behaviour comes in four build weights.",
        ],
      },
      {
        heading: "Chalk Grade HPL — when the room still uses chalk",
        body: [
          "Hardcore Chalk Grade HPL is non-reflective and glare-free, so a student in the back row can read it from an angle, and the hardcore grade adds scratch resistance because chalk is abrasive in a way marker ink is not.",
          "Schools and colleges that teach with chalk choose this surface. It is available magnetic and non-magnetic, in green and white board formats.",
        ],
      },
      {
        heading: "Resin coated steel — the magnetic surface",
        body: [
          "A steel core with a resin coating, supplied in white for marker and green for chalk. Writing performance aside, its actual job is accepting magnets: charts, rosters, diagrams and holders stick to it.",
          "Planning walls, offices, labs and institutions that display as much as they write are the usual home for it.",
        ],
      },
      {
        heading: "Ceramic steel — for rooms that never stop",
        body: [
          "Ceramic boards use a hard, non-porous porcelain enamel steel surface. It is built for continuous writing and frequent cleaning, which is what long service life actually depends on in a high-traffic institution — not how carefully people use it, but how often it gets wiped.",
          "Because the surface tolerates heavy cleaning cycles, ceramic is what to specify for large classrooms, lecture halls and training centres where a board is used and erased all day, every day. It is offered in the Metallic Premium and Deluxe Standard series, in white and chalk versions.",
        ],
      },
      {
        heading: "High Gloss Melamine — the budget-weight surface",
        body: [
          "Melamine is the surface on Eco Regular boards and on the face of some double-sided boards. It writes and erases well for light and budget applications, and it is the honest choice when a board is used occasionally rather than continuously.",
          "Put it in cabins, small tuition rooms, back-up corridors and any room where the board is written on now and then. Do not put it in a lecture hall that runs six periods a day.",
        ],
      },
      {
        heading: "Cloth surfaces — for display, not writing",
        body: [
          "2 mm Blazer Cloth and Super Fine Velvet Cloth, stretched over soft pin-friendly cores in several colours, are notice board surfaces. Nothing is written on them; notices, circulars and charts are pinned into them.",
          "They are the right surface for reception areas, staff rooms, department corridors and examination cells, and they come in frame weights from Eco Regular up to Metallic Premium.",
        ],
      },
      {
        heading: "Choosing in one pass",
        body: [
          "Match the surface to how often the board is used, not to how the room looks. Marker Grade HPL for daily marker work, Chalk Grade HPL where chalk is still used, resin coated steel where things must stick, ceramic where cleaning cycles are constant, melamine where use is occasional, cloth where nothing is written.",
        ],
      },
    ],
    related: ["white-boards-ceramic", "metallic-premium-ceramic-board", "eco-regular-white-board", "white-boards"],
    faq: [
      {
        q: "Which surface lasts the longest?",
        a: "Ceramic steel — porcelain enamel — is the hardest and non-porous surface in the range and is built for continuous writing and frequent cleaning, which is why it is specified for high-traffic institutions.",
      },
      {
        q: "Is melamine a bad choice?",
        a: "No, it is a light-use choice. High Gloss Melamine suits budget applications and rooms where the board is written on occasionally. Problems start when a melamine board is placed in a room that uses it all day.",
      },
      {
        q: "Can a board surface be magnetic and chalk-grade at the same time?",
        a: "Yes. Resin coated steel is made in green as well as white, so magnetic chalk boards exist and are listed separately from non-magnetic chalk boards.",
      },
    ],
  },
  {
    slug: "white-board-size-guide",
    title: "What Size Board Does This Room Need? A Practical Sizing Guide",
    seoTitle: "White Board Sizes: Which Size for Which Room",
    description:
      "Standard board sizes from 1 × 1 ft to 8 × 4 ft, mapped to classrooms, boardrooms, lecture halls and auditoriums, plus how custom sizes work.",
    excerpt:
      "Standard sizes run from 1 × 1 ft to 8 × 4 ft. Use this room-by-room table to pick one, and see what has to be decided before a custom size can be quoted.",
    topic: "Sizing",
    published: "2026-09-28",
    updated: "2026-10-16",
    readMinutes: 4,
    coverProduct: "eco-premium-white-board",
    intro: [
      "Size is the one board decision that cannot be undone after installation. Too small and the back row stops reading; too large and the board dominates the wall, costs more to ship and wastes half its surface.",
      "Plusmark manufactures standard sizes from 1 × 1 ft up to 8 × 4 ft, with anything larger made to order. The useful question is not the biggest size you can buy but the smallest size the room can read from.",
    ],
    sections: [
      {
        heading: "Standard sizes, matched to rooms",
        body: [
          "These are the size bands Plusmark supplies and the rooms they are specified for.",
        ],
        table: {
          head: ["Size", "Where it belongs"],
          rows: [
            ["1 × 1 – 1.5 × 2 ft", "Desks, cabins, reception counters, small notices"],
            ["2 × 2 – 2 × 3 ft", "Offices, staff rooms, tuition classes"],
            ["2 × 4 – 3 × 4 ft", "Meeting rooms, small classrooms, corridors"],
            ["4 × 4 – 5 × 4 ft", "Classrooms, coaching centres, boardrooms"],
            ["6 × 4 – 8 × 4 ft", "Large classrooms, lecture halls, training halls, auditoriums"],
            ["Custom", "Any larger size or special layout, made to your requirement"],
          ],
        },
      },
      {
        heading: "How many boards, not just how big",
        body: [
          "A lecture hall that runs six periods a day rarely wants one 8 × 4 ft board. Two 4 × 4 ft boards on either side of the podium let a lecturer keep a working area and a written area separate, and they survive a wall or transport constraint better than one oversized panel.",
          "The same logic applies to coaching centres that leave worked answers on the board while starting a new question. Plan for board count before you push for maximum size.",
        ],
      },
      {
        heading: "Sizes actually stocked per series",
        body: [
          "Within a series, sizes are not identical across every product. Metallic Premium white, chalk, magnetic, ceramic and notice boards are supplied in 2 × 3, 2 × 4 and 3 × 4 ft. Eco Premium white boards open much smaller — from 1 × 1 ft, through 1 × 1.5, 1 × 2, 1.5 × 2, 1.5 × 3, 2 × 2, 2 × 3, 2 × 4 and 3 × 4 ft — because the range covers cabin and notice use as well as classrooms.",
          "Check the size options on the product page you are ordering. If the size you need is not listed, it goes into the custom route below.",
        ],
      },
      {
        heading: "How a custom size gets moving",
        body: [
          "Larger sizes and special layouts are made to requirement. Before a custom board is quoted, three things have to be settled, and the same three apply to schedule boards that are made to your design.",
          "Quantity of boards; the sizes you want; and a sketch of the layout as you want it. For printed or divided boards — schedule boards, practice board line layouts — that sketch is supplied in CorelDRAW, Photoshop or Word.",
          "When Plusmark creates the design rather than receiving one, additional charges apply. Sending a usable sketch up front keeps the order moving.",
        ],
      },
    ],
    related: ["board-stands", "eco-premium-white-board", "metallic-premium-white-board", "double-sided-boards", "schedule-boards", "board-study-essentials"],
    faq: [
      {
        q: "What is the largest board size Plusmark supplies?",
        a: "Standard sizes go up to 8 × 4 ft. Anything larger is made as a custom board to your requirement, once quantity, size and a layout sketch are provided.",
      },
      {
        q: "Does every product come in every size?",
        a: "No. Sizes differ by series and product, so the size options listed on each product page are the ones supplied for that model. Sizes not listed fall into the custom route.",
      },
    ],
  },
  {
    slug: "board-series-explained",
    title: "Metallic Premium, Eco Premium, Deluxe Standard or Eco Regular: The Series Difference",
    seoTitle: "Board Series Explained: Premium vs Deluxe vs Eco",
    description:
      "Plusmark boards come in four construction series. Compare frame weight, corners and intended workload to choose the right series for each room.",
    excerpt:
      "Four series, distinguished by frame, corners and surface — not by brand names. Here is which construction each room actually justifies.",
    topic: "Materials",
    published: "2026-10-04",
    updated: "2026-10-18",
    readMinutes: 5,
    coverProduct: "eco-premium-both-side-board",
    intro: [
      "Every Plusmark board — white, chalk or notice — is built in one of four construction series. The series decides how heavy the frame is, what finishes the corners, and how much daily use the board is meant to take.",
      "Start with how often the board will be used. A classroom board written on all day needs a heavier frame and a harder surface than one in an office cabin.",
    ],
    sections: [
      {
        heading: "Metallic Premium — intensive institutional use",
        body: [
          "The heaviest build: heavy-duty aluminium framing with an aluminium anodized frame, Signature Dual-Tone Corners, and premium-grade materials throughout, including rigid core construction on chalk boards. This is the series specified for classrooms, boardrooms and institutions where the board is used every day and by many hands.",
          "It also carries the widest surface choice — marker, chalk, magnetic and ceramic — so a single series can match different rooms in one purchase order.",
        ],
      },
      {
        heading: "Eco Premium — regular institutional use",
        body: [
          "Premium-grade materials with an ABS Dual-Tone Corner Design. It covers the same product families as Metallic Premium, including white, chalk, both-side and notice boards, and is the sensible choice where a board sees regular but not continuous use.",
          "Many schools pick this for standard classrooms and keep Metallic Premium for the halls that run back to back.",
        ],
      },
      {
        heading: "Deluxe Standard — dependable everyday use",
        body: [
          "Electroplated Chrome Corners and a clean, professional frame. Aluminium framing is used on the magnetic and ceramic variants. This is the everyday workhorse series for offices, coaching rooms and departments where the board matters but is not under nonstop load.",
        ],
      },
      {
        heading: "Eco Regular — light use and budget applications",
        body: [
          "A lightweight frame with standard plastic corners and a High Gloss Melamine surface. It exists for a real purpose: cabins, small rooms, notice boards and budget applications where the board gets written on occasionally.",
          "Specifying this series for a lecture hall is the most common ordering mistake, because the surface and frame are matched to a workload that room does not have.",
        ],
      },
      {
        heading: "Side by side",
        body: ["Corner design and frame are the fastest way to read the difference."],
        table: {
          head: ["Series", "Corners", "Frame", "Built for"],
          rows: [
            ["Metallic Premium", "Signature Dual-Tone", "Heavy-duty aluminium, anodized", "Intensive daily institutional use"],
            ["Eco Premium", "ABS Dual-Tone", "Premium-grade construction", "Regular institutional use"],
            ["Deluxe Standard", "Electroplated Chrome", "Aluminium on magnetic and ceramic", "Dependable everyday use"],
            ["Eco Regular", "Standard plastic", "Lightweight", "Light use and budget applications"],
          ],
        },
      },
      {
        heading: "Mixing series in one order",
        body: [
          "There is no reason to buy one series for a whole building. Match series to room: Metallic Premium in lecture halls and ceramic where cleaning cycles are constant, Eco Premium in standard classrooms, Deluxe Standard in offices, Eco Regular in cabins and for notices.",
          "Cork, fabric and combination boards are also available in Metallic Premium, Eco Premium and Deluxe frame variants, so a mixed specification can still look consistent.",
        ],
      },
    ],
    related: ["metallic-premium-white-board", "eco-premium-white-board", "deluxe-standard-white-board", "eco-regular-white-board"],
    faq: [
      {
        q: "Is a higher series always better?",
        a: "Not always. Series should follow workload. A board that is written on occasionally does not need heavy-duty aluminium framing, and the money is better spent on size or on a heavier series in a room that is genuinely busy.",
      },
      {
        q: "Do all four series come in white, chalk and notice boards?",
        a: "White, chalk and notice boards are each built across the four series, so you can hold one series constant across a building or vary it room by room.",
      },
    ],
  },
  {
    slug: "chalk-board-vs-white-board",
    title: "Chalk Board or White Board in an Indian Classroom: How to Decide",
    seoTitle: "Chalk Board vs White Board for Classrooms",
    description:
      "Chalk grade and marker grade surfaces compared for glare, durability and upkeep, so a school can decide room by room instead of building-wide.",
    excerpt:
      "This is not a budget argument. Chalk and marker boards suit different teaching habits, and a school can run both without inconsistency.",
    topic: "Choosing",
    published: "2026-10-10",
    updated: "2026-10-20",
    readMinutes: 5,
    coverProduct: "metallic-premium-chalk-board",
    intro: [
      "The chalk-versus-marker question is usually framed as old against new. In practice it is about how the room is taught in and how much light falls on the wall.",
      "Plusmark manufactures both, in the same four construction series, which is the clearest sign that the right answer is per-room rather than per-school.",
    ],
    sections: [
      {
        heading: "Where chalk boards win",
        body: [
          "Chalk Grade HPL is non-reflective and glare-free, which is why it stays readable from the sides and the back of a deep room. Chalk is also faster for long, continuous writing — mathematics, derivations, board-work that runs through a whole period — because a marker board of the same size starts to look exhausted halfway through.",
          "The Hardcore Chalk Grade variant adds scratch resistance, which matters because chalk is abrasive in a way marker ink is not.",
        ],
      },
      {
        heading: "Where white boards win",
        body: [
          "Marker boards are cleaner to maintain in a room where dust is a problem — ground-floor classrooms, rooms near construction, and any space shared with young students. High Gloss Marker Grade HPL takes colour, and colour is genuinely useful for separating steps in a solution, marking corrections or diagramming.",
          "Magnetic marker boards add display: charts, answer keys and maps go up beside the working area without a separate notice board on the wall.",
        ],
      },
      {
        heading: "The decision, room by room",
        body: ["A working rule that holds up across schools."],
        table: {
          head: ["Room condition", "Choose"],
          rows: [
            ["Deep hall, back rows, side viewing angles", "Chalk board — non-reflective, glare-free"],
            ["Long continuous writing, maths and derivations", "Chalk board"],
            ["Dust-sensitive rooms, younger students", "White board"],
            ["Colour-coded teaching, diagrams, corrections", "White board"],
            ["Charts and rosters displayed alongside writing", "Magnetic white board"],
            ["Board written on and erased all day", "Ceramic surface, white or chalk"],
          ],
        },
      },
      {
        heading: "Both, in one building, without it looking mismatched",
        body: [
          "Because chalk and white boards are each produced across Metallic Premium, Eco Premium, Deluxe Standard and Eco Regular, a school can standardise on one series for frame and corner appearance while mixing surfaces by room. Chalk boards also come magnetic and non-magnetic, and in both white and green finishes.",
          "Double-sided boards go one step further — a writing surface on each face — which is how a shared room or a staff room keeps two uses of one wall.",
        ],
      },
    ],
    related: [
      "chalk-boards",
      "chalk-boards-ceramic",
      "white-boards",
      "white-boards-magnetic",
      "metallic-premium-chalk-board",
      "eco-premium-chalk-board",
      "eco-premium-white-board",
      "double-sided-boards",
      "combination-board",
    ],
    faq: [
      {
        q: "Is a chalk board cheaper than a white board?",
        a: "Not necessarily, and prices are not published for either. The two are built in the same four series, so a chalk board and a marker board of the same series and size are comparable specifications. What changes the number is the surface grade and the framing, which is why the comparison is worth running room by room.",
      },
      {
        q: "Should a dusty classroom switch from chalk to marker?",
        a: "Dust is a reason to look carefully, but it is a maintenance question before it is a surface question. Chalk dust builds up when a board is only dry-erased and never washed. If the room cannot take a weekly wash, a marker board is the practical answer; if it can, a chalk board stays perfectly serviceable.",
      },
      {
        q: "Can a school run chalk in some rooms and markers in others?",
        a: "Yes, and that is the normal way to specify a building. Surfaces are chosen per room while the series is held constant, so frames, corners and finishes stay consistent even when the writing medium changes from classroom to classroom.",
      },
      {
        q: "Which surface suits a lecture hall used all day?",
        a: "Ceramic steel, in whichever medium the faculty writes with. It is the one surface in the range listed for continuous writing and frequent cleaning, and it accepts magnets, so charts go up beside the working area.",
      },
    ],
  },
  {
    slug: "notice-board-types-guide",
    title: "Notice Boards: Cloth, Cork, Fabric and Lockable Acrylic Door Cover",
    seoTitle: "Notice Board Types: Cloth, Cork and ADC",
    description:
      "Blazer cloth, velvet, cork, fabric and lockable acrylic door cover boards compared — what each display surface suits, and when a board must lock.",
    excerpt:
      "A notice board is either a display surface or a secure one. Four cloth-and-cork options, plus the acrylic door cover boards that protect what is on them.",
    topic: "Products",
    published: "2026-10-15",
    updated: "2026-10-22",
    readMinutes: 5,
    coverProduct: "deluxe-45mm-adc-notice-board-double-door",
    intro: [
      "Notice boards get bought last and specified worst, because a cloth board looks like a simple object. The distinction that matters is not colour — it is whether the notice has to be pinned, protected, or both.",
    ],
    sections: [
      {
        heading: "Cloth boards — pin-up display",
        body: [
          "2 mm Blazer Cloth and Super Fine Velvet Cloth are stretched over soft, pin-friendly cores and come in multiple colours. These are the standard corridor and reception boards: notices, circulars, charts and event posters go in with pins and come out without leaving a hole in the wall.",
          "Cloth boards are supplied across the series, so a school can use a lighter Eco Regular board in a back corridor and a Metallic Premium board at reception while keeping one look.",
        ],
      },
      {
        heading: "Cork boards — the practical middle option",
        body: [
          "Cork Notice Boards take pins the same way cloth does and are the natural choice where a board gets reorganised constantly. Cork is also available in Metallic Premium, Eco Premium and Deluxe frame variants.",
        ],
      },
      {
        heading: "Fabric boards — colour and layout to order",
        body: [
          "Fabric Notice Boards are supplied in the customer's preferred fabric colour, with the board layout done as per requirement. Where an institution wants a board matched to a wall or a house colour, this is the route rather than accepting a standard colour.",
        ],
      },
      {
        heading: "Acrylic Door Cover boards — when notices must stay put",
        body: [
          "ADC notice boards put a lockable acrylic cover over the display area. Notices stay visible, and they stay correct: nothing gets removed, swapped or torn down overnight.",
          "These are built heavier — Deluxe 45 mm Triple Aluminium Framing on the Deluxe range — and come as single-door and double-door boards, with an Eco variant for lighter applications.",
          "Where a board is used for anything that has to be officially on display — examination notices, fee circulars, statutory and compliance notices, tender and RTI information, duty rosters in a government office — a covered board is the right specification.",
        ],
      },
      {
        heading: "Display boards that are not notice boards",
        body: [
          "Two adjacent products get mixed into the same purchase order. Acrylic Folder Display Boards hold documents in folders — charts, reports, SOPs and production data — with folder size and quantity made to requirement. Key Hanger Boards hold keys on labelled hooks. Neither is a pin-up surface, and specifying one as a notice board is a common and expensive mistake.",
        ],
      },
      {
        heading: "How to choose",
        body: [
          "Ask one question: does the content change, or does it have to stay? If it changes constantly, cloth, cork or fabric. If it has to remain exactly as put up, and it matters, lockable acrylic door cover.",
        ],
      },
    ],
    related: ["notice-boards", "acrylic-door-cover-notice-boards", "fabric-notice-board", "cork-notice-board", "acrylic-folder-display-board", "specialty-boards", "board-study-essentials"],
    faq: [
      {
        q: "What is an ADC notice board?",
        a: "An Acrylic Door Cover notice board — a lockable acrylic cover over the pin-up area. Notices remain visible and cannot be removed or altered while covered. They are made in single-door and double-door formats.",
      },
      {
        q: "Can a notice board be made in a specific colour?",
        a: "Yes. Fabric Notice Boards are available in the customer's preferred fabric colour, with the board layout provided as per requirement.",
      },
    ],
  },
  {
    slug: "how-to-clean-white-board",
    title: "Why a White Board Starts Ghosting, and How to Stop It",
    seoTitle: "How to Clean a White Board Without Ghosting",
    description:
      "Marker ghosting comes from surface residue and wrong cleaning habits. Practical board care for schools and offices, and how to choose boards that resist it.",
    excerpt:
      "Ghosting is not age — it is residue building up in the surface. What to change in your cleaning routine, and what to specify at purchase.",
    topic: "Maintenance",
    published: "2026-10-20",
    updated: "2026-10-24",
    readMinutes: 4,
    coverProduct: "deluxe-standard-white-board",
    intro: [
      "A board that still shows last week's diagram after wiping has a residue problem, not an age problem. Ink that is not fully removed each time builds a film, and once the film is there, wiping spreads it instead of lifting it.",
      "Two things fix it: how the board is cleaned daily, and which surface was bought for the room.",
    ],
    sections: [
      {
        heading: "What actually causes ghosting",
        body: [
          "Left ink film. Three habits build it: leaving writing on the board overnight, wiping with a cloth that already carries solvent and ink, and using a rough cloth or sponge that micro-scratches the surface so ink sits inside the scratches.",
        ],
      },
      {
        heading: "Daily routine that keeps a board clean",
        body: ["Nothing here needs a special product; it needs consistency."],
        bullets: [
          "Erase the board at the end of every session, not at the end of the day or week",
          "Use a clean, soft cloth or a proper board eraser, and wash or replace it regularly — a dirty eraser is the main reason a board looks smudged after cleaning",
          "Wipe in one direction with light pressure rather than scrubbing in circles",
          "For a deeper clean, dampen a soft cloth with water or a mild board cleaner, then dry the surface before anyone writes on it",
          "Never use abrasive pads, scouring powder, or strong solvents on any board surface",
          "Do not leave permanent marker on a board assuming it will wipe off",
        ],
      },
      {
        heading: "Recovering a board that has already ghosted",
        body: [
          "Cover the old ghosted writing with fresh dry-erase ink and erase it immediately while wet — the solvents in the new ink lift the dried film underneath. Then clean the whole surface with a damp soft cloth and dry it.",
          "Repeat across small sections rather than attempting the whole board at once. If the board has been scrubbed with abrasives for a long period, the film has gone into the scratches and no cleaning routine will fully recover it; that board needs replacing.",
        ],
      },
      {
        heading: "Specifying boards that resist it",
        body: [
          "Ghosting resistance is decided at purchase. Marker Grade HPL is high-gloss and made for easy erasing. Ceramic — porcelain enamel steel — is hard and non-porous, and built for continuous writing and frequent cleaning, which is why it is specified for high-traffic institutions that clean their boards daily.",
          "High Gloss Melamine on the Eco Regular range is meant for light use. Put it in a busy lecture hall and it will ghost within a term, which is a specification error, not a quality complaint.",
          "The other variable is chalk. Where a room writes with chalk, a Chalk Grade HPL surface is the correct one; using a marker surface for chalk is a fast route to a permanently marked board.",
        ],
      },
      {
        heading: "Who cleans it matters more than what cleans it",
        body: [
          "Institutions that put board cleaning on a fixed schedule — class monitor, housekeeping staff, or a daily end-of-day wipe — keep boards readable for years. Boards cleaned only when they look bad are the ones that reach the point where cleaning no longer works.",
        ],
      },
    ],
    related: ["white-boards", "white-boards-ceramic", "metallic-premium-ceramic-board", "eco-regular-white-board"],
    faq: [
      {
        q: "How often should a white board be deep cleaned?",
        a: "Daily erasing after every session, with a damp soft cloth and a dry wipe when the surface starts to look smudged even after erasing. Rooms that run all day usually need a full clean once or twice a week.",
      },
      {
        q: "Which board surface is easiest to keep clean?",
        a: "Ceramic. Porcelain enamel steel is hard and non-porous, so it tolerates frequent cleaning, which is why it is specified for high-traffic institutions.",
      },
    ],
  },
  {
    slug: "board-stands-types-guide",
    title: "Board Stands Explained: Three Leg, Four Leg, Revolving, Zig Zag and Telescopic",
    seoTitle: "Board Stands: Three Leg, Four Leg, Revolving",
    description:
      "Three leg, four leg, revolving, zig zag and telescopic board stands, plus newspaper stands, magazine stands and file racks. What each is for.",
    excerpt:
      "Five stand shapes solve five different room problems. Here is what each one is actually for, and what to ask before you order.",
    topic: "Products",
    published: "2026-10-24",
    updated: "2026-10-24",
    readMinutes: 5,
    coverProduct: "three-leg-stand",
    intro: [
      "A wall-mounted board is fixed. A board on a stand moves, which is the whole reason stands exist — the same writing surface serves a training room in the morning and a review meeting in the afternoon.",
      "Plusmark manufactures all types of board stands, and the catalog lists five board stand shapes alongside newspaper stands, magazine stands, file racks, first aid boxes and letter boxes. The catalog lists these by name; dimensions, finishes and load capacity are confirmed on enquiry, because the right answer depends on the board you intend to put on it.",
    ],
    sections: [
      {
        heading: "The five board stand shapes",
        body: [
          "The names describe the geometry, and the geometry decides where the stand is stable and how it behaves when someone writes on it.",
        ],
        table: {
          head: ["Stand", "What the shape gives you", "Best for"],
          rows: [
            ["Three Leg Stand", "Three-point base, light to move", "Classrooms and training rooms where the board travels between rooms"],
            ["Four Leg Stand", "Four-point base, steadier footprint", "Rooms where the board stays put and gets written on heavily"],
            ["Revolving Stand", "Board turns over on its axis", "Two-sided use without lifting or re-hanging the board"],
            ["Zig Zag Stand", "Folding frame that packs flat", "Storage between sessions and transport between sites"],
            ["Telescopic Stand", "Height adjusts", "Rooms used by different age groups, or seated and standing use"],
          ],
        },
      },
      {
        heading: "Matching the stand to the board",
        body: [
          "A stand is sized against the board, not chosen on its own. A heavy ceramic steel board and a lightweight melamine board of the same dimensions do not behave the same way on a three-point base, and a double-sided board on a revolving stand is the one combination where the stand shape does real work for you.",
          "Before ordering, settle three things: the board size going on it, whether the board is single or double sided, and whether the room needs the height to change. Send those three with the quantity through the enquiry form and the right model gets confirmed.",
        ],
      },
      {
        heading: "Stands are not the only storage products in the range",
        body: [
          "The same catalog section carries the display and storage items institutions order alongside boards.",
        ],
        bullets: [
          "Newspaper Stand and Magazine Stand — reading rooms, libraries, reception areas and lounges",
          "File Rack — offices and admin blocks where documents are consulted rather than pinned up",
          "First Aid Box — wall-mounted safety provision for workshops, factories and school blocks",
          "Letter Box — reception areas, hostels, housing societies and office entrances",
          "PDS-500 — listed in the same range; ask for its specification when you enquire",
        ],
      },
      {
        heading: "What the catalog does not tell you, and why",
        body: [
          "Board stands are listed by name in the Plusmark catalog rather than with a fixed specification table, because the models are made to the board and the room. That is also why the stand pages ask you to enquire rather than quoting a size chart.",
          "This is not a gap in the range — it is how a made-to-order manufacturing range is documented. If you need a stand for an existing board you already own, send the board dimensions and the stand gets matched to it.",
        ],
      },
    ],
    related: ["board-stands", "three-leg-stand", "four-leg-stand", "revolving-stand", "zig-zag-stand", "telescopic-stand"],
    faq: [
      {
        q: "Which board stand is best for a double-sided board?",
        a: "A Revolving Stand. The board turns over on its axis, so both writing surfaces are used without lifting or re-hanging the board. Send the board size with your enquiry so the stand is matched to it.",
      },
      {
        q: "Does Plusmark make stands for boards you already own?",
        a: "Plusmark manufactures all types of board stands, and a stand is matched to the board going on it. Send the board dimensions, whether it is single or double sided, and the quantity required.",
      },
    ],
  },
  {
    slug: "wall-mount-or-board-stand",
    title: "Wall-Mounted Board or Board Stand? Deciding Before You Order",
    seoTitle: "Wall-Mounted Board or Board Stand?",
    description:
      "Wall mounting fixes a board to one room; a stand lets it move. How to decide, and what Plusmark double-sided boards and stand types offer for each case.",
    excerpt:
      "One decision changes the whole order: does this board belong to a wall or to a room? Here is how to settle it before you specify sizes.",
    topic: "Choosing",
    published: "2026-10-23",
    updated: "2026-10-23",
    readMinutes: 4,
    coverProduct: "revolving-stand",
    intro: [
      "Institutions usually buy boards and stands as separate line items, which is why the choice gets made late — often after sizes are already fixed. It should be the first decision, because it changes what you order.",
      "A wall-mounted board is permanent and uses no floor area. A board on a stand is movable and needs floor space and a stable base. Neither is better; they answer different questions about the room.",
    ],
    sections: [
      {
        heading: "Choose wall mounting when",
        body: [
          "The room has one dedicated teaching or writing position and nothing else competes for that wall.",
        ],
        bullets: [
          "Classrooms and lecture halls where the board faces a fixed seating layout",
          "Cabins and meeting rooms where the board is part of the furniture, not a shared resource",
          "Notice display, where the board is read rather than moved — including lockable acrylic door cover boards",
          "Corridors and public areas where floor-standing items would be an obstruction",
        ],
      },
      {
        heading: "Choose a stand when",
        body: [
          "The same surface has to serve more than one setting, or the wall cannot take a fixing.",
        ],
        bullets: [
          "Training rooms and coaching centres that run back-to-back batches in different rooms",
          "Factories and workshops where a shift review happens wherever the team is standing",
          "Rented or heritage spaces where drilling into the wall is not permitted",
          "Rooms used by different age groups, where a telescopic stand lets the height change",
        ],
      },
      {
        heading: "The third option: both surfaces in one frame",
        body: [
          "Plusmark Double-Sided Boards carry a white board surface on the front for marker writing and a chalk board surface on the back, in a premium aluminium anodised frame with ABS dual-tone edges. The catalog notes quick wall-mount installation that allows horizontal or vertical hanging, which gives a fixed room two writing types without two boards.",
          "On a revolving stand the same board becomes movable, and both surfaces stay reachable without re-hanging anything. That combination is the usual answer for a room that teaches with chalk and reviews with markers.",
        ],
      },
      {
        heading: "What to send with the enquiry",
        body: [
          "Whether you go wall-mounted or stand-mounted, three details decide the order: the board size, the quantity, and whether the room needs the board to move. For a stand, add whether the board is single or double sided so the stand shape is matched to it.",
        ],
      },
    ],
    related: ["board-stands", "double-sided-boards", "eco-premium-both-side-board", "revolving-stand"],
    faq: [
      {
        q: "Can a double-sided board be wall mounted?",
        a: "Yes. The catalog lists quick wall-mount installation that allows horizontal or vertical hanging, so a double-sided board can be fixed to a wall as well as used on a revolving stand.",
      },
      {
        q: "Which is better for a coaching centre?",
        a: "Coaching centres that run batches in several rooms usually prefer stands, because the board moves with the batch. Rooms with a fixed seating layout and one teaching position are better served by wall mounting.",
      },
    ],
  },
  {
    slug: "clipboards-mdf-vs-acrylic",
    title: "Clipboards: MDF Bases, Acrylic Bases, Clips and Rivets Explained",
    seoTitle: "Clipboards: MDF vs Acrylic Bases Explained",
    description:
      "Pre-Lam, Graphic and Laminate MDF clipboards versus Crystal Clear, Heavy-Duty Clear Acrylic and Crystal Colour bases. Clips, rivets and where each is used.",
    excerpt:
      "Six clipboard bases, one clip spec. What actually differs between them, and which one survives a factory floor versus a front office.",
    topic: "Materials",
    published: "2026-10-23",
    updated: "2026-10-23",
    readMinutes: 5,
    coverProduct: "laminate-mdf-base-clipboard",
    intro: [
      "Clipboards get ordered in bulk and then judged in use, which is why the base material matters more than the look in the photo. Plusmark makes them on two families of base — MDF and acrylic — with the same clip specification across the range.",
      "Every Plusmark clipboard uses a Chrome Electroplated Clip with a rust-resistant finish, and Dual-Side Cap Rivets so the finish is uniform on both sides. What changes between models is the base.",
    ],
    sections: [
      {
        heading: "The MDF family",
        body: [
          "MDF bases are the economical, opaque option and they come in three finishes.",
        ],
        table: {
          head: ["Model", "Base", "Sizes", "Where it fits"],
          rows: [
            ["Pre-Lam MDF Base (Wood Finish)", "Pre-Lam wood finish, smooth", "Available in 6 different sizes", "General office and institutional use where a wood look is wanted"],
            ["Graphic MDF Base", "Premium graphic printing, sharp and fade-resistant", "Available in different sizes", "Branded use — events, field teams, promotional issue"],
            ["Laminate MDF Base (Wood Finish)", "HPL sheet wood grade, smooth and premium appearance", "Available in 2 different sizes", "Front office and reception use where the clipboard is seen"],
          ],
        },
      },
      {
        heading: "The acrylic family",
        body: [
          "Acrylic bases are transparent, so the document underneath stays visible, and they are the choice where the clipboard itself gets knocked about.",
        ],
        table: {
          head: ["Model", "Base", "Notes"],
          rows: [
            ["Crystal Clear Base", "Glass-like clarity with modern appeal", "Available in different sizes and variants; Dual-Side Cap Rivets for a uniform look on both sides"],
            ["Heavy-Duty Clear Acrylic", "High impact strength, shatter-resistant", "The specification to ask for on shop floors and sites"],
            ["Crystal Colour Base", "Crystal-tint acrylic, transparent colour", "Available in 2 different sizes; rounded edge with soft rounded corners for safety and comfort"],
          ],
        },
      },
      {
        heading: "Clip and rivet specification, common to the range",
        body: [
          "Two details are worth checking on any clipboard you compare, because they are the parts that fail first.",
        ],
        bullets: [
          "Chrome Electroplated Clip with a rust-resistant finish — the plating is what keeps the clip working after months of handling and occasional damp storage",
          "Dual-Side Cap Rivets — the fixing is finished on both faces, so the reverse side is smooth and the base does not snag paper or fabric",
          "Rounded edges on the Crystal Colour base, for safety and comfort where clipboards are handed around",
        ],
      },
      {
        heading: "Choosing between the two families",
        body: [
          "If the clipboard is used at a desk or a counter and the document does not need to be read through the base, MDF is the economical answer and the graphic version carries branding. If the clipboard is used standing up, outdoors, on a shop floor, or where the sheet beneath has to stay visible, go acrylic — and specify Heavy-Duty Clear where impact is a real risk.",
          "Send the base type, the size and the quantity through the enquiry form. Sizes differ by model, so quoting a size without the model does not narrow the order down.",
        ],
      },
    ],
    related: ["clipboards", "pre-lam-mdf-base-clipboard", "graphic-mdf-base-clipboard", "laminate-mdf-base-clipboard", "crystal-clear-base-clipboard", "heavy-duty-clear-acrylic-clipboard", "crystal-colour-base-clipboard"],
    faq: [
      {
        q: "Which clipboard is best for factory or site use?",
        a: "The Heavy-Duty Clear Acrylic clipboard. Its base is specified for high impact strength and is shatter-resistant, and the clip is chrome electroplated with a rust-resistant finish.",
      },
      {
        q: "Can clipboards carry branding?",
        a: "Yes — the Graphic MDF Base Clipboard carries premium graphic printing that is sharp and fade-resistant, which is the model usually chosen for branded and promotional issue.",
      },
    ],
  },
  {
    slug: "acrylic-door-cover-notice-board-guide",
    title: "Acrylic Door Cover Notice Boards: Single Door, Double Door and ECO Framing",
    seoTitle: "ADC Notice Boards: Single Door, Double Door & ECO",
    description:
      "Lockable acrylic door cover notice boards in Deluxe 45 mm triple aluminium framing and ECO framing, with single and double door options and listed sizes.",
    excerpt:
      "When notices have to stay up, stay clean and stay controlled, the door and the lock matter more than the pin surface. Here are the three ADC options.",
    topic: "Products",
    published: "2026-10-22",
    updated: "2026-10-22",
    readMinutes: 5,
    coverProduct: "deluxe-45mm-adc-notice-board-double-door",
    intro: [
      "An Acrylic Door Covered board — ADC in the catalog — is a notice board with a transparent acrylic door in front of it and a locking system on the door. The notices stay visible, but dust, handling and unauthorised changes stay out.",
      "Plusmark lists three ADC models: a Deluxe 45 mm single door, a Deluxe 45 mm double door, and an ECO single door. The difference between them is framing, door count and the size range each is offered in.",
    ],
    sections: [
      {
        heading: "The three models side by side",
        body: [
          "Sizes below are the ones listed in the catalog for each model.",
        ],
        table: {
          head: ["", "Deluxe 45 MM Single Door", "Deluxe 45 MM Double Door", "ECO Single Door"],
          rows: [
            ["Framing", "Deluxe 45 mm triple aluminium framing", "Deluxe 45 mm triple aluminium framing", "Lightweight aluminium framing"],
            ["Door", "Single, transparent acrylic cover", "Double, transparent acrylic cover", "Single, transparent acrylic cover"],
            ["Locking", "Secure single-door locking system", "Secure double-door system", "Single-door locking system"],
            ["Listed sizes", "2 × 3 ft, 2 × 4 ft, 3 × 4 ft, 4 × 4 ft", "5 × 4 ft, 6 × 4 ft, 8 × 4 ft", "1.5 × 2 ft, 2 × 3 ft, 2 × 4 ft, 3 × 4 ft, 4 × 4 ft"],
            ["Catalog applications", "Regular indoor use", "Offices, institutions, housing societies, hospitals, public areas", "Regular indoor applications"],
          ],
        },
      },
      {
        heading: "Why the door changes the specification",
        body: [
          "A plain notice board is an open pin surface: anyone can add, remove or replace a notice, and dust settles on the paper. Both of those are acceptable in a staff room and unacceptable at a hospital reception or a society notice point.",
          "The acrylic door cover protects notices from dust, moisture and handling, and the lock means only the person holding the key changes what is displayed. That is why ADC boards are the usual specification for government offices, institutions, hospitals, housing societies and public areas rather than for internal team walls.",
        ],
      },
      {
        heading: "Single door or double door",
        body: [
          "The choice follows the size, and the catalog size ranges make that clear. Single door models run from 1.5 × 2 ft up to 4 × 4 ft — one leaf opens, and the board stays manageable on a corridor wall.",
          "Double door models start at 5 × 4 ft and go to 8 × 4 ft. At those dimensions a single leaf would be heavy and would need clearance to swing, so two leaves meet in the middle. If the wall you have is wider than about 5 ft, you are in double door territory.",
        ],
      },
      {
        heading: "Deluxe framing versus ECO framing",
        body: [
          "Deluxe 45 mm Triple Aluminium Framing is specified for strength, stability and long-term durability, and it reads as a premium installation in a lobby or a public corridor. ECO framing is lightweight aluminium, specified for economical and practical use, and it suits regular indoor applications where the board is not on public display.",
          "Both keep the same functional core: transparent acrylic cover, locking, and a pin-up surface behind the door.",
        ],
      },
      {
        heading: "Ordering for government and institutional supply",
        body: [
          "The GEM Portal lists Plusmark as an approved brand for school and government supplies, and notice display work is what institutions usually raise through that channel.",
          "Send the model, the size, the quantity and the installation location through the enquiry form. Plusmark warrants what it manufactures, but the schedule board's terms are confirmed with the authorised distributor or marketing executive rather than quoted on the page.",
        ],
      },
    ],
    related: ["acrylic-door-cover-notice-boards", "deluxe-45mm-adc-notice-board-double-door", "deluxe-45mm-adc-notice-board-single-door", "eco-adc-notice-board-single-door", "notice-boards"],
    faq: [
      {
        q: "What sizes are acrylic door cover notice boards available in?",
        a: "Deluxe single door is listed in 2 × 3 ft, 2 × 4 ft, 3 × 4 ft and 4 × 4 ft. Deluxe double door is listed in 5 × 4 ft, 6 × 4 ft and 8 × 4 ft. ECO single door is listed in 1.5 × 2 ft, 2 × 3 ft, 2 × 4 ft, 3 × 4 ft and 4 × 4 ft.",
      },
      {
        q: "Why choose a double door ADC board over a single door?",
        a: "Double door models cover the larger sizes, from 5 × 4 ft up to 8 × 4 ft, where two leaves meeting in the middle are easier to open and need less swing clearance than one wide leaf.",
      },
      {
        q: "Are ADC notice boards suitable for government supply?",
        a: "Yes. Plusmark is a GEM Portal approved brand authorised for school and government supplies, and notice boards and acrylic door cover notice boards are the range typically ordered for government offices, institutions, hospitals and public areas.",
      },
    ],
  },
  {
    slug: "double-sided-board-guide",
    title: "Double-Sided Boards: Marker on One Side, Chalk on the Other",
    seoTitle: "Double-Sided Boards: White & Chalk in One Frame",
    description:
      "Marker white board on the front, chalk on the back, in premium aluminium anodised frames with ABS dual-tone edges. Where a 2-in-1 board fits.",
    excerpt:
      "Two writing types, one frame, and no second wall needed. Where a 2-in-1 board is the right order — and where two separate boards still win.",
    topic: "Products",
    published: "2026-10-22",
    updated: "2026-10-22",
    readMinutes: 4,
    coverProduct: "eco-premium-both-side-board",
    intro: [
      "A double-sided board is not two boards bolted together. It is one frame with a white board surface on the front for marker writing and a chalk board surface on the back, so a room gets both writing types without a second wall or a second fixing.",
      "Plusmark lists the Eco Premium Both Side Board in this category: non-magnetic, easy-to-clean surfaces in a premium aluminium anodised frame with ABS dual-tone edges, with quick wall-mount installation that allows horizontal or vertical hanging.",
    ],
    sections: [
      {
        heading: "What the specification says",
        body: [
          "The catalog entry is short and worth reading literally, because each line answers a question buyers usually have to ask.",
        ],
        bullets: [
          "2-in-1 writing surface — marker on one side, chalk on the other",
          "Front: white board · Back: chalk board",
          "Non-magnetic surface, so neither side accepts magnets",
          "Easy-to-clean surfaces on both faces",
          "Premium aluminium anodised frame with ABS dual-tone edges",
          "Quick wall-mount installation, horizontal or vertical hanging",
          "Listed applications: offices, classrooms, home, restaurants and cafés",
        ],
      },
      {
        heading: "Where it is the right order",
        body: [
          "Rooms that teach with chalk and review with markers are the obvious case — a coaching centre that solves problems on chalk and annotates a printed sheet with a marker, or a school block where some teachers still prefer chalk and others do not.",
          "Homes and small offices are the other common case: one board serves a study corner and a planning surface, and the chalk side takes a menu or a note in a café. Restaurants and cafés appear in the catalog applications for exactly that reason.",
          "It is also the answer where wall area is limited. Two boards side by side need two clear walls; one double-sided board needs one, or a stand.",
        ],
      },
      {
        heading: "Where two separate boards still win",
        body: [
          "If both writing types are used at the same time by two people, one board cannot serve both — you need two surfaces facing two directions permanently, which means two boards.",
          "If you need magnets on either surface, a double-sided board will not do it: the listed surface is non-magnetic. For magnetic use, order from the magnetic white board or magnetic chalk board range instead.",
        ],
      },
      {
        heading: "Wall-mounted or on a stand",
        body: [
          "Because installation allows horizontal or vertical hanging, a wall-mounted double-sided board can be oriented to the wall it has. On a revolving stand the same board turns over on its axis, so both surfaces stay usable without anyone lifting or re-hanging it — which is how most institutions get full value out of the 2-in-1 design.",
          "Sizes for the Eco Premium Both Side Board run through the standard range, from 1 × 1 ft up to 3 × 4 ft. Send the size, the quantity and whether you want wall mounting or a stand through the enquiry form.",
        ],
      },
    ],
    related: ["double-sided-boards", "eco-premium-both-side-board", "chalk-boards", "white-boards", "board-stands"],
    faq: [
      {
        q: "Is a double-sided board magnetic?",
        a: "No. The Plusmark double-sided board is listed with a non-magnetic surface on both faces. For magnetic use, the magnetic white board and magnetic chalk board ranges use resin coated steel surfaces that accept magnets.",
      },
      {
        q: "Can a double-sided board be hung vertically?",
        a: "Yes. The catalog notes quick wall-mount installation that allows horizontal or vertical hanging, so the orientation can suit the wall available.",
      },
    ],
  },
  {
    slug: "magnetic-chalk-board-guide",
    title: "Magnetic Chalk Boards: Resin Coated Steel in Three Series",
    seoTitle: "Magnetic Chalk Boards Explained",
    description:
      "Plusmark magnetic chalk boards use resin coated steel green surfaces that accept magnets, in Metallic Premium, Deluxe Standard and Eco Regular series.",
    excerpt:
      "Chalk writing that also holds charts and holders. What the resin coated steel surface does, and which of the three series fits your room.",
    topic: "Products",
    published: "2026-10-21",
    updated: "2026-10-21",
    readMinutes: 4,
    coverProduct: "metallic-premium-magnetic-chalk-board",
    intro: [
      "Magnetic chalk boards are listed separately from the rest of the chalk range for one reason: the surface underneath the green finish is steel. That steel is what accepts a magnet, and it is fixed at manufacture, so a board ordered non-magnetic cannot be made magnetic later.",
      "Plusmark lists three magnetic chalk board models — Metallic Premium, Deluxe Standard and Eco Regular — each with a resin coated green chalk writing surface that writes smoothly and erases easily.",
    ],
    sections: [
      {
        heading: "The three series compared",
        body: [
          "The surface type is the same across the three; what changes is the frame, the corners and the duty the board is specified for.",
        ],
        table: {
          head: ["", "Metallic Premium", "Deluxe Standard", "Eco Regular"],
          rows: [
            ["Surface", "Resin coated green chalk surface", "Resin coated green chalk writing surface", "Resin coated green chalk writing surface"],
            ["Magnets", "Accepts magnets and magnetic accessories", "Accepts magnets and magnetic accessories", "Accepts magnets and basic magnetic accessories"],
            ["Frame and corners", "Heavy-duty aluminium framing with Signature Dual-Tone Corners", "Aluminium frame with Electroplated Chrome Corners", "Lightweight aluminium frame with standard plastic corners"],
            ["Catalog applications", "Schools, colleges, institutions, classrooms", "Classrooms, coaching centres, offices", "Home classrooms, tuition classes, small institutions"],
          ],
        },
      },
      {
        heading: "Why a school chooses magnetic chalk over plain chalk",
        body: [
          "Teaching with chalk does not stop a room from needing display. Maps, answer keys, revision sheets, charts and lab diagrams all have to go somewhere, and a magnetic surface puts them on the board itself instead of on the wall beside it.",
          "Holders and magnetic accessories work the same way, which is why the catalog lists compatibility with magnets, charts and holders as a feature rather than an add-on.",
        ],
      },
      {
        heading: "Choosing the series",
        body: [
          "Institutional rooms that run all day — schools, colleges, hostels — are the Metallic Premium case, where heavy-duty framing and Signature Dual-Tone Corners are doing real work. Coaching centres and standard classrooms are the Deluxe Standard case. Tuition classes, home classrooms and small institutions are Eco Regular, where a lightweight frame is easier to handle and install.",
          "If the room does not need magnets at all, the non-magnetic chalk range with Hardcore Chalk Grade HPL Sheet is the economical alternative — it is non-reflective and glare-free with clear visibility from all angles.",
        ],
      },
      {
        heading: "Ceramic chalk is the long-life option",
        body: [
          "For rooms where the board is written on continuously, the ceramic chalk board uses a ceramic steel / porcelain enamel magnetic green surface described in the catalog as scratch-proof, hard and non-porous, with excellent chalk visibility from all angles. It is also magnetic, so display capability is not lost by choosing the harder surface.",
        ],
      },
    ],
    related: ["chalk-boards-magnetic", "chalk-boards", "metallic-premium-magnetic-chalk-board", "deluxe-standard-magnetic-chalk-board", "eco-regular-magnetic-chalk-board", "metallic-premium-ceramic-chalk-board"],
    faq: [
      {
        q: "Do magnetic chalk boards hold charts as well as magnetic white boards?",
        a: "Yes. Both use resin coated steel surfaces that accept magnets, charts and holders — the difference is the writing type, green chalk surface versus white marker surface.",
      },
      {
        q: "Which series is right for a school classroom used all day?",
        a: "Metallic Premium. It carries heavy-duty aluminium framing with Signature Dual-Tone Corners and is listed for schools, colleges, institutions and classrooms. Where the board is written on continuously, the ceramic chalk surface is the long-life specification.",
      },
    ],
  },
  {
    slug: "practice-board-handwriting-guide",
    title: "Four Line and Square Line Practice Boards for Handwriting",
    seoTitle: "Four Line & Square Line Practice Boards",
    description:
      "Practice boards for handwriting improvement, with four-line and square-grid sections for letter size, spacing, alignment and number writing.",
    excerpt:
      "The line layout is the teaching tool. What four-line and square-grid sections do for handwriting and early maths, and how line marking is customised.",
    topic: "Products",
    published: "2026-10-21",
    updated: "2026-10-21",
    readMinutes: 4,
    coverProduct: "four-line-square-line-practice-board",
    intro: [
      "A practice board is not a small white board. It is a white board with a printed line layout, and the layout is what makes it a teaching aid rather than a writing surface.",
      "Plusmark's Four Line & Square Line Practice Board is listed for handwriting improvement, ensuring proper letter size, spacing and alignment, with a square grid section that supports accurate number writing and basic maths practice. The catalog applications are primary classes and early learning classes.",
    ],
    sections: [
      {
        heading: "What each section of the layout does",
        body: [
          "The two sections are used for different skills, and schools usually introduce them in sequence.",
        ],
        table: {
          head: ["Section", "What it trains", "Used for"],
          rows: [
            ["Four line", "Letter size, spacing and alignment", "Alphabets, cursive formation, consistent baseline and x-height"],
            ["Square grid", "Accurate number writing and basic maths practice", "Numerals, columns of sums, graph and geometry introduction"],
          ],
        },
      },
      {
        heading: "Why a printed line layout beats freehand practice",
        body: [
          "Handwriting problems in early classes are usually proportion problems: the tail of a 'g' does not descend far enough, the top of a 't' does not rise high enough, and letters drift off an invisible baseline. A printed four-line layout makes the target visible, so a child can self-correct without a teacher marking every line.",
          "The square grid does the same job for numerals and for keeping a column of figures aligned — which is the skill that breaks down first when sums get longer.",
        ],
      },
      {
        heading: "Line marking is made to requirement",
        body: [
          "The catalog lists practice board line layouts among Plusmark's customisation capabilities: line marking is provided as per school or customer requirements. Different boards and different curricula use different line spacings and grid sizes, so this is specified at order time rather than chosen from a fixed chart.",
          "Send the line layout you want — spacing, number of lines, grid size, and whether both sections appear on one board — along with the quantity.",
        ],
      },
      {
        heading: "Where practice boards fit in a school order",
        body: [
          "Practice boards are usually ordered for primary and early learning rooms, alongside the chalk boards and white boards that serve the same block. Because the line marking is custom, they are specified in the same enquiry as the rest of the classroom order rather than as a separate purchase.",
          "The board is part of Plusmark's Board & Study Essentials collection, which also carries the lockable Key Hanger Board and the foldable Homework Table with a white board writing surface.",
        ],
      },
    ],
    related: ["board-study-essentials", "four-line-square-line-practice-board", "chalk-boards", "white-boards"],
    faq: [
      {
        q: "Can the line layout be made to our school's specification?",
        a: "Yes. Practice board line layouts are listed among Plusmark's customisation capabilities, with line marking provided as per school or customer requirements. Send the spacing, number of lines and grid size with the quantity.",
      },
      {
        q: "Which classes are practice boards meant for?",
        a: "The catalog lists primary classes and early learning classes as the applications, which is where letter formation and number writing are first taught.",
      },
    ],
  },
  {
    slug: "homework-table-guide",
    title: "Homework Table: A Foldable Study Table With a White Board Surface",
    seoTitle: "Homework Table (Student Study Table) Guide",
    description:
      "A foldable student study table with a 16 × 24 inch white board writing surface and a 9.5 inch height, for study, homework and laptop use.",
    excerpt:
      "A study table you can write on with a marker. Dimensions, what the white board surface is for, and where it actually gets used.",
    topic: "Products",
    published: "2026-10-20",
    updated: "2026-10-21",
    readMinutes: 4,
    coverProduct: "student-study-table",
    intro: [
      "The Homework Table is the one product in the Plusmark range that is furniture rather than a wall-mounted board, and it solves a problem every parent of a school child recognises: there is no flat surface to work on, and no surface to practise on.",
      "It is listed in the catalog as a student study table with a smooth white board writing surface, and the applications given are study, homework, reading and laptop table.",
    ],
    sections: [
      {
        heading: "The specification as listed",
        body: [
          "Both numbers matter, and they are the two most-asked questions about this product.",
        ],
        table: {
          head: ["Detail", "Listed value"],
          rows: [
            ["Writing area", "16 × 24 inches"],
            ["Height", "9.5 inches"],
            ["Surface", "Smooth white board writing surface"],
            ["Maintenance", "Easy to clean and maintain"],
            ["Design", "Foldable"],
            ["Applications", "Study, homework, reading, laptop table"],
          ],
        },
      },
      {
        heading: "What the white board surface is actually for",
        body: [
          "A marker-writable desk surface turns rough work into something that wipes clean. Sums, spellings, diagrams and rough notes get written directly on the table instead of on paper that gets lost, and the surface is wiped for the next session.",
          "That is why the product sits in Board & Study Essentials alongside the Four Line & Square Line Practice Board — both are practice surfaces, one for a desk and one for a wall.",
        ],
      },
      {
        heading: "Foldable, and why the height is 9.5 inches",
        body: [
          "At 9.5 inches the table is a low, floor-level work surface rather than a desk height. That is the usual study posture at home, and it is what makes the table foldable and storable between uses — under a bed, in a cupboard, or against a wall in a shared room.",
          "Foldable also means one table can move between rooms, which is the practical reason families buy it instead of committing a corner of a room to a fixed desk.",
        ],
      },
      {
        heading: "Who orders it, and in what quantity",
        body: [
          "Homes buy one or two. Institutions buy them in quantity for hostel study rooms, reading halls, activity rooms and remedial classes, where a low table with a writable surface lets a small group work together without a full desk per student.",
          "Send the quantity through the enquiry form along with the rest of the order — the Homework Table is often specified together with practice boards for the same block.",
        ],
      },
    ],
    related: ["board-study-essentials", "student-study-table", "white-boards", "four-line-square-line-practice-board"],
    faq: [
      {
        q: "What are the dimensions of the Plusmark Homework Table?",
        a: "The writing area is 16 × 24 inches and the height is 9.5 inches, as listed in the catalog. It is foldable.",
      },
      {
        q: "Can you write on the table with a white board marker?",
        a: "Yes. It has a smooth white board writing surface that is easy to clean and maintain, so rough work can be written directly on it and wiped off.",
      },
    ],
  },
  {
    slug: "key-hanger-board-guide",
    title: "Key Hanger Boards: Lockable Key Storage Sized by Key Count",
    seoTitle: "Key Hanger Boards: Sizes & Key Capacity",
    description:
      "Plusmark key hanger boards hold 15 to 150 keys behind a lockable acrylic door, in five listed sizes, for offices, companies and workshops.",
    excerpt:
      "Sized by how many keys it holds, not by the wall it goes on. Five sizes, a lockable acrylic door, and how to pick the right one.",
    topic: "Products",
    published: "2026-10-20",
    updated: "2026-10-20",
    readMinutes: 4,
    coverProduct: "key-hanger-board",
    intro: [
      "A key hanger board is a control point, not a hook strip. Keys for rooms, vehicles, cabinets and machine panels get signed out and signed back in, and the board is what makes the count checkable at a glance.",
      "Plusmark lists the Key Hanger Board with a lockable acrylic door and clear visibility of keys, in a professional and durable design, for offices, companies and workshops. It is sized by key capacity, and the catalog gives five sizes.",
    ],
    sections: [
      {
        heading: "Sizes and key capacity",
        body: [
          "This is the table to work from — capacity first, then the board size that carries it.",
        ],
        table: {
          head: ["Board size", "Keys held"],
          rows: [
            ["1 × 1.5 ft", "15 / 20 keys"],
            ["1.5 × 2 ft", "30 keys"],
            ["2 × 2 ft", "50 keys"],
            ["2 × 3 ft", "100 keys"],
            ["3 × 4 ft", "150 keys"],
          ],
        },
      },
      {
        heading: "Why the door locks",
        body: [
          "Keys are access. A board where anyone can lift a key is a board that cannot tell you who has what, and the lock is what turns it into a controlled register with one custodian.",
          "The acrylic door keeps the keys visible while they stay secured — clear visibility of keys is listed as a feature alongside the lock, so the count can be checked without opening the board. That combination is why the product is specified for workshops and companies rather than only for reception desks.",
        ],
      },
      {
        heading: "Picking the capacity",
        body: [
          "Count the keys, then add the ones you expect within the next couple of years. A board at full capacity has no room for a new room key or a new vehicle, and the usual outcome is a second board mounted beside the first.",
          "The jump between sizes is large — 50 keys at 2 × 2 ft, 100 at 2 × 3 ft — so it is worth checking the count before choosing. Wall space is rarely the constraint; the capacity is.",
        ],
      },
      {
        heading: "Where it gets installed",
        body: [
          "Workshops and factories put it at the shift supervisor's point, where machine panel and vehicle keys change hands. Offices and companies put it at reception or in the admin block, for room and cabinet keys. Housing societies and institutions use it for common-area and store keys.",
          "It sits in the Board & Study Essentials collection in the Plusmark catalog, and is ordered alongside notice boards and acrylic door cover boards for the same admin area.",
        ],
      },
    ],
    related: ["board-study-essentials", "key-hanger-board", "acrylic-door-cover-notice-boards", "notice-boards"],
    faq: [
      {
        q: "How many keys does a key hanger board hold?",
        a: "Plusmark lists five capacities: 15 / 20 keys at 1 × 1.5 ft, 30 keys at 1.5 × 2 ft, 50 keys at 2 × 2 ft, 100 keys at 2 × 3 ft and 150 keys at 3 × 4 ft.",
      },
      {
        q: "Can you see the keys without opening the board?",
        a: "Yes. The board has a lockable acrylic door with clear visibility of keys, so the count can be checked while the board stays locked.",
      },
    ],
  },
  {
    slug: "grooved-and-perforated-display-boards",
    title: "Grooved Boards and Perforated Boards for Reception and Public Areas",
    seoTitle: "Grooved & Perforated Display Boards",
    description:
      "Grooved boards in nine landscape and portrait sizes, and black perforated boards with golden anodized frames, for hotels and reception areas.",
    excerpt:
      "Two display boards that are not notice boards. Grooves hold cards; perforations hold hooks. Where each one belongs.",
    topic: "Products",
    published: "2026-10-19",
    updated: "2026-10-19",
    readMinutes: 4,
    coverProduct: "perforated-board",
    intro: [
      "Both of these get called notice boards in a purchase order, and both are something else. A grooved board holds printed cards in horizontal grooves; a perforated board is a black panel with a hole pattern that takes hooks and inserts.",
      "Neither is a pin-up surface, and specifying one as a notice board is the common mistake this guide exists to prevent. Plusmark lists both under Display Boards, alongside the Letters & Figures Set.",
    ],
    sections: [
      {
        heading: "Grooved Boards",
        body: [
          "Grooved boards carry printed cards in grooves running across the panel. The card slides in and slides out, so the display changes without pins, tape or damage to the sheet.",
          "The catalog lists nine sizes in landscape and portrait, and gives the applications as hotels, reception areas and leisure centres. That is the tell: a grooved board is for a place where the display is read by visitors and changed by staff — room numbers, rate cards, function schedules, spa and gym timings, menu inserts.",
        ],
        bullets: [
          "Nine sizes, landscape and portrait",
          "Cards insert and remove without fixing the sheet itself",
          "Listed for hotels, reception areas and leisure centres",
        ],
      },
      {
        heading: "Perforated Boards",
        body: [
          "A perforated board is a black panel with a regular hole pattern, in a golden anodized frame, and information can be displayed vertically as well as horizontally. Hooks, holders and inserts go into the perforations, so the layout is rearranged without tools.",
          "The catalog lists offices, hotels and public places as the applications. In practice it is the board for a wall that has to carry a changing set of items rather than a changing set of sheets — key and card holders, small tools, badges, sample swatches, signage inserts.",
        ],
        bullets: [
          "Black perforated panel with a golden anodized frame",
          "Displays information vertically as well as horizontally",
          "Listed for offices, hotels and many other public places",
        ],
      },
      {
        heading: "Which one, and how they differ from a notice board",
        body: [
          "If what goes up is a sheet of paper that someone pins, you want a notice board — blazer cloth, velvet cloth, cork or fabric. If what goes up is a printed card that slides into a groove, you want a grooved board. If what goes up is an object that hangs on a hook, you want a perforated board.",
          "Reception areas frequently need two of the three, because a hotel front desk displays rate cards and also holds room keys.",
        ],
        table: {
          head: ["", "Notice board", "Grooved board", "Perforated board"],
          rows: [
            ["Holds", "Pinned sheets", "Printed cards in grooves", "Hooks, holders and inserts"],
            ["Surface", "Blazer cloth, velvet cloth, cork or fabric", "Grooved panel", "Black perforated panel"],
            ["Typical place", "Offices, institutions, corridors, societies", "Hotels, reception areas, leisure centres", "Offices, hotels, public places"],
          ],
        },
      },
      {
        heading: "Letters and figures complete the display",
        body: [
          "The Display Boards collection also carries the Letters & Figures Set, which is what makes a perforated or grooved installation able to spell out a message — letters in 12, 18, 24 and 36 mm, with a letters set of 112 pieces and a figures set of 100 pieces.",
          "Order the board and the set together, since the letter size has to suit the board dimensions and the reading distance.",
        ],
      },
    ],
    related: ["display-boards", "grooved-boards", "perforated-board", "letters-and-figures-set", "notice-boards"],
    faq: [
      {
        q: "What is a grooved board used for?",
        a: "Grooved boards hold printed cards in grooves across the panel, so displays change without pins or tape. Plusmark lists them in nine landscape and portrait sizes for hotels, reception areas and leisure centres.",
      },
      {
        q: "Is a perforated board the same as a notice board?",
        a: "No. A perforated board is a black panel with a hole pattern in a golden anodized frame, for hooks and inserts, and it displays information vertically as well as horizontally. A notice board is a pin-up cloth, cork or fabric surface for sheets of paper.",
      },
    ],
  },
  {
    slug: "letters-and-figures-set-guide",
    title: "Letters and Figures Sets: Piece Counts, Sizes and How to Specify One",
    seoTitle: "Letters & Figures Set: Sizes and Piece Counts",
    description:
      "Letters and figures sets in 12, 18, 24 and 36 mm — 112 letters, 100 figures, punctuation and symbols included. How to pick the letter size.",
    excerpt:
      "112 letters, 100 figures, four sizes. What is actually in the set, and how to choose the letter size for your board.",
    topic: "Products",
    published: "2026-10-18",
    updated: "2026-10-18",
    readMinutes: 4,
    coverProduct: "letters-and-figures-set",
    intro: [
      "A letters and figures set is what turns a grooved or perforated display board into a board that can say something. Without it the board holds cards; with it the board spells out room numbers, function names, dates, rates and messages.",
      "Plusmark lists the set in four letter sizes — 12 mm, 18 mm, 24 mm and 36 mm — as a letters set of 112 pieces and a figures set of 100 pieces.",
    ],
    sections: [
      {
        heading: "What is in the set",
        body: [
          "The catalog gives the piece counts, and the distribution across digits is not even — which is deliberate, because some digits are used far more often than others.",
        ],
        table: {
          head: ["Item", "Count", "Notes"],
          rows: [
            ["Letters set", "112 pieces", "Alphabets for spelling out names and messages"],
            ["Figures 1, 5, 0", "14 each — 42 pieces", "The most-used digits, supplied in the highest quantity"],
            ["Figure 2", "10 pieces", ""],
            ["Figures 3, 4, 6", "8 each — 24 pieces", ""],
            ["Figures 7, 8, 9", "8 each — 24 pieces", ""],
            ["Figures set total", "100 pieces", ""],
            ["Punctuation and symbols", "Remaining pieces of the set", "Includes . , { } & % / and others"],
          ],
        },
      },
      {
        heading: "Choosing the letter size",
        body: [
          "The four sizes are chosen against the board and the reading distance, not against preference.",
        ],
        bullets: [
          "12 mm — dense text on a small board, read at close range: room numbers, key labels, small grooved cards",
          "18 mm — the general reception and counter size, readable from a few feet away",
          "24 mm — lobby and corridor boards where the message is read while walking past",
          "36 mm — large display boards and public areas where the board is read from across a room",
        ],
      },
      {
        heading: "Matching the set to the board",
        body: [
          "A set that is too large for the board crowds the message; a set that is too small disappears on it. Order the board and the letters together and quote both, since the board dimensions and the reading distance decide the size.",
          "It is also worth counting the longest message the board has to carry. A 112-piece letters set spells a reasonable number of short words, but a board that has to display long names repeatedly may need a second set.",
        ],
      },
      {
        heading: "Where sets are used",
        body: [
          "Hotels and reception areas use them on grooved boards for room numbers, function names and rate displays. Offices use them on perforated boards for department and personnel signage. Public places use the larger sizes for messages that have to be read from a distance.",
          "All three sit in the Display Boards collection in the Plusmark catalog, which is why grooved boards, perforated boards and letters and figures sets are usually ordered as one line of supply.",
        ],
      },
    ],
    related: ["display-boards", "letters-and-figures-set", "grooved-boards", "perforated-board"],
    faq: [
      {
        q: "What sizes do letters and figures sets come in?",
        a: "Plusmark lists four letter sizes: 12 mm, 18 mm, 24 mm and 36 mm. The letters set is 112 pieces and the figures set is 100 pieces.",
      },
      {
        q: "Are punctuation marks included?",
        a: "Yes. The catalog lists punctuation and symbols among the remaining pieces of the set, including . , { } & % / and others.",
      },
      {
        q: "Which letter size should a hotel reception board use?",
        a: "18 mm is the general reception and counter size, readable from a few feet away. Lobby and corridor boards that are read while walking past usually go to 24 mm.",
      },
    ],
  },
  {
    slug: "schedule-board-custom-design",
    title: "Custom Schedule Boards: Any Design, Any Size, Made to Your Sketch",
    seoTitle: "Custom Dry Wipe Schedule Boards",
    description:
      "Dry wipe schedule boards in any design and any size. What to send before ordering: quantity, sizes and a sketch in CorelDRAW, Photoshop or Word.",
    excerpt:
      "A schedule board is a printed layout, so the layout has to be settled first. Here is exactly what to send, and in what format.",
    topic: "Custom",
    published: "2026-10-17",
    updated: "2026-10-17",
    readMinutes: 4,
    coverProduct: "dry-wipe-schedule-board",
    intro: [
      "A dry wipe schedule board is not a blank board. It is a board with a printed layout — periods, days, shifts, batches, machines, rooms or doctors — and the layout is the product.",
      "That is why the catalog lists the Dry Wipe Schedule Board as available in any design and any size, made to your sketch and layout, with sketches accepted in CorelDRAW, Photoshop or Word files.",
    ],
    sections: [
      {
        heading: "The three things that have to be settled first",
        body: [
          "The catalog is explicit about what has to be provided before ordering. These three details are the whole specification.",
        ],
        bullets: [
          "Quantity of board — how many identical layouts you need",
          "Sizes of board — the dimensions each board has to be",
          "Sketch of board as per customer requirements — the layout itself",
        ],
      },
      {
        heading: "Accepted sketch formats",
        body: [
          "CorelDRAW, Photoshop and Word files are the formats listed in the catalog. A Word file is enough for a simple grid: rows and columns with the labels you want printed, and a note of which cells repeat.",
          "A CorelDRAW or Photoshop file is the better choice when the layout has a logo, colour bands, a fixed header, or a grid that has to line up with an existing printed form.",
        ],
      },
      {
        heading: "If Plusmark makes the design",
        body: [
          "The catalog notes that when Plusmark makes the design of a board, additional charges will be applicable. So there are two routes: send a finished sketch in one of the accepted formats, or send the content and ask for the design to be made — and expect the second route to carry a design charge.",
          "Either way the design is confirmed before the board goes into production, because a printed layout cannot be changed once it is on the surface.",
        ],
      },
      {
        heading: "Layouts that commonly get ordered",
        body: [
          "Schools order period grids and timetable boards, usually one per classroom with the same layout. Colleges and coaching centres order batch and faculty schedules. Factories order shift rosters, machine loading boards and production data panels. Hospitals and clinics order doctor and room duty charts.",
          "All of these are dry wipe, so the layout is printed once and the entries are written and erased every day.",
        ],
      },
      {
        heading: "Related custom work in the same range",
        body: [
          "Schedule boards are not the only made-to-design product in the catalog. Practice board line marking is provided as per school or customer requirements, fabric notice boards come in the customer's preferred fabric colour with the board layout as per requirement, and acrylic folder display boards are made with folder size and quantity as per customer requirement.",
          "If your order mixes a printed schedule board with any of those, send the whole requirement in one enquiry so the layouts are confirmed together.",
        ],
      },
    ],
    related: ["schedule-boards", "dry-wipe-schedule-board", "white-boards", "board-study-essentials"],
    faq: [
      {
        q: "What do I need to send to order a custom schedule board?",
        a: "The catalog lists three requirements: quantity of board, sizes of board, and a sketch of the board as per your requirements. Sketches are accepted in CorelDRAW, Photoshop or Word files.",
      },
      {
        q: "Can Plusmark design the layout for me?",
        a: "Yes. The catalog notes that when Plusmark makes the design of a board, additional charges will be applicable. The design is confirmed with you before the board goes into production.",
      },
      {
        q: "Can a schedule board be any size?",
        a: "The Dry Wipe Schedule Board is listed as available in any design and any size, made to your sketch and layout.",
      },
    ],
  },
  {
    slug: "frame-series-and-corners-guide",
    title: "Frames and Corners: What Separates the Four Plusmark Series",
    seoTitle: "Board Frames & Corners: Series Differences",
    description:
      "Signature Dual-Tone Corners, ABS Dual-Tone Corner Design, Electroplated Chrome Corners and standard plastic corners — how the four Plusmark series differ.",
    excerpt:
      "The corners are the fastest way to tell the series apart on a finished board. Here is what each one is, and what it is doing there.",
    topic: "Materials",
    published: "2026-10-16",
    updated: "2026-10-16",
    readMinutes: 5,
    coverProduct: "metallic-premium-notice-board",
    intro: [
      "Boards are compared on surface first, and that is right — the surface decides how the board writes and how long it stays readable. But two boards with identical surfaces can sit in different price and duty brackets, and the difference is the frame and the corners.",
      "Plusmark's quality documentation describes corners as the thing that defines each series: Signature Dual-Tone Corners on Metallic Premium, ABS Dual-Tone Corner Design on Eco Premium, Electroplated Chrome Corners on Deluxe Standard, and standard plastic corners on Eco Regular.",
    ],
    sections: [
      {
        heading: "The four series at a glance",
        body: [
          "Read this as a duty ladder rather than a quality ranking — each series is specified for a different intensity of use.",
        ],
        table: {
          head: ["Series", "Framing", "Corners", "Catalog applications"],
          rows: [
            ["Metallic Premium", "Heavy-duty aluminium framing; premium aluminium construction", "Signature Dual-Tone Corners", "High-end offices, educational institutions, professional environments"],
            ["Eco Premium", "Aluminium framing", "ABS Dual-Tone Corner Design for added strength and refined appearance", "Schools, institutes, corporate environments"],
            ["Deluxe Standard", "Aluminium frame", "Electroplated Chrome Corners for a clean and professional look", "Standard offices, classrooms, coaching centres"],
            ["Eco Regular", "Lightweight frame", "Standard plastic corners", "Home offices, tuition classes, small classrooms"],
          ],
        },
      },
      {
        heading: "What a corner piece is actually doing",
        body: [
          "A board corner is the joint where two frame members meet, and it is the point that takes the impact when a board is handled, transported, bumped by a chair or knocked in a corridor. It is also the most visible part of the frame from across a room.",
          "That is why the corner specification tracks the duty specification. A board going into a college corridor that runs all day gets a heavier corner treatment than a board going into a home study, and the series naming makes that visible without reading the full specification.",
        ],
      },
      {
        heading: "Dual-tone, chrome and plastic, in practice",
        body: [
          "Signature Dual-Tone Corners on Metallic Premium are the identifying detail of the top series, and the framing around them is described as heavy-duty aluminium. ABS Dual-Tone Corner Design on Eco Premium is specified for added strength and refined appearance — the same visual idea, in a lighter construction.",
          "Electroplated Chrome Corners on Deluxe Standard give the clean, professional look that offices and coaching centres want, with the catalog describing the series as dependable for regular use. Standard plastic corners on Eco Regular go with a lightweight frame that is easy to handle and install, which is the point of that series.",
        ],
      },
      {
        heading: "The same series logic applies to notice boards and ADC boards",
        body: [
          "Notice boards run the same four series: Metallic Premium with premium aluminium construction and Signature Dual-Tone Corners, Eco Premium with premium-grade construction, Deluxe Standard with Electroplated Chrome Corners, and Eco Regular with economical materials and standard plastic corners.",
          "Acrylic door cover boards use their own framing language — Deluxe 45 mm Triple Aluminium Framing on the Deluxe models, and lightweight aluminium framing on ECO. Cork, fabric and combination boards are available in Metallic Premium, Eco Premium and Deluxe frame variants.",
        ],
      },
      {
        heading: "How to use this when ordering",
        body: [
          "Pick the surface for the room first — marker, chalk, magnetic, ceramic or pin-up. Then pick the series by how hard the room works and how visible the installation is. A reception wall in a corporate office justifies Metallic Premium; a tuition room does not.",
          "Warranty is provided on every board Plusmark manufactures, and the series you choose changes what the cover should say — so the authorised distributor or marketing executive confirms it for that specific board rather than a blanket figure.",
        ],
      },
    ],
    related: ["white-boards", "notice-boards", "chalk-boards", "metallic-premium-white-board", "eco-premium-white-board", "deluxe-standard-white-board", "eco-regular-white-board", "metallic-premium-notice-board"],
    faq: [
      {
        q: "What are Signature Dual-Tone Corners?",
        a: "They are the corner specification on Plusmark Metallic Premium boards, paired with heavy-duty aluminium framing. Plusmark's quality documentation describes corners as what defines each series.",
      },
      {
        q: "Which series is best for a school?",
        a: "It depends on the room. Eco Premium is listed for schools, institutes and corporate environments with ABS Dual-Tone Corner Design for added strength, while Metallic Premium is specified for educational institutions and professional environments with heavy-duty framing.",
      },
    ],
  },
  {
    slug: "school-classroom-board-setup",
    title: "Setting Up a School Block: Boards, Practice Boards, Benches and Stands",
    seoTitle: "School Classroom Board Setup Guide",
    description:
      "What a school block needs: chalk and white boards, notice boards, practice boards, school benches and board stands — room by room.",
    excerpt:
      "A school order is not one board repeated. Here is what each room type needs, and how the pieces of a block order fit together.",
    topic: "Industries",
    published: "2026-10-15",
    updated: "2026-10-15",
    readMinutes: 6,
    coverProduct: "metallic-premium-chalk-board",
    intro: [
      "Schools are the largest single category in the Plusmark client list, and a school order rarely looks like one product repeated. A block needs teaching boards in every room, notice display in the corridors and staff areas, practice boards in the primary section, and seating and stands across the whole thing.",
      "This is how the pieces fit together, room by room, using the ranges listed in the catalog.",
    ],
    sections: [
      {
        heading: "Teaching boards, by room type",
        body: [
          "The surface choice follows how the room is taught and how hard it is used.",
        ],
        table: {
          head: ["Room", "Board", "Why"],
          rows: [
            ["Primary and middle classrooms", "Chalk board — non-magnetic or magnetic", "Chalk Grade HPL Sheet is non-reflective and glare-free with clear visibility from all angles"],
            ["Science and maths rooms", "Magnetic chalk board", "Resin coated green surface accepts magnets, so charts and diagrams go up beside the working"],
            ["Computer, language and smart-class rooms", "White board", "High Gloss Marker Grade HPL for marker writing, easy to erase"],
            ["Intensively used rooms", "Ceramic board", "Ceramic steel / porcelain enamel steel, hard and non-porous, for very long product life"],
            ["Rooms that need both writing types", "Double-sided board", "Marker on the front, chalk on the back, in one frame"],
          ],
        },
      },
      {
        heading: "Which series for a school",
        body: [
          "Metallic Premium is specified for schools, colleges, offices and institutional classrooms, with heavy-duty aluminium framing and Signature Dual-Tone Corners. Eco Premium is listed for schools, institutes and corporate environments. Deluxe Standard serves classrooms and coaching centres, and Eco Regular serves home classrooms, tuition classes and small institutions.",
          "A block order usually mixes: the heavily used rooms and the corridor-facing installations get the higher series, and the lighter-use rooms get Deluxe Standard or Eco Regular.",
        ],
      },
      {
        heading: "Notice display across the school",
        body: [
          "Notice boards go in corridors, staff rooms, assembly areas and administrative blocks. The four series run from 2 mm Blazer Cloth with a soft pin-friendly core on Metallic Premium — specified for frequent and heavy pin usage — to Super Fine Velvet Cloth on Deluxe Standard and Eco Regular.",
          "Where notices have to be protected or controlled, the acrylic door cover boards are the specification: a transparent acrylic door with a locking system, in Deluxe 45 mm triple aluminium framing or ECO lightweight framing. Institutional buyers usually raise this specification through the GEM Portal, on which Plusmark is an approved brand.",
        ],
      },
      {
        heading: "Primary section and study furniture",
        body: [
          "The Four Line & Square Line Practice Board is listed for primary and early learning classes, for handwriting improvement — letter size, spacing and alignment — with a square grid section for accurate number writing and basic maths practice. Line marking is provided as per school requirements.",
          "The Homework Table, a foldable student study table with a 16 × 24 inch white board writing surface and a 9.5 inch height, serves hostel study rooms, reading halls and activity rooms. School benches are the seating side of the same order: fifteen models are listed, PDS-SB 801 to PDS-SB 815, with dimensions and seating configuration confirmed on enquiry.",
        ],
      },
      {
        heading: "Stands and movement between rooms",
        body: [
          "Not every board belongs to a wall. Training rooms, remedial classes and activity periods move boards between spaces, and the stand range covers three leg, four leg, revolving, zig zag and telescopic stands — plus newspaper stands, magazine stands and file racks for the library and staff room.",
          "A revolving stand is the one to specify where a double-sided board is used on both faces, since the board turns over without being lifted.",
        ],
      },
      {
        heading: "How to structure the enquiry",
        body: [
          "One enquiry per block works better than one per product. Send the room-wise requirement — board type, surface, size and quantity — followed by the notice display requirement, the primary-section items and the furniture. Custom work such as practice board line marking or a printed schedule board needs the sketch attached, in CorelDRAW, Photoshop or Word.",
          "Every item on that list is covered by Plusmark's manufacturing warranty; the distributor or marketing executive confirms what applies to each board once the requirement is in front of them.",
        ],
      },
    ],
    related: ["chalk-boards", "white-boards", "notice-boards", "acrylic-door-cover-notice-boards", "board-study-essentials", "school-benches", "board-stands", "four-line-square-line-practice-board", "metallic-premium-chalk-board", "pds-sb-807"],
    faq: [
      {
        q: "Which board surface is best for a school classroom?",
        a: "Chalk boards with Chalk Grade HPL Sheet are the standard classroom specification — non-reflective, glare-free, with clear visibility from all angles. Rooms used intensively are specified with ceramic steel / porcelain enamel steel surfaces for very long product life.",
      },
      {
        q: "Does Plusmark supply schools through the GEM Portal?",
        a: "Yes. Plusmark is a GEM Portal approved brand, authorised for school and government supplies, reflecting quality standards, regulatory compliance and transparent business practices.",
      },
      {
        q: "Are school benches available?",
        a: "Yes. The catalog lists fifteen school bench models, PDS-SB 801 to PDS-SB 815. Dimensions, materials and seating configuration are confirmed on enquiry.",
      },
    ],
  },
  {
    slug: "office-and-meeting-room-boards",
    title: "Boards for Offices: Meeting Rooms, Cabins, Reception and Admin Blocks",
    seoTitle: "Office & Meeting Room Board Guide",
    description:
      "What an office needs: magnetic white boards for planning walls, notice boards for admin areas, key hanger and grooved boards for reception.",
    excerpt:
      "An office needs four different boards, not four of the same one. Here is which room gets which, and why.",
    topic: "Industries",
    published: "2026-10-14",
    updated: "2026-10-14",
    readMinutes: 5,
    coverProduct: "metallic-premium-white-board",
    intro: [
      "Office orders go wrong in one predictable way: the same board is ordered for every room, and then the meeting room board cannot hold a chart, the reception display cannot be changed without a ladder, and the admin notices get pinned to a wall.",
      "Each area has a different job. The Plusmark catalog lists the products for each, and the applications on those products say which room they belong in.",
    ],
    sections: [
      {
        heading: "Meeting rooms and planning walls",
        body: [
          "This is where a magnetic surface earns its keep. Plusmark magnetic white boards use a resin coated steel surface that accepts magnets, and the catalog lists compatibility with magnets, charts and holders — so a planning wall can carry today's writing and this quarter's chart at the same time.",
          "Metallic Premium is listed for high-end offices and professional environments, with High Gloss Marker Grade HPL Sheet on the non-magnetic version and heavy-duty framing with Signature Dual-Tone Corners. Deluxe Standard serves standard offices with Electroplated Chrome Corners for a clean, professional look.",
        ],
      },
      {
        heading: "Cabins and small rooms",
        body: [
          "A cabin needs a writing surface and not much else, which makes the non-magnetic range the sensible order: High Gloss Marker Grade HPL on Metallic Premium and Eco Premium, High Gloss Melamine on Deluxe Standard and Eco Regular. Both write and erase the same way; the difference is the framing and the corners.",
          "Where the cabin wall is narrow, a double-sided board gives marker on one face and chalk on the other in a single frame, with quick wall-mount installation that allows horizontal or vertical hanging.",
        ],
      },
      {
        heading: "Admin blocks and staff areas",
        body: [
          "Notice display is a pin-up job, and the notice board range covers it: 2 mm Blazer Cloth with a soft pin-friendly core for frequent and heavy pin usage on Metallic Premium, 2 mm Blazer Cloth on Eco Premium, and Super Fine Velvet Cloth on Deluxe Standard and Eco Regular.",
          "Where notices have to be controlled — policy documents, statutory notices, circulars that must not be removed by anyone but the custodian — the acrylic door cover boards are the specification, with a transparent acrylic door and a locking system. Combination boards are the alternative where a team needs to write and pin on one board: dry wipe white board on one side, fabric notice board on the other.",
        ],
      },
      {
        heading: "Reception and front of house",
        body: [
          "Reception is a display job, not a pin-up job. Grooved boards hold printed cards in nine landscape and portrait sizes and are listed for hotels, reception areas and leisure centres. Perforated boards — black panels with a golden anodized frame — display information vertically as well as horizontally, and take hooks and holders.",
          "A Letters & Figures Set in 18 mm or 24 mm is what makes either board able to spell out a message, and the Key Hanger Board handles room, cabinet and vehicle keys behind a lockable acrylic door with clear visibility of keys.",
        ],
      },
      {
        heading: "Sizing an office order",
        body: [
          "Work room by room rather than product by product. For each room, settle three things: what has to be written, what has to be displayed, and whether anything needs to be locked.",
          "Send that as a single enquiry with sizes and quantities. Standard white board sizes run from 1 × 1 ft to 3 × 4 ft across the series, and custom sizes are made to requirement.",
        ],
      },
    ],
    related: ["white-boards-magnetic", "white-boards", "notice-boards", "display-boards", "grooved-boards", "perforated-board", "key-hanger-board", "combination-board", "metallic-premium-white-board"],
    faq: [
      {
        q: "Which board is best for an office meeting room?",
        a: "A magnetic white board. The resin coated steel surface accepts magnets, charts and holders, so the room can carry both working notes and standing displays. Metallic Premium is listed for high-end offices and professional environments.",
      },
      {
        q: "What should a reception area use instead of a notice board?",
        a: "A grooved board for printed cards, or a perforated board with a golden anodized frame for hooks and inserts, with a Letters & Figures Set to spell out messages. Both are listed for reception areas, hotels and public places.",
      },
    ],
  },
  {
    slug: "factory-shopfloor-display-boards",
    title: "Shop Floor Display: SOPs, Production Data and Key Control in a Factory",
    seoTitle: "Factory & Shop Floor Display Boards",
    description:
      "Acrylic folder boards for SOPs and production data, key hanger boards for workshops, schedule boards for shift rosters — the industrial range.",
    excerpt:
      "A factory wall has to hold documents, not just notices. Which board carries SOPs, which carries the shift roster, and which holds the keys.",
    topic: "Industries",
    published: "2026-10-13",
    updated: "2026-10-13",
    readMinutes: 5,
    coverProduct: "acrylic-folder-display-board",
    intro: [
      "Industrial display is a different problem from office display. The material on the wall is a controlled document — an SOP, a work instruction, a production data sheet, a shift roster — and it has to stay legible, stay in place and stay current in a dusty, handled, high-traffic environment.",
      "Plusmark lists Factories & Industrial Units among the industries served, with acrylic folder display boards for charts, reports, SOPs and production data, and lockable key hanger boards for companies and workshops.",
    ],
    sections: [
      {
        heading: "SOPs and work instructions: acrylic folder display boards",
        body: [
          "This is the product built for the job. An Acrylic Folder Display Board keeps the document behind a transparent front folder, so an SOP is readable through the cover instead of pinned on a wall where it fades. The catalog positions it for organised display of charts, reports and production data.",
          "Two details decide whether it survives on a shop floor. Revisions have to be painless — papers slip in and out of the folders without tools or pins, which is what keeps a superseded work instruction off the wall. And the folders are made to your document size and quantity rather than a fixed grid, inside a strong aluminium frame rated for industrial use.",
        ],
      },
      {
        heading: "Production data and shift rosters: dry wipe schedule boards",
        body: [
          "Printed folders hold what does not change. Daily numbers need a surface that is written on and wiped. The Dry Wipe Schedule Board is available in any design and any size, made to your sketch — shift rosters, machine loading panels, hourly output grids, quality check charts.",
          "Ordering one needs three details: quantity, sizes, and a sketch of the layout in CorelDRAW, Photoshop or Word. Where Plusmark makes the design, the catalog notes additional charges will be applicable.",
        ],
      },
      {
        heading: "Key control: lockable key hanger boards",
        body: [
          "Machine panel keys, vehicle keys, cabinet and store keys change hands every shift. The Key Hanger Board has a lockable acrylic door with clear visibility of keys, so the count is checkable without opening the board, and one custodian controls what leaves it.",
          "Capacities are listed by board size: 15 / 20 keys at 1 × 1.5 ft, 30 at 1.5 × 2 ft, 50 at 2 × 2 ft, 100 at 2 × 3 ft and 150 at 3 × 4 ft. Count the keys including spares before choosing.",
        ],
      },
      {
        heading: "Notices and statutory display: ADC boards",
        body: [
          "Statutory notices, safety instructions and policy documents need protection and control, which is what the acrylic door cover boards provide — a transparent acrylic door that protects notices from dust, moisture and handling, with a locking system. The catalog lists offices, institutions, housing societies, hospitals and public areas as applications, and ECO single door models are listed for regular indoor applications.",
          "Where a team needs to write and pin on one board, the Combination Board gives a dry wipe white board on one side and a fabric notice board on the other.",
        ],
      },
      {
        heading: "Boards that move with the shift",
        body: [
          "A shift review does not always happen in the same place. Board stands — three leg, four leg, revolving, zig zag and telescopic — let a board go to where the team is standing, and a zig zag stand packs flat between sessions. The catalog lists these by name, with specifications confirmed on enquiry against the board going on the stand.",
          "For safety provision in the same area, the range also carries first aid boxes, letter boxes and file racks.",
        ],
      },
      {
        heading: "Structuring an industrial order",
        body: [
          "Send the requirement by location rather than by product: what goes up at each machine, each department notice point, the supervisor's desk and the gate. Folder size and quantity for the display boards, the layout sketch for any schedule board, and the key count for the hanger boards.",
          "Boards on a shopfloor take the hardest treatment of anything in this catalog, so it is worth knowing that Plusmark gives a warranty on everything it manufactures. The authorised distributor or marketing executive settles the terms for the specific boards in your order.",
        ],
      },
    ],
    related: ["specialty-boards", "acrylic-folder-display-board", "schedule-boards", "dry-wipe-schedule-board", "key-hanger-board", "acrylic-door-cover-notice-boards", "board-stands", "combination-board"],
    faq: [
      {
        q: "Which board is best for displaying SOPs on a shop floor?",
        a: "The Acrylic Folder Display Board. It has transparent front folders for clear document viewing, papers can be inserted and replaced quickly, and folder size and quantity are made as per customer requirement in a strong aluminium frame suitable for industrial use.",
      },
      {
        q: "Can a shift roster board be made to our layout?",
        a: "Yes. The Dry Wipe Schedule Board is available in any design and any size, made to your sketch. Send the quantity, sizes and a sketch in CorelDRAW, Photoshop or Word.",
      },
    ],
  },
  {
    slug: "coaching-centre-board-guide",
    title: "Boards for Coaching Centres and Tuition Classes",
    seoTitle: "Coaching Centre & Tuition Class Boards",
    description:
      "Which series and surfaces suit coaching centres and tuition classes — Deluxe Standard, Eco Premium and Eco Regular, chalk, white boards and stands.",
    excerpt:
      "Coaching rooms are used back to back, often by different teachers, and sometimes shared. What to specify so the board survives the timetable.",
    topic: "Industries",
    published: "2026-10-12",
    updated: "2026-10-12",
    readMinutes: 4,
    coverProduct: "deluxe-standard-white-board",
    intro: [
      "A coaching centre is a harder environment than a school classroom in one specific way: the same room runs back-to-back batches, often with different teachers, and the board gets written on and erased far more times per day than the timetable suggests.",
      "Plusmark lists Training & Coaching Centers among the industries served, with boards suited to coaching centres, training rooms and tuition classes across the Deluxe Standard, Eco Premium and Eco Regular series.",
    ],
    sections: [
      {
        heading: "Chalk or marker, batch by batch",
        body: [
          "Most coaching centres still teach maths and science on chalk, because long derivations are easier to write and easier to see from the back row. Plusmark chalk boards use Chalk Grade HPL Sheet — described in the catalog as non-reflective and glare-free, with clear visibility from all angles, which is the property that matters most in a room where students sit at an angle to the board.",
          "Marker boards are the choice for rooms that also handle printed sheets, diagrams and annotation. High Gloss Marker Grade HPL on Eco Premium, High Gloss Melamine on Deluxe Standard and Eco Regular.",
          "Where a centre wants both without two boards, the double-sided board gives marker on the front and chalk on the back in one frame.",
        ],
      },
      {
        heading: "Which series fits a coaching centre",
        body: [
          "Deluxe Standard is listed for classrooms, coaching centres and offices, with Electroplated Chrome Corners for a clean finish — the usual specification for a centre that wants the room to look professional without institutional framing.",
          "Eco Premium is listed for classrooms, training rooms and offices, with ABS Dual-Tone Corner Design for added strength and refined appearance. Eco Regular is listed for home classrooms, tuition classes and small institutions, with a lightweight frame that is easy to handle and install.",
        ],
        table: {
          head: ["Setting", "Series", "Corners and frame"],
          rows: [
            ["Established centre, full-day batches", "Eco Premium", "ABS Dual-Tone Corner Design, aluminium framing"],
            ["Standard coaching rooms", "Deluxe Standard", "Electroplated Chrome Corners, aluminium frame"],
            ["Tuition classes, small batches, home classrooms", "Eco Regular", "Standard plastic corners, lightweight frame"],
          ],
        },
      },
      {
        heading: "Display beside the board",
        body: [
          "Answer keys, revision sheets, batch timetables and result notices all need a place. A magnetic board puts them beside the working — resin coated steel surfaces accept magnets, charts and holders. A notice board puts them on the wall beside the room: Super Fine Velvet Cloth on Deluxe Standard, 2 mm Blazer Cloth on Eco Premium for regular institutional use.",
          "Batch timetables that change weekly are a dry wipe schedule board, made to your sketch in any design and any size.",
        ],
      },
      {
        heading: "Shared rooms and moving boards",
        body: [
          "Centres that run batches in several rooms often get more out of a movable board than a fixed one. A board stand lets the surface travel with the batch — three leg and four leg stands for stability, revolving for double-sided boards, zig zag to pack flat between sessions, telescopic where the height has to change between age groups.",
          "Wall mounting is still the better answer for a room with one fixed teaching position and a clear wall.",
        ],
      },
      {
        heading: "Ordering for a centre",
        body: [
          "Send the room count, the board type and size per room, and whether any room needs a stand. Standard sizes run from 1 × 1 ft up to 3 × 4 ft across the series, and larger or non-standard sizes are made to requirement.",
        ],
      },
    ],
    related: ["white-boards", "chalk-boards", "notice-boards", "schedule-boards", "board-stands", "double-sided-boards", "deluxe-standard-white-board", "eco-premium-chalk-board", "eco-regular-white-board"],
    faq: [
      {
        q: "Which series is best for a coaching centre?",
        a: "Deluxe Standard is listed for classrooms, coaching centres and offices, with Electroplated Chrome Corners. Eco Premium suits training rooms with ABS Dual-Tone Corner Design for added strength, and Eco Regular suits tuition classes and small institutions.",
      },
      {
        q: "Should a coaching centre use chalk boards or white boards?",
        a: "Both have a place. Chalk Grade HPL Sheet is non-reflective and glare-free with clear visibility from all angles, which suits long derivations. White boards suit rooms that annotate printed sheets and diagrams. A double-sided board carries both in one frame.",
      },
    ],
  },
  {
    slug: "college-university-board-specification",
    title: "Specifying Boards for Colleges and Universities",
    seoTitle: "College & University Board Specification",
    description:
      "Ceramic steel for very long product life, heavy-duty framing, notice display and acrylic folder boards — specifying for intensive use.",
    excerpt:
      "Lecture halls and department corridors are the hardest duty a board gets. Here is what to specify, and where the extra money actually goes.",
    topic: "Industries",
    published: "2026-10-11",
    updated: "2026-10-11",
    readMinutes: 5,
    coverProduct: "metallic-premium-ceramic-board",
    intro: [
      "A college lecture hall writes on a board for more hours per day than almost any other room, and a department corridor displays notices that stay up for a term. Both are high duty, and both are usually specified too cheaply the first time.",
      "Plusmark lists Colleges & Universities among the industries served, with boards built for intensive daily institutional use including ceramic steel surfaces designed for very long product life.",
    ],
    sections: [
      {
        heading: "Lecture halls: specify ceramic",
        body: [
          "Ceramic steel / porcelain enamel steel is the surface for continuous writing. The catalog describes it as designed for very long product life under regular institutional use, hard and non-porous, suitable for continuous writing and frequent cleaning, with a smooth surface and consistent performance over time.",
          "Ceramic boards are available in white board (marker writing) and chalk board (chalk writing) options, so the choice of writing type does not force a compromise on the surface. Both ceramic variants are also magnetic — the chalk version is described as scratch-proof, hard and non-porous, glare-free with excellent chalk visibility from all angles.",
        ],
      },
      {
        heading: "Where Metallic Premium earns its framing",
        body: [
          "Metallic Premium is listed for high-end offices, educational institutions and professional environments, with heavy-duty framing and Signature Dual-Tone Corners on white boards, and heavy-duty aluminium framing on chalk boards with rigid core construction.",
          "A lecture hall board is bumped, leaned on and cleaned several times a day. The frame and corner specification is what keeps it square and intact through that, which is why the top series is the sensible specification for halls even when the surface alone would do the job.",
        ],
      },
      {
        heading: "Department corridors and notice display",
        body: [
          "Corridor notice display takes two forms. Open notice boards — 2 mm Blazer Cloth with a soft pin-friendly core for frequent and heavy pin usage on Metallic Premium — suit departmental boards that are changed often by staff.",
          "Where notices are statutory, exam-related or must not be altered, acrylic door cover boards are the specification: a transparent acrylic door protecting notices from dust, moisture and handling, with a locking system, in Deluxe 45 mm triple aluminium framing (single door 2 × 3 ft to 4 × 4 ft, double door 5 × 4 ft to 8 × 4 ft) or ECO lightweight framing.",
        ],
      },
      {
        heading: "Departmental document display",
        body: [
          "Departments that publish syllabi, timetables, lab instructions and research notices get more out of an acrylic folder display board than a pin board: transparent front folders for clear document viewing, papers inserted and replaced quickly, folder size and quantity as per requirement, in a strong aluminium frame.",
          "Laboratories and workshops add a lockable key hanger board for equipment and room keys, with capacities from 15 / 20 keys up to 150 keys.",
        ],
      },
      {
        heading: "Seminar rooms, hostels and reading halls",
        body: [
          "Seminar rooms are non-magnetic marker boards — the room writes and wipes and nothing else lives on the surface, so the budget goes into size. Hostels and reading halls use newspaper stands and magazine stands from the same catalog range, and Homework Tables serve study rooms where a foldable table with a 16 × 24 inch white board writing surface is more practical than a fixed desk.",
        ],
      },
      {
        heading: "How to put the specification together",
        body: [
          "List the locations, and for each one settle three things: the writing or display function, the duty level, and the size. Then assign the series by duty — ceramic or Metallic Premium for halls and corridors, Eco Premium and Deluxe Standard for classrooms and seminar rooms.",
          "Plusmark is a GEM Portal approved brand authorised for school and government supplies, and supplies Pan India. Their boards carry a manufacturing warranty, and the tender language for it is settled with the authorised distributor or marketing executive.",
        ],
      },
    ],
    related: ["white-boards-ceramic", "chalk-boards-ceramic", "white-boards", "notice-boards", "acrylic-door-cover-notice-boards", "specialty-boards", "metallic-premium-ceramic-board", "metallic-premium-white-board", "board-stands"],
    faq: [
      {
        q: "Which board surface lasts longest in a lecture hall?",
        a: "Ceramic steel / porcelain enamel steel. It is described in the catalog as hard and non-porous, suitable for continuous writing and frequent cleaning, and designed for very long product life under regular institutional use.",
      },
      {
        q: "Are ceramic boards magnetic?",
        a: "Yes. Plusmark ceramic boards are listed as ceramic steel magnetic boards, in white board and chalk board options, so display capability is not lost by choosing the harder surface.",
      },
    ],
  },
  {
    slug: "government-institution-notice-boards",
    title: "Notice Boards for Government Offices and Public Institutions",
    seoTitle: "Government & Institution Notice Boards",
    description:
      "GEM Portal approved notice board and acrylic door cover supply for government offices, institutions, hospitals and public areas.",
    excerpt:
      "Public notice display has to be durable, controlled and procured through the right channel. What to specify, and how the GEM route works.",
    topic: "Industries",
    published: "2026-10-10",
    updated: "2026-10-11",
    readMinutes: 5,
    coverProduct: "deluxe-45mm-adc-notice-board-single-door",
    intro: [
      "Government and institutional notice display has requirements a private office does not: notices are statutory, they are read by the public, they must not be removed or altered by anyone but the custodian, and the installation has to survive years of handling in a corridor.",
      "Plusmark is a GEM Portal approved brand, authorised for school and government supplies, reflecting a commitment to quality standards, regulatory compliance and transparent business practices. Notice boards and acrylic door cover notice boards are the range usually ordered through that route.",
    ],
    sections: [
      {
        heading: "Open notice boards for internal display",
        body: [
          "Staff rooms, departmental boards and internal circulation points use open pin-up boards. The four series differ by cloth and core.",
        ],
        table: {
          head: ["Series", "Surface", "Core and corners", "Listed for"],
          rows: [
            ["Metallic Premium", "2 mm Blazer Cloth with long-lasting colour retention", "Soft pin-friendly core for frequent and heavy pin usage; Signature Dual-Tone Corners", "Schools, colleges, corporate offices, government offices"],
            ["Eco Premium", "2 mm Blazer Cloth", "Soft core material for repeated pinning", "Classrooms, offices, institutions"],
            ["Deluxe Standard", "Super Fine Velvet Cloth for everyday pin usage", "Soft core for normal pin use; Electroplated Chrome Corners", "Classrooms, coaching centres, offices"],
            ["Eco Regular", "Super Fine Velvet Cloth", "Soft core for light pin usage; standard plastic corners", "Home classrooms, tuition classes, small offices"],
          ],
        },
      },
      {
        heading: "Lockable acrylic door cover boards for public display",
        body: [
          "Where a notice has to be protected and controlled, the ADC board is the specification. A transparent acrylic door cover protects notices from dust, moisture and handling, and a locking system means only the custodian changes what is displayed.",
          "Three models are listed: Deluxe 45 MM single door in 2 × 3 ft, 2 × 4 ft, 3 × 4 ft and 4 × 4 ft; Deluxe 45 MM double door in 5 × 4 ft, 6 × 4 ft and 8 × 4 ft; and ECO single door in 1.5 × 2 ft, 2 × 3 ft, 2 × 4 ft, 3 × 4 ft and 4 × 4 ft. Deluxe models use 45 mm Triple Aluminium Framing for strength, stability and long-term durability; ECO uses lightweight aluminium framing for economical and practical use.",
          "The catalog lists offices, institutions, housing societies, hospitals and public areas as the applications for the double door model — which is the widest duty of the three.",
        ],
      },
      {
        heading: "Hospitals and public areas",
        body: [
          "Hospitals need display that survives cleaning and handling: duty charts, doctor rosters, statutory notices, patient information. The acrylic door cover protects the sheet from moisture and frequent touching, and the lock keeps the content controlled.",
          "Public areas add a vandalism consideration, which is another reason the triple aluminium framing is specified over lightweight framing for high-traffic installations.",
        ],
      },
      {
        heading: "Document display and key control in the same order",
        body: [
          "Institutions that publish SOPs, forms and circulars as documents rather than pinned sheets use acrylic folder display boards — transparent front folders for clear document viewing, papers inserted and replaced quickly, folder size and quantity as per customer requirement in a strong aluminium frame.",
          "Admin blocks add lockable key hanger boards for room, store and vehicle keys, with clear visibility of keys behind the door and capacities from 15 / 20 keys to 150 keys.",
        ],
      },
      {
        heading: "Procurement notes",
        body: [
          "Plusmark operates across India and supplies products nationwide, and is recognised as a dependable manufacturing partner known for consistent quality and timely delivery. The company was established in 2015 and manufactures at Narolgam, Ahmedabad.",
          "Warranty is provided on all products manufactured by Plusmark. The catalog asks customers to confirm warranty terms with the authorised distributor or marketing executive, so warranty language in a tender response is confirmed per order rather than quoted as a fixed duration.",
          "For a tender or a GEM order, send the model, framing, size, quantity and installation location through the enquiry form and the specification gets confirmed against it.",
        ],
      },
    ],
    related: ["acrylic-door-cover-notice-boards", "notice-boards", "specialty-boards", "deluxe-45mm-adc-notice-board-single-door", "deluxe-45mm-adc-notice-board-double-door", "metallic-premium-notice-board", "key-hanger-board"],
    faq: [
      {
        q: "Is Plusmark approved on the GEM Portal?",
        a: "Yes. Plusmark is a GEM Portal approved brand, authorised for school and government supplies, reflecting a commitment to quality standards, regulatory compliance and transparent business practices.",
      },
      {
        q: "Which notice board should a government office use for public display?",
        a: "An acrylic door cover notice board. The transparent acrylic door protects notices from dust, moisture and handling and the locking system controls who can change them. The double door model is listed for offices, institutions, housing societies, hospitals and public areas.",
      },
      {
        q: "Does Plusmark supply across India?",
        a: "Yes. Plusmark operates across India and supplies products nationwide from its manufacturing base at Narolgam, Ahmedabad.",
      },
    ],
  },
  {
    slug: "dealer-distributor-range-order",
    title: "Ordering a Range: What Dealers and Distributors Specify",
    seoTitle: "Dealer & Distributor Board Range Orders",
    description:
      "How a dealer orders across the range — white, chalk, notice, ceramic and magnetic boards, benches, stands and clipboards, supplied Pan India.",
    excerpt:
      "A range order is a different document from a retail order. How to structure it so the specification does not get lost in the middle.",
    topic: "Buying",
    published: "2026-10-09",
    updated: "2026-10-09",
    readMinutes: 5,
    coverProduct: "deluxe-standard-white-board",
    intro: [
      "Dealers and distributors order differently from an institution. An institution buys for rooms; a dealer buys for a market, which means a spread across series, surfaces and sizes rather than a bulk quantity of one item.",
      "Plusmark lists Dealer & Distributors among the industries served — a complete manufacturing range of white, chalk, notice, ceramic and magnetic boards, school benches and all types of board stands, supplied Pan India.",
    ],
    sections: [
      {
        heading: "The range, as the catalog lists it",
        body: [
          "These are the product groups a dealer is choosing across. Each one carries its own series and size spread.",
        ],
        bullets: [
          "White Boards — non-magnetic (High Gloss Marker Grade HPL Sheet and melamine), magnetic (resin coated steel) and ceramic (porcelain enamel steel)",
          "Chalk Boards — non-magnetic (Hardcore Chalk Grade HPL Sheet), magnetic (resin coated green steel) and ceramic (porcelain enamel green steel)",
          "Double-Sided Boards — marker on one side, chalk on the other, in premium aluminium anodised frames",
          "Notice Boards — Blazer Cloth, Velvet Cloth, Cork, Fabric and Combination surfaces",
          "Acrylic Door Cover Notice Boards — Deluxe 45 mm single and double door, and ECO single door",
          "Specialty Display Boards — Acrylic Folder Display Boards with folder size and quantity to requirement",
          "Display Boards — grooved boards in nine landscape and portrait sizes, black perforated boards, letters and figures sets",
          "Board & Study Essentials — practice boards, key hanger boards, homework tables",
          "Board Stands & Storage — three leg, four leg, revolving, zig zag and telescopic stands, newspaper and magazine stands, file racks, first aid boxes, letter boxes",
          "Clipboards — MDF bases (Pre-Lam, Graphic, Laminate) and acrylic bases (Crystal Clear, Heavy-Duty Clear, Crystal Colour)",
          "School Benches — fifteen models, PDS-SB 801 to PDS-SB 815",
          "Schedule Boards — dry wipe, any design and any size to your sketch",
        ],
      },
      {
        heading: "The four series, which is where the spread comes from",
        body: [
          "Most board products run across four construction series, and a dealer order usually takes a position in each rather than stocking one.",
        ],
        table: {
          head: ["Series", "Corners", "Position"],
          rows: [
            ["Metallic Premium", "Signature Dual-Tone Corners", "Heavy-duty framing; high-end offices, educational institutions, professional environments"],
            ["Eco Premium", "ABS Dual-Tone Corner Design", "Added strength and refined appearance; schools, institutes, corporate environments"],
            ["Deluxe Standard", "Electroplated Chrome Corners", "Dependable for regular use; standard offices, classrooms, coaching centres"],
            ["Eco Regular", "Standard plastic corners", "Lightweight and economical; home offices, tuition classes, small classrooms"],
          ],
        },
      },
      {
        heading: "Sizes to plan a stocking position around",
        body: [
          "Standard white board sizes run from 1 × 1 ft up to 3 × 4 ft depending on series — Metallic Premium is listed in 2 × 3 ft, 2 × 4 ft and 3 × 4 ft, while Eco Premium runs the full spread from 1 × 1 ft through 1.5 × 2 ft and 2 × 2 ft to 3 × 4 ft. Acrylic door cover boards run larger, up to 8 × 4 ft on the double door model.",
          "Custom sizes are made to requirement, so a dealer's stock position covers the standard spread and passes custom requests through to manufacturing.",
        ],
      },
      {
        heading: "What to put in the enquiry",
        body: [
          "A range order reads better as a table than a paragraph. For each line: product group, series, surface type, size, quantity. Then add the items that need a specification attached — folder size and quantity for acrylic folder display boards, fabric colour and layout for fabric notice boards, line marking for practice boards, and a sketch in CorelDRAW, Photoshop or Word for schedule boards.",
          "Stand and bench models are listed by name in the catalog, so those lines need the intended board size or the model number quoted rather than a specification you have to guess at.",
        ],
      },
      {
        heading: "Supply and terms",
        body: [
          "Plusmark operates across India and supplies products nationwide, and is a GEM Portal approved brand authorised for school and government supplies — which matters to dealers who sell into institutional and government channels.",
          "Warranty covers everything Plusmark manufactures, and a dealer resells it on the terms the authorised distributor or marketing executive confirms. Rates, lead times and minimum order quantities are not published on the site; they are settled against the specific requirement through the same channel.",
        ],
      },
    ],
    related: ["white-boards", "chalk-boards", "notice-boards", "board-stands", "clipboards", "school-benches", "display-boards", "specialty-boards", "deluxe-standard-white-board", "three-leg-stand", "laminate-mdf-base-clipboard"],
    faq: [
      {
        q: "Does Plusmark supply dealers and distributors across India?",
        a: "Yes. Plusmark operates across India and supplies products nationwide, and lists Dealer & Distributors among the industries served with a complete manufacturing range of white, chalk, notice, ceramic and magnetic boards, school benches and all types of board stands.",
      },
      {
        q: "Are rates and minimum order quantities published?",
        a: "No. Rates, lead times and order quantities are confirmed against the specific requirement through the authorised distributor or marketing executive rather than published on the site.",
      },
    ],
  },
  {
    slug: "white-board-size-chart-feet-cm",
    title: "White Board Size Chart: Every Standard Size in Feet, Centimetres and Square Feet",
    seoTitle: "White Board Size Chart: Feet & cm",
    description:
      "Standard board sizes from 1 × 1 ft to 8 × 4 ft in centimetres and square feet, with the size range each Plusmark series is made in.",
    excerpt:
      "The table most buyers want: every Plusmark board size in feet, in cm and as usable writing area — and what to do when your wall falls between two sizes.",
    topic: "Sizing",
    published: "2026-10-24",
    updated: "2026-10-24",
    readMinutes: 6,
    coverProduct: "eco-premium-white-board",
    intro: [
      "Board sizes in India are quoted in feet, but walls are measured in centimetres, quotes are compared by area, and classroom furniture is planned in metres. This page converts the whole Plusmark standard size list once, so you do not have to redo the arithmetic for every enquiry.",
      "Centimetre values are exact conversions rounded to the nearest centimetre (1 ft = 30.48 cm), so a 3 × 4 ft board is 91 × 122 cm. The use column is a rule of thumb drawn from how these boards are typically installed — it is not a specification, and the same size works in very different rooms.",
    ],
    sections: [
      {
        heading: "Every standard board size, converted",
        body: [
          "These sizes appear across the Plusmark catalog for white boards, chalk boards, magnetic boards and notice boards. Availability by series is in the next section; the list below is the full span, from the smallest desk board to the largest lecture-hall board.",
        ],
        table: {
          head: ["Size (ft)", "Size (cm)", "Area", "Where this size usually goes"],
          rows: [
            ["1 × 1 ft", "30 × 30 cm", "1 sq ft", "Desk board, home study corner, staff room reminders"],
            ["1 × 1.5 ft", "30 × 46 cm", "1.5 sq ft", "Cabin door board, short notices, key control points"],
            ["1 × 2 ft", "30 × 61 cm", "2 sq ft", "Home study, small office, counter note board"],
            ["1.5 × 2 ft", "46 × 61 cm", "3 sq ft", "Tuition room, cabin, narrow wall between windows"],
            ["1.5 × 3 ft", "46 × 91 cm", "4.5 sq ft", "Reception, planning corner, corridor notice point"],
            ["2 × 2 ft", "61 × 61 cm", "4 sq ft", "Meeting room, workshop instruction board"],
            ["2 × 3 ft", "61 × 91 cm", "6 sq ft", "Classroom, coaching room, small conference room"],
            ["2 × 4 ft", "61 × 122 cm", "8 sq ft", "Lecture room side wall, notice display, staff board"],
            ["3 × 4 ft", "91 × 122 cm", "12 sq ft", "Main classroom board, conference room writing wall"],
            ["4 × 4 ft", "122 × 122 cm", "16 sq ft", "Large notice display, locked acrylic cover installations"],
            ["5 × 4 ft", "152 × 122 cm", "20 sq ft", "College lecture room, hall corridor display"],
            ["6 × 4 ft", "183 × 122 cm", "24 sq ft", "Auditorium, seminar hall, big roster board"],
            ["8 × 4 ft", "244 × 122 cm", "32 sq ft", "Lecture hall front wall, examination and event display"],
          ],
        },
      },
      {
        heading: "Which series is made in which sizes",
        body: [
          "The size range you can order depends on the series. Eco Premium and Eco Regular boards start small — from 1.5 × 2 ft — while Metallic Premium and Deluxe Standard framing begins at 3 × 4 ft. Both groups reach the same 8 × 4 ft top end; what changes is the small end of the range, because heavy-duty framing on a small board is rarely worth the money.",
          "Standard sizes therefore run from small 1 × 1 ft desk boards up to 8 × 4 ft classroom and lecture-hall boards. If your enquiry sits between two listed sizes, you are not restricted to the chart.",
        ],
        bullets: [
          "Metallic Premium and Deluxe Standard: 3 × 4 ft up to 8 × 4 ft",
          "Eco Premium and Eco Regular: 1.5 × 2 ft up to 8 × 4 ft",
          "Desk and home boards: from 1 × 1 ft",
          "Larger or non-standard sizes: made to order as per customer requirement",
        ],
      },
      {
        heading: "Acrylic door cover boards keep their own size sets",
        body: [
          "Locked notice display is sized differently because the door has to swing. Deluxe acrylic door cover boards in the single-door format come in 2 × 3 ft, 2 × 4 ft, 3 × 4 ft and 4 × 4 ft; the double-door format starts where a single door becomes awkward, at 5 × 4 ft, 6 × 4 ft and 8 × 4 ft. ECO acrylic door cover boards run 1.5 × 2 ft, 2 × 3 ft, 2 × 4 ft, 3 × 4 ft and 4 × 4 ft.",
          "That is why a 4 × 4 ft notice wall and a 6 × 4 ft notice wall are not the same purchase — the second needs double doors, which changes the framing as well as the size.",
        ],
      },
      {
        heading: "Measuring the wall before you choose a size",
        body: [
          "Mark the widest span the board can occupy, then subtract. Corners and switches take a couple of inches at each end, and a board hung above an existing platform or dais has to clear it at writing height, not at its bottom edge.",
          "Plusmark boards are framed for either orientation, so a 3 × 4 ft board can go up landscape or portrait on the same wall. Vertical hanging is what makes narrow walls usable — the same board hung portrait fits where landscape will not.",
          "Finally, count what has to fit, not the wall. A board that comfortably holds four A4 charts side by side is a very different order from one meant for a working list of thirty names, and the second usually needs the extra height rather than extra width.",
        ],
      },
      {
        heading: "Putting the size into your enquiry",
        body: [
          "Quote the size the way the catalog lists it — feet first, then orientation if it matters, then quantity and the room it is going into. Add the wall measurement if you are between sizes, because non-standard sizes are made to order and the team needs the exact figure to confirm what is possible.",
          "If you are weighing two sizes against each other, send both in one enquiry. Rate and availability for institutional orders are confirmed against the specific requirement rather than published on this site, and one enquiry covering both sizes gets a straight answer faster than two enquiries covering one each.",
        ],
      },
    ],
    related: [
      "white-boards",
      "white-boards-non-magnetic",
      "white-boards-magnetic",
      "white-boards-ceramic",
      "chalk-boards",
      "notice-boards",
      "acrylic-door-cover-notice-boards",
      "double-sided-boards",
      "eco-premium-white-board",
      "metallic-premium-white-board",
      "deluxe-standard-white-board",
      "eco-regular-white-board",
      "deluxe-45mm-adc-notice-board-single-door",
      "deluxe-45mm-adc-notice-board-double-door",
    ],
    faq: [
      {
        q: "What size is a 3 × 4 ft white board in cm?",
        a: "91 × 122 cm, which is 12 square feet of writing area. The conversion uses 1 ft = 30.48 cm and rounds to the nearest centimetre for ordering.",
      },
      {
        q: "Which is the largest standard board size?",
        a: "8 × 4 ft — 244 × 122 cm, or 32 square feet. Anything beyond the listed sizes is treated as a made-to-order board rather than a catalogue size.",
      },
      {
        q: "Can a board be hung vertically instead of horizontally?",
        a: "Yes. Plusmark boards in the standard framed ranges are supplied for flexible mounting and can be hung horizontally or vertically, which is useful on a narrow wall where the landscape orientation will not fit.",
      },
    ],
  },
  {
    slug: "ceramic-steel-white-board-guide",
    title: "Ceramic Steel and Porcelain Enamel Boards: When the Surface Is Worth the Upgrade",
    seoTitle: "Ceramic Steel & Porcelain Boards",
    description:
      "Ceramic steel white boards have a porcelain enamel surface: hard, non-porous and made for continuous writing. Compare the two Plusmark ceramic series.",
    excerpt:
      "Porcelain enamel is the surface buyers ask for when a board must survive ten years of daily writing rather than two. Here is what it does, and when it is overkill.",
    topic: "Materials",
    published: "2026-10-24",
    updated: "2026-10-24",
    readMinutes: 6,
    coverProduct: "metallic-premium-ceramic-board",
    intro: [
      "Most marker boards fail slowly in the same way. Ink stops coming off, faint ghosts of last week's writing stay on the surface, and cleaning takes longer each month. That is the surface wearing through, and it is why institutions with heavy daily use stop shopping by size and start shopping by surface.",
      "Plusmark's answer is the ceramic steel board — a porcelain enamel surface fused onto steel. The catalog lists it under both white boards and chalk boards, in two series, and describes it as designed for very long product life under regular institutional use. This guide is about when that claim matters to your building.",
    ],
    sections: [
      {
        heading: "What a ceramic steel surface actually is",
        body: [
          "Porcelain enamel is a glass-like coating fired onto a steel sheet. The result is hard and non-porous, which is the combination that keeps marker ink sitting on top of the surface instead of soaking into it. The catalog describes the writing area as suitable for continuous writing and frequent cleaning, with a smooth finish that keeps performing consistently over time.",
          "The steel underneath does a second job. Because the substrate is metal, these boards accept magnets — the catalog lists them as ceramic steel magnetic boards — so the same wall can hold charts and take marker writing without a separate pin surface.",
        ],
      },
      {
        heading: "Where it differs from the other hard surfaces",
        body: [
          "Plusmark documents three hard-wearing surfaces, and they are not interchangeable. Marker Grade HPL sheet is the high gloss non-magnetic writing surface. Resin coated steel is the magnetic surface used across the magnetic range. Ceramic steel / porcelain enamel steel sits above both on the durability axis and is the one listed for very long product life.",
        ],
        table: {
          head: ["", "Resin coated steel", "Marker Grade HPL", "Ceramic steel / porcelain enamel"],
          rows: [
            ["Magnetic", "Yes", "No", "Yes"],
            ["Built for", "Daily magnetic display", "Writing and wiping", "Long surface life under heavy use"],
            ["Cleaning load", "Regular", "Regular", "Suitable for frequent cleaning"],
            ["Where the catalog places it", "Magnetic white and chalk boards", "Non-magnetic white boards", "Classrooms and institutions, colleges"],
            ["Series available", "Metallic Premium, Deluxe Standard, Eco Regular", "All four series", "Metallic Premium, Deluxe Standard"],
          ],
        },
      },
      {
        heading: "It comes in white and in chalk",
        body: [
          "The ceramic board is listed with two variants: a white board surface for marker writing and a chalk board surface for chalk. The chalk version is a porcelain enamel green board that accepts magnets and is described as ultra-durable, scratch-resistant and non-porous, with glare-free writing and effortless cleaning.",
          "That matters for schools that teach with chalk but cannot put a fresh board up every two years, and for colleges where the same room is used by six batches a day. Both variants sit in the same aluminium framing as the rest of their series, so the frame choice is made separately from the surface choice.",
        ],
      },
      {
        heading: "The two ways it is framed",
        body: [
          "Metallic Premium Ceramic carries heavy-duty aluminium framing with Signature Dual-Tone Corners — the top of the Plusmark series ladder. Deluxe Standard Ceramic uses aluminium framing with Electroplated Chrome Corners, the same corner specification the catalog pairs with the Deluxe Standard series.",
          "Same surface, two budgets. If the board is going on a reception wall, an auditorium or a corridor where the frame is part of the room, the Metallic Premium build is the one that reads properly. If it is going into a working classroom, the Deluxe Standard version delivers the same surface for less.",
        ],
      },
      {
        heading: "When ceramic is the wrong choice",
        body: [
          "It is a durability purchase, so it is wasted where the writing load is light. A seminar room used twice a week, a staff room board or a home study corner does not need porcelain enamel, and the catalog itself points the other way: for similar writing performance at a more economical level, non-magnetic Metallic Premium boards are listed as the alternative when magnetic use is not required, and non-magnetic Eco Premium boards where the budget is tighter.",
          "The honest test is a number: how many hours a day does this surface get written on and wiped? Two or three is a resin coated steel or HPL decision. Eight, ten, twelve, with several teachers using the same board — that is where ceramic earns its place on the specification.",
        ],
      },
      {
        heading: "How to specify one",
        body: [
          "Send four things: the surface (ceramic white or ceramic chalk), the series (Metallic Premium or Deluxe Standard), the size from the standard range, and the quantity, along with the room. Board sizes and framing are confirmed against the requirement by the sales team, so a room-wise list is more useful than a single line item.",
        ],
      },
    ],
    related: [
      "white-boards-ceramic",
      "chalk-boards-ceramic",
      "white-boards",
      "white-boards-magnetic",
      "metallic-premium-ceramic-board",
      "deluxe-standard-ceramic-board",
      "metallic-premium-ceramic-chalk-board",
      "deluxe-standard-ceramic-chalk-board",
      "chalk-boards",
      "metallic-premium-white-board",
    ],
    faq: [
      {
        q: "Are ceramic white boards magnetic?",
        a: "Yes. Plusmark's ceramic boards are ceramic steel / porcelain enamel steel, and the steel backing means magnets hold on them. The catalog lists them under ceramic steel magnetic boards.",
      },
      {
        q: "Is a ceramic board the same as a porcelain whiteboard?",
        a: "The terms describe the same construction — porcelain enamel fused onto steel. Plusmark's documentation uses both phrasings, listing the surface as ceramic steel / porcelain enamel steel.",
      },
      {
        q: "Which rooms should use ceramic boards?",
        a: "The ones with continuous writing: college lecture rooms, main classroom boards used by many teachers through the day, halls and corridors where a board is expected to stay serviceable for years rather than seasons.",
      },
    ],
  },
  {
    slug: "how-to-mount-a-white-board-on-wall",
    title: "How to Mount a White Board on a Wall: Orientation, Height and What to Check First",
    seoTitle: "How to Mount a Board on a Wall",
    description:
      "Wall-mounted boards can hang horizontally or vertically. What to check on the wall, the height to set, and what to confirm with Plusmark before fixing.",
    excerpt:
      "Plusmark boards are framed for quick wall-mount hanging in either orientation. The things that go wrong are almost never about the board — they are about the wall behind it.",
    topic: "Installation",
    published: "2026-10-24",
    updated: "2026-10-24",
    readMinutes: 6,
    coverProduct: "metallic-premium-white-board",
    intro: [
      "Every framed Plusmark board is built to go straight onto a wall: an aluminium anodised frame with ABS dual-tone edges and quick wall-mount installation, hung horizontally or vertically as the room needs. Nothing about the board requires a specialist fabricator.",
      "What does require attention is everything behind the board — the wall type, the fixings that go into it, the height, and whether the wall is even the right answer. This page covers the checks that decide whether a mounted board is still flat and level in a year.",
    ],
    sections: [
      {
        heading: "Check the wall before you check the board",
        body: [
          "A 3 × 4 ft framed board is a point load carried by two or three fixings, and the wall has to take it. Solid brick and concrete are straightforward. A plasterboard or partition wall needs anchors rated for the load and located at stud positions, or a spread plate behind the board; hanging into hollow plaster alone is what makes boards pull out of the wall within a term.",
          "Damp is the other thing to test. A board on an outside wall above a wet area will trap moisture behind the frame. If the wall has been patched, repainted and re-patched, that pattern is usually the answer.",
        ],
      },
      {
        heading: "Set the height for the people writing on it",
        body: [
          "The rule of thumb is that the top of the writing area should sit at or slightly above the eye line of the tallest regular user, not the average. A board set too high turns into a climbing exercise, and the top third of the surface quietly stops being used — which is the same as having ordered a smaller board.",
          "For a classroom, take the shortest child who will write on it, not the teacher. A 2 × 3 ft board set low with clear wall either side serves a primary class better than a 4 ft board set at adult height.",
          "Standing desks, cabins and meeting rooms are simpler: set the bottom edge above the chair back so someone seated is not writing over a shoulder, and leave the full width reachable from one position.",
        ],
      },
      {
        heading: "Horizontal or vertical: the frame allows either",
        body: [
          "Boards are listed for flexible mounting, so a 3 × 4 ft board can be hung landscape or portrait with no change to the product. That gives you two answers for one wall — a narrow stretch between a window and a door takes the same board portrait that a wide hall wall takes landscape.",
          "Orientation also changes how the room reads the board. Landscape suits a timeline, a roster or a two-column working list. Portrait suits a single flow — an agenda, a numbered procedure, a column of notices.",
        ],
        bullets: [
          "Mark the fixing points from the board itself, not from a guess on the wall",
          "Level the first fixing; a frame that starts out of level stays out of level",
          "Two people for anything at 4 ft and above — a board twisted mid-lift takes a corner out",
          "Do not overtighten into the frame; the aluminium and the corner pieces are doing the locating",
        ],
      },
      {
        heading: "What to confirm with Plusmark before the fitter arrives",
        body: [
          "The catalog documents the board, its framing and its wall-mount orientation. It does not list mounting hardware as part of the board itself, so ask what is supplied with your order and what your installation team needs to provide for your wall type. Same question for lead times and for whether the board ships flat against the wall or on a frame that stands off it.",
          "If the wall is unusual — glass, wooden panel, a curved partition, an outside wall — send a photo with the enquiry. It changes the fixing answer, and it is a five-second conversation instead of a repair later.",
        ],
      },
      {
        heading: "When a stand is the better answer",
        body: [
          "Skip the drill entirely if the room is rented, the wall is a partition, the board has to move between halls, or the wall simply is not free. Plusmark lists board stands across three leg, four leg, revolving, zig zag and telescopic types, and a wall-mount-versus-stand decision comes down to permanence and floor space rather than to the board.",
        ],
      },
    ],
    related: [
      "white-boards",
      "white-boards-magnetic",
      "white-boards-non-magnetic",
      "board-stands",
      "metallic-premium-white-board",
      "eco-premium-white-board",
      "three-leg-stand",
      "notice-boards",
      "acrylic-door-cover-notice-boards",
    ],
    faq: [
      {
        q: "Can a Plusmark board be hung vertically?",
        a: "Yes. The framed boards are documented for flexible mounting and can be hung horizontally or vertically, which is useful when the wall is tall and narrow rather than wide.",
      },
      {
        q: "Is the mounting hardware included with the board?",
        a: "Confirm what is supplied with your specific order before installation. The catalog documents the board, its aluminium framing and its wall-mount orientation, but the fixing set for your wall type is something to settle with the sales team.",
      },
      {
        q: "How high should a classroom white board be mounted?",
        a: "Set the top of the writing area at or slightly above the eye line of the tallest regular user, and make sure the shortest child who writes on it can reach the lower half. A board mounted too high loses its top third, which is the part most often paid for.",
      },
    ],
  },
  {
    slug: "school-bench-and-classroom-seating-guide",
    title: "School Benches: How the Plusmark Range Is Listed and What to Specify",
    seoTitle: "School Benches: Models & Specification",
    description:
      "Fifteen school bench models PDS-SB 801 to 815 are listed in the Plusmark catalog. How they are referenced and what to send with a seating enquiry.",
    excerpt:
      "Benches are catalogued by model number, with dimensions and seating configuration confirmed per order. Here is how to make the enquiry specific enough to answer.",
    topic: "Products",
    published: "2026-10-24",
    updated: "2026-10-24",
    readMinutes: 5,
    coverProduct: "pds-sb-807",
    intro: [
      "School benches are the newest line in the Plusmark range. The catalog describes Plusmark as expanding into the manufacturing of school benches, supporting educational infrastructure development — which is why the range is published as a model list rather than as a page of finished specifications.",
      "Fifteen models are listed, numbered PDS-SB 801 through PDS-SB 815. Each one is catalogued by model reference, and dimensions, materials and seating configuration are confirmed against the requirement you send.",
    ],
    sections: [
      {
        heading: "How the range is referenced",
        body: [
          "Every bench carries the same prefix, so a specification line looks like PDS-SB 807 or PDS-SB 812. The model number is the thing to quote in an enquiry or a tender schedule — it is unambiguous, and it lets the sales team pull the right configuration instead of guessing from a description.",
        ],
        bullets: [
          "PDS-SB 801, 802, 803, 804, 805, 806, 807, 808",
          "PDS-SB 809, 810, 811, 812, 813, 814, 815",
          "Model PDS-SB 807 is the reference board shown in the range listing",
          "Dimensions, materials and seating configuration are requested per model",
        ],
      },
      {
        heading: "What a seating enquiry actually needs",
        body: [
          "A bench order fails on vagueness far more often than a board order, because the bench has to fit both the child and the room. Four details settle it: the class group it is for (which sets seat height), the number of students per unit (single, double or shared seating), the room dimensions with the aisle widths you intend to keep, and the count of units.",
          "If the room already has boards mounted, add the board bottom height to the list. Bench seat height and board writing height are one continuous problem, and specifying them separately is how classrooms end up with children writing upwards.",
        ],
      },
      {
        heading: "Write the model into the room, not just the budget",
        body: [
          "Aisle clearance, door swing, and the position of the switchboard and notice wall all take space that the plan usually forgets. Count the units the room can actually seat at the layout you want, then check that the boards and the bench height agree.",
          "For a block being fitted out at once — several classrooms, a laboratory, a library reading room — send the room list with the bench requirement. Board and bench lines from the same catalog can then be scheduled together instead of in two rounds of purchasing.",
        ],
      },
      {
        heading: "Why benches and boards are ordered together",
        body: [
          "Plusmark already supplies what goes on the classroom walls: chalk boards and white boards for teaching, practice boards with four-line and square-line marking for early handwriting, notice and acrylic door cover boards for display, homework tables for study, and stands for rooms where nothing can be drilled. Benches close the loop by supplying what the children sit on.",
          "For a school that is standardising, that means one vendor list for the whole classroom fit-out — board surface, board size, seating and display — rather than four separate purchase decisions that meet for the first time on site.",
        ],
      },
      {
        heading: "Where the numbers come from",
        body: [
          "Rates, delivery and minimum order quantities for institutional seating are settled against the specific requirement through the sales channel, and are not published on this site. Send the class group, seating per unit, quantity and the room, and the answer comes back per model.",
        ],
      },
    ],
    related: [
      "school-benches",
      "board-study-essentials",
      "student-study-table",
      "four-line-square-line-practice-board",
      "eco-premium-chalk-board",
      "eco-premium-white-board",
      "board-stands",
      "notice-boards",
    ],
    faq: [
      {
        q: "How many school bench models does Plusmark list?",
        a: "Fifteen. The catalog lists models PDS-SB 801 to PDS-SB 815 under the School Benches range.",
      },
      {
        q: "Are bench dimensions published on the site?",
        a: "No. Each model is catalogued by reference, and dimensions, materials and seating configuration are confirmed on enquiry against the class group and the room.",
      },
      {
        q: "Can benches be ordered with classroom boards?",
        a: "Yes. Benches sit in the same catalog as Plusmark's chalk boards, white boards, practice boards, notice boards and stands, so a classroom fit-out can be sent as one requirement list.",
      },
    ],
  },
  {
    slug: "white-board-for-home-study-corner",
    title: "A Board at Home: Sizing the Study Corner, Homework Table and Practice Setup",
    seoTitle: "White Board for a Home Study Corner",
    description:
      "Boards for home study: which size fits a corner, when a double-sided board saves wall space, and how a homework table or practice board changes the setup.",
    excerpt:
      "Home purchases fail in one specific way — the board is bought for the wall and then never used at child height. Here is how to size the corner first.",
    topic: "Choosing",
    published: "2026-10-24",
    updated: "2026-10-24",
    readMinutes: 5,
    coverProduct: "student-study-table",
    intro: [
      "A board in a house does a different job from a board in a classroom. Nobody writes a lesson on it; a child works through sums on it, a parent writes a list on it, and it has to survive being used by someone half the height of the person who hung it.",
      "That changes three decisions: how small you can safely go, whether the surface should take marker or chalk, and whether the board should be on the wall at all. Plusmark's small-format boards, double-sided boards, homework tables and handwriting practice boards are the four products that answer a home study corner.",
    ],
    sections: [
      {
        heading: "Start with the smallest size that still works",
        body: [
          "Home walls are narrow and full of doors, shelves and switches, so the constraint is rarely budget. The catalog's small end starts at 1 × 1 ft desk boards, with Eco Premium and Eco Regular available from 1.5 × 2 ft — sizes that fit a corner by a study chair without dominating the room.",
          "For a child working through practice sums, 1.5 × 2 ft is usually the comfortable floor: it holds a line of four or five short problems and still wipes in seconds. Anything larger in a bedroom tends to become a display surface rather than a working one.",
        ],
      },
      {
        heading: "Marker or chalk, decided by the child",
        body: [
          "Marker needs a board and a marker. Chalk needs a board, chalk, and somewhere to brush off the dust — which is the real argument against chalk in a bedroom and the real argument for it in a utility area or a covered balcony.",
          "If the household genuinely uses both, a double-sided board is the space-saving answer: a white board surface on the front for marker and a chalk board on the back, in one aluminium frame. It can be hung either way round, and one wall carries both writing methods.",
        ],
      },
      {
        heading: "A homework table instead of a wall board",
        body: [
          "Where drilling is not an option — a rented house, a shared room, a wall already covered — the Homework Table is the other shape of the same idea. It is a foldable table with a 16 × 24 inch white board writing surface and a 9.5 inch working height, so the child writes on the surface in front of them and the whole thing folds away after study time.",
          "It also fixes the height problem a wall board creates in a mixed-use house: an adult hangs a board at adult height, and it stops working for the child within six months.",
        ],
      },
      {
        heading: "Handwriting years need lined boards, not blank ones",
        body: [
          "For early writing, a blank surface is the wrong tool. Plusmark's Four Line and Square Line Practice Boards carry the line marking a child actually needs for letter formation, and the line layout is provided as per school or customer requirement — so the practice board at home can match the one in the classroom rather than fight it.",
          "Letters and figures sets complete the same corner. The sets are listed at 112 pieces for letters and 100 for figures, in 12 mm, 18 mm, 24 mm and 36 mm sizes, so a magnetic board becomes a spelling and number work surface rather than only a writing one.",
        ],
      },
      {
        heading: "Magnetic or not, and how to hang it",
        body: [
          "Magnetism is fixed at manufacture — a non-magnetic board cannot be converted later — so if charts, timetables or a term calendar are going to live on the surface, order the magnetic version now. If the surface is only ever written on and wiped, non-magnetic does the same job and the money is better spent on size.",
          "Framed boards are supplied for wall mounting and can be hung horizontally or vertically, which is what makes a narrow strip of wall by a study chair usable. If nothing can be drilled, a board stand holds the same board and moves it out of the way at the end of the day.",
        ],
      },
      {
        heading: "What to send when you order",
        body: [
          "The size, the surface (marker or chalk, magnetic or non-magnetic), the room it is going into, and whether it is going on a wall or standing. Sizes, framing and what is supplied with the board are confirmed per order, so a one-line room description is worth more than a bare size.",
        ],
      },
    ],
    related: [
      "white-boards",
      "white-boards-magnetic",
      "white-boards-non-magnetic",
      "double-sided-boards",
      "board-study-essentials",
      "eco-premium-white-board",
      "eco-regular-white-board",
      "eco-premium-both-side-board",
      "student-study-table",
      "four-line-square-line-practice-board",
      "letters-and-figures-set",
      "board-stands",
    ],
    faq: [
      {
        q: "What size white board is enough for a child's study corner?",
        a: "Between 1 × 1 ft and 2 × 3 ft covers most homes. Around 1.5 × 2 ft is the practical minimum for working through a few sums at a time, and anything larger than 2 × 3 ft in a bedroom usually turns into a display board.",
      },
      {
        q: "Is there an alternative to mounting a board on the wall?",
        a: "Yes, two of them. The Homework Table is a foldable table with a 16 × 24 inch white board surface at 9.5 inches working height, and board stands hold a framed board without any drilling at all.",
      },
      {
        q: "Should I buy a magnetic board for home?",
        a: "Only if something is going to be stuck on it. Magnets are built into the resin coated steel surface at manufacture and cannot be added later, so a board meant purely for writing and wiping is better served by a non-magnetic surface at a larger size.",
      },
    ],
  },

  {
    slug: "combination-board-guide",
    title: "Combination Boards: One Writing Surface and One Pin-Up Surface in the Same Frame",
    seoTitle: "Combination Boards: Write and Pin in One Frame",
    description:
      "A combination board is a dry wipe white board on one face and a fabric notice board on the other. When that saves a wall, and when two boards are better.",
    excerpt:
      "Most rooms need two things from one wall: somewhere to write, and somewhere to pin. A combination board is the one product in the range built for exactly that.",
    topic: "Products",
    published: "2026-10-24",
    updated: "2026-10-24",
    readMinutes: 6,
    coverProduct: "combination-board",
    intro: [
      "Notice boards and white boards answer different questions. A notice board holds paper that has to stay readable for a fortnight; a white board holds writing that gets wiped out the same afternoon. Rooms that need both usually end up with two frames side by side on one wall, which is exactly the situation the Combination Board exists to avoid.",
      "The catalog describes it plainly: a dry wipe white board on one side and a fabric notice board on the other, so marker writing and pin-up display happen on a single board. This guide covers how that differs from a double-sided board, which rooms it suits, and what to specify.",
    ],
    sections: [
      {
        heading: "What the board actually is",
        body: [
          "One framed panel, two working faces. The white face is a dry wipe surface — the catalog lists smooth marker writing with easy erase. The other face is fabric, listed as suitable for repeated pin use, with frequent pinning and removal possible without surface damage or loss of grip.",
          "So a circular can stay pinned for two weeks while the same board carries a timetable that gets rewritten every morning. Neither job has to wait for the other, and neither surface has to be cleared to make room for the second.",
        ],
      },
      {
        heading: "How it differs from a double-sided board",
        body: [
          "Both are two-face boards, and buyers mix them up constantly. A double-sided board gives you two writing surfaces — the range pairs marker on one side with chalk on the other, which is a decision about the writing medium. A combination board gives you one writing surface and one display surface, which is a decision about what the wall has to do.",
          "The test is simple. If the second face exists so a different pen or chalk can be used, that is a double-sided board. If the second face exists to hold paper, photographs and notices with pins, it is a combination board.",
        ],
      },
      {
        heading: "The problem it solves is wall space, not cost",
        body: [
          "Institutions do not usually buy a combination board to save money; they buy it when the wall is already spoken for. A staff room corridor with one clear stretch between a door and a switchboard cannot take two frames at readable height. A reception that must show announcements and take a quick written note has the same constraint.",
          "There is a second, quieter benefit: one fixing, one frame line, one visual object on the wall. Where a corridor has five boards of two different builds, the room starts to look like a storeroom. Combining the two functions into one frame keeps the wall legible to people reading it.",
        ],
      },
      {
        heading: "Which frame it comes in",
        body: [
          "The catalog lists the combination board in the same three frame variants as the rest of the notice board range — Metallic Premium, Eco Premium and Deluxe — so the build grade is chosen the same way it is for a cloth board. Corners and framing are a separate decision from surface mix, and the series guide explains what each grade is built for.",
          "The fabric side also inherits the notice board customisation habit: fabric notice boards are listed in the customer's preferred fabric colour with layout provided as per requirement. If the room has a colour scheme or the institution has a brand colour, ask whether the same applies to the combination build for your size.",
        ],
      },
      {
        heading: "Where it fits, and where it does not",
        body: [
          "It fits where the two jobs are genuinely both daily: an office notice wall with a meeting-room overflow, a coaching centre corridor that posts batches and takes corrections, a factory entrance board that carries the day's numbers alongside pinned work instructions, a hostel reception, a clinic waiting area, a department staff room.",
        ],
        bullets: [
          "Good fit: pinned notices change weekly and writing happens daily.",
          "Good fit: only one clear stretch of wall is available at readable height.",
          "Poor fit: the room writes on both media all day — that is a double-sided board.",
          "Poor fit: the notices must be protected or secured — a lockable acrylic door cover board is the right product.",
          "Poor fit: the pinned side needs to show large charts — a plain cloth or cork board of a bigger size serves better.",
        ],
      },
      {
        heading: "How to specify one",
        body: [
          "Send four things: which face does which job, the size, the frame variant, and the room it is going into. If the fabric colour matters, say so in the same line. Quantity matters more than it looks, because a combination board replaces a pair — a building list written as one line per wall is easier to price and easier to install than a mixed list of single-function boards.",
          "Orientation is worth asking about rather than assuming. The white face and the fabric face read differently at different heights, and the sales team can confirm which way the board you are ordering is meant to hang.",
        ],
      },
    ],
    related: [
      "combination-board",
      "notice-boards",
      "specialty-boards",
      "fabric-notice-board",
      "cork-notice-board",
      "metallic-premium-notice-board",
      "eco-premium-notice-board",
      "deluxe-standard-notice-board",
      "double-sided-boards",
      "white-boards-non-magnetic",
    ],
    faq: [
      {
        q: "Is a combination board the same as a double-sided board?",
        a: "No. A double-sided board carries two writing surfaces — typically marker on one face and chalk on the other. A combination board carries one dry wipe writing face and one fabric pin-up face, so it writes and displays rather than writes twice.",
      },
      {
        q: "Can the fabric side be ordered in our colour?",
        a: "Fabric notice boards are listed in the customer's preferred fabric colour with the layout provided as per requirement. For a combination board, confirm with the sales team whether the same colour and layout option applies to the size you are ordering.",
      },
      {
        q: "Can I pin on the white board side?",
        a: "No. The white face is a dry wipe writing surface, and pins go into the fabric face. If you need magnets as well as pins, that is a different specification — magnetic boards use resin coated steel surfaces, which are listed as accepting magnets.",
      },
    ],
  },
  {
    slug: "how-to-clean-a-chalk-board",
    title: "How to Clean a Chalk Board So It Keeps Taking Chalk",
    seoTitle: "How to Clean a Chalk Board or Green Board",
    description:
      "Chalk boards fail differently from marker boards: the surface glazes over and chalk stops gripping. The routine that keeps a green board writing properly.",
    excerpt:
      "A chalk board rarely breaks. It goes shiny in the middle, the writing gets faint, and someone blames the chalk. It is almost always the dust.",
    topic: "Maintenance",
    published: "2026-10-24",
    updated: "2026-10-24",
    readMinutes: 6,
    coverProduct: "metallic-premium-chalk-board",
    intro: [
      "Marker boards get cleaned because the ghosts are visible. Chalk boards get cleaned far less often, which is why they fail in a way nobody notices until the back two rows start complaining: a hard, shiny band grows across the middle of the board where the writing happens, and chalk stops leaving a mark on it.",
      "That band is chalk dust that has been ground back into the surface instead of lifted off it. The fix is a routine, not a solvent. Here is the routine, and where it stops working.",
    ],
    sections: [
      {
        heading: "Why a chalk board goes shiny",
        body: [
          "Erasing chalk does not remove it. A felt eraser or a dry cloth sweeps the coarse particles off, and leaves a fine powder sitting in the surface texture. Next lesson, that powder is written over and pressed back down by the eraser. Repeat two hundred times and the matte texture that chalk grips is filled in — a glazed patch appears exactly where the teacher writes most.",
          "The catalog describes the chalk surfaces as non-reflective and glare-free, which is a property of that texture. Losing the texture is how a green board ends up with a mirror stripe across it, and how visibility from the back rows quietly gets worse.",
        ],
      },
      {
        heading: "The daily routine",
        body: [
          "Wipe the board while the writing is still dry. A wet cloth on fresh chalk turns dust into paste, and paste is what fills the texture.",
        ],
        bullets: [
          "Erase dry, top to bottom, in one direction rather than scrubbing across.",
          "Clean or knock out the eraser every few classes — a loaded eraser is the source of the problem.",
          "Keep one cloth for boards and one for everything else; a cloth that has touched a desk or a window never comes back.",
          "Do not use the marker-board felt on a chalk board. It carries chalk dust, and chalk dust on a dry wipe surface is what makes ink stop lifting.",
        ],
      },
      {
        heading: "The weekly wash",
        body: [
          "Once a week the board needs water, because dry wiping cannot lift fine powder. Use a soft cloth dampened with clean water, wipe from the top edge downward, rinse the cloth often, and let the board dry fully before anyone writes on it. A damp wipe on a wet board just moves dust around.",
          "The chalk range is built for this. Metallic Premium and Eco Premium boards are listed with a Hardcore Chalk Grade HPL sheet with enhanced scratch resistance, which is the property that lets a wash do its job without polishing the surface. Ceramic chalk boards go one step further: the catalog describes a porcelain enamel surface as non-porous, scratch-resistant and effortless to clean, which is why institutions with heavy chalk use tend to end up there.",
        ],
      },
      {
        heading: "What not to use",
        body: [
          "Everything abrasive is a downgrade. Scouring pads and cleaning powders remove the glaze by removing the surface, and the board comes back looking newer and writing worse.",
        ],
        bullets: [
          "No scouring pads, steel wool or abrasive powders.",
          "No solvent or marker-board cleaner on a chalk surface — there is no ink to lift, and you are leaving residue that chalk will not grip.",
          "No oil-based polish, furniture spray or wax.",
          "No writing on a chalk board with a marker. If it happens by accident, deal with that spot before the next lesson rather than letting a weekly wash carry it.",
        ],
      },
      {
        heading: "A shiny board is not a dirty board",
        body: [
          "On a marker board, ghosting means ink has soaked into a worn surface — the recovery steps are in the white board cleaning guide. On a chalk board, the same-looking problem has the opposite cause: the surface is not porous, it is filled. A proper wash brings grip back on most boards.",
          "Where a wash stops working, the board is telling you something about its grade rather than about the cleaner. A lightweight board with standard plastic corners that has been washed daily for four years in a busy classroom is a different specification problem from a chalk board that was never wiped. When the glaze is permanent, the honest options are a resurface or a change of grade — the chalk board guide explains which surfaces sit above which in the range.",
        ],
      },
      {
        heading: "Which chalk board the room needs",
        body: [
          "Buying the right grade is cheaper than any cleaning routine, because it decides how often the routine has to be done.",
        ],
        table: {
          head: ["How the room uses it", "What the catalog lists", "Why it holds up"],
          rows: [
            ["Chalk every day, several teachers", "Metallic Premium Chalk Board", "Hardcore Chalk Grade HPL with enhanced scratch resistance, heavy-duty aluminium framing"],
            ["Regular institutional use", "Eco Premium Chalk Board", "Hardcore Chalk Grade HPL with ABS Dual-Tone corner design"],
            ["Everyday classroom use, balanced", "Deluxe Standard Chalk Board", "Chalk Grade HPL with Electroplated Chrome corners"],
            ["Light or occasional use", "Eco Regular Chalk Board", "Chalk Grade HPL in a lightweight frame with standard plastic corners"],
            ["Charts and notices pinned as well", "Magnetic Chalk Board", "Resin coated green chalk surface that accepts magnets and magnetic accessories"],
            ["The board must survive a decade", "Ceramic Chalk Board", "Porcelain enamel: non-porous, scratch-resistant, described as effortless to clean"],
          ],
        },
      },
    ],
    related: [
      "chalk-boards",
      "chalk-boards-non-magnetic",
      "chalk-boards-magnetic",
      "chalk-boards-ceramic",
      "metallic-premium-chalk-board",
      "eco-premium-chalk-board",
      "deluxe-standard-chalk-board",
      "eco-regular-chalk-board",
      "metallic-premium-magnetic-chalk-board",
      "deluxe-standard-magnetic-chalk-board",
      "metallic-premium-ceramic-chalk-board",
    ],
    faq: [
      {
        q: "Why has my green board gone grey and shiny?",
        a: "Chalk dust has been pressed into the surface texture instead of lifted off it. A dry eraser removes the visible particles and leaves fine powder, and over weeks that powder builds into a glazed band where chalk no longer grips. A weekly damp-water wash is what removes it.",
      },
      {
        q: "Can I clean a chalk board with white board cleaner?",
        a: "No. Marker-board products are there to lift ink, and a chalk surface has no ink on it — you would be adding residue that chalk cannot grip. Clean a chalk board with a dry eraser daily and a cloth dampened with clean water once a week.",
      },
      {
        q: "Which chalk board is easiest to keep in condition?",
        a: "The ceramic chalk boards. They are porcelain enamel on steel — listed as non-porous, scratch-resistant and effortless to clean — so the wash comes off the surface rather than grinding dust into it. The Hardcore Chalk Grade HPL boards in the Metallic Premium and Eco Premium series are the step below for daily institutional use.",
      },
    ],
  },
  {
    slug: "acrylic-folder-display-board-guide",
    title: "Acrylic Folder Display Boards: For Documents That Must Be Read, Not Just Pinned",
    seoTitle: "Acrylic Folder Display Boards: When to Use One",
    description:
      "Transparent front folders in an aluminium frame keep SOPs, charts and price lists flat and legible, with folders sized and counted to your requirement.",
    excerpt:
      "A pinned notice curls, fades and falls off within a week. A folder display board holds the same sheet flat behind clear acrylic, and lets you swap it without touching anything else.",
    topic: "Products",
    published: "2026-10-24",
    updated: "2026-10-24",
    readMinutes: 6,
    coverProduct: "acrylic-folder-display-board",
    intro: [
      "Most display problems in an Indian institution are not about the board. They are about the paper. A standard operating procedure pinned to a cloth board survives about ten days of sunlight, handling and humidity before it is unreadable, and the notice board ends up covered in the tape marks of documents nobody replaced.",
      "Plusmark's answer for that job is the Acrylic Folder Display Board — transparent front folders in a strong aluminium frame, listed for charts, reports, standard operating procedure sheets and production data. The catalog is explicit that folder size and quantity are made as per customer requirement, which is the whole point of the product.",
    ],
    sections: [
      {
        heading: "What the board is",
        body: [
          "A framed panel with clear acrylic folders mounted on the face. Each folder holds one sheet flat and open at the top, so a document slides in and out without pins, tape or staples. The catalog's own description of the benefit is clarity and access: clear visibility through the transparent front folders for easy document viewing, organised display of charts, reports, SOPs and production data, and papers that can be inserted and replaced quickly.",
          "It is listed under specialty display boards, in a strong aluminium frame suitable for industrial use — which is why the shop floor, not the reception, is where you see most of them.",
        ],
      },
      {
        heading: "What it does that a notice board cannot",
        body: [
          "A cloth, cork or fabric board is a pin surface. Paper on a pin surface is exposed: it curls at the corners, the pin hole tears, ink fades where the sun hits it, and one curious reader can wreck the layout.",
          "Behind a clear folder the same sheet is held flat, protected from handling, and stays aligned with the other sheets on the board. The layout does not drift. That matters most where the board is meant to be read in a fixed order — a process flow, a shift chart, a price list, a compliance sheet.",
        ],
      },
      {
        heading: "What it does that an acrylic door cover board does not",
        body: [
          "The two acrylic products get confused constantly, and the difference is the lock and the unit of access.",
        ],
        bullets: [
          "An acrylic door cover notice board is an enclosed pin surface behind hinged doors, available as single door or double door. It protects a whole board area, and it can be locked. Notices that must stay put, or that are official, belong there.",
          "A folder display board has no lock and no door. Access is per folder, which is why swapping one document does not disturb the rest of the grid. Documents that change weekly belong here.",
          "The practical rule: sensitive or official content behind a door, frequently replaced content in folders.",
        ],
      },
      {
        heading: "How to decide the folder grid",
        body: [
          "Folder size and quantity are made to requirement, so the board is designed backwards from the documents rather than forwards from a standard size. Work through four questions in writing.",
        ],
        bullets: [
          "What is actually going in each folder — one sheet, a folded circular, a printed chart? Measure the biggest thing that must fit.",
          "How many folders across, and how many rows down? That is the grid, and it sets the board's overall size.",
          "Does the board need a title row or a heading strip above the grid?",
          "Will the document size change? Capacity added later means a new board, so specify a little headroom in the count if the department is growing.",
        ],
      },
      {
        heading: "Where these usually go",
        body: [
          "The applications the catalog lists are a fair map of the rooms: charts, reports, standard operating procedure sheets, production data and industrial use.",
        ],
        bullets: [
          "Factory and workshop walls, where the SOP for each station has to be readable at arm's length and replaced without tools.",
          "Offices and admin blocks, for policy sheets, forms and formats that must stay flat and legible.",
          "Coaching centres and institutions, for batch timetables and fee circulars that change every session.",
          "Shops and counters, for price lists and offer sheets that are handled by customers.",
        ],
      },
      {
        heading: "How to specify one",
        body: [
          "Put the document itself in the enquiry. A photograph of the sheet, its size, and how many of them need to be up at once answers more than a written brief would. Then add the wall — where the board goes, roughly how far readers stand from it — the frame variant if you have a preference, and the quantity across locations.",
          "Because the layout is made to requirement rather than ordered off a standard list, folder size and quantity are confirmed with the sales team along with the board's overall dimensions. One line per location beats one total number.",
        ],
      },
    ],
    related: [
      "acrylic-folder-display-board",
      "specialty-boards",
      "display-boards",
      "acrylic-door-cover-notice-boards",
      "deluxe-45mm-adc-notice-board-single-door",
      "deluxe-45mm-adc-notice-board-double-door",
      "eco-adc-notice-board-single-door",
      "notice-boards",
      "heavy-duty-clear-acrylic-clipboard",
      "grooved-boards",
    ],
    faq: [
      {
        q: "Can the folders be resized after the board is made?",
        a: "No. Folder size and quantity are decided when the board is manufactured, so a change of document size means a new board. Specify against the actual sheet you intend to display, and build in headroom if the department might grow.",
      },
      {
        q: "Is a folder display board lockable?",
        a: "It is not listed as a lockable product. The lockable option is the acrylic door cover notice board, which encloses a pin surface behind hinged doors in single door and double door builds. Choose that when the content is official or must not be handled.",
      },
      {
        q: "What can go in the folders?",
        a: "Printed sheets that get replaced: charts, reports, standard operating procedure documents and production data are the applications the catalog lists. Anything that needs to stay flat, aligned and readable without being pinned falls into the same category.",
      },
    ],
  },
  {
    slug: "board-without-drilling",
    title: "No-Drill Board Setups: Stands, Rented Rooms and Walls You Are Not Allowed to Open Up",
    seoTitle: "No-Drill White Board Setups: Stands and Options",
    description:
      "Rented cabin, drywall with no backing, or a site that forbids drilling? How to get a working board up without touching the wall, and what to confirm first.",
    excerpt:
      "Plenty of boards never get mounted because the wall is not the buyer's to drill. A stand solves almost all of those cases, if you size it properly.",
    topic: "Installation",
    published: "2026-10-24",
    updated: "2026-10-24",
    readMinutes: 5,
    coverProduct: "four-leg-stand",
    intro: [
      "The mounting guide covers how to fix a board to a wall properly. This one is for the other half of reality: walls you are not allowed to open. Rented cabins, coaching rooms where the landlord wants written permission for a single hole, dryboard partitions with nothing behind them, corridors with wiring in the run, and halls that get reconfigured every exam season.",
      "None of those are a reason to skip the board. They are a reason to buy a different configuration, and the range supports it — Plusmark manufactures all types of board stands, listed as three leg, four leg, revolving, zig zag and telescopic.",
    ],
    sections: [
      {
        heading: "When drilling is off the table",
        body: [
          "The common cases are worth naming, because people assume they need a special product when they need a stand and the right size.",
        ],
        bullets: [
          "Rented premises, where any hole is a deposit or a written approval.",
          "Drywall and partition walls with no solid backing at the height you want.",
          "Heritage, compound or tiled walls where drilling risks a crack.",
          "Walls with concealed wiring or plumbing in the run.",
          "Rooms reconfigured between sessions — exam halls, training floors, event space.",
          "Sites where drilling needs permission from a facility team that is not on site.",
        ],
      },
      {
        heading: "A stand is the direct answer",
        body: [
          "A board stand holds a framed board with no wall work at all, which means the setup is reversible, relocatable and portable when you move out or reshuffle. The five stand shapes cover the different jobs — a light three-point base for a board that travels between rooms, a four-point base for a board that stays put and gets written on hard, a revolving base for two-sided use, a folding zig zag frame for storage between sessions, and a telescopic frame where the height has to change.",
          "The stand guide explains the shapes and how each behaves under a live pen; what matters here is that choosing a stand is not a compromise specification. It is the correct answer when the wall is not yours.",
        ],
      },
      {
        heading: "The size limit is real, and it is about the base",
        body: [
          "A stand is sized against the board that goes on it, not chosen on its own. Institutional board sizes run up to 8 × 4 ft, and a board that large on a freestanding base is a wall decision, not a floor one — a person leaning on a corner of a 8 ft board to reach the top line is going to move the whole thing.",
          "For no-drill setups, the practical band is the smaller standard sizes. Boards from 1 × 1 ft through 3 × 4 ft are the ones that behave well on stands, and the eco range is listed from 1.5 × 2 ft upward, so a 2 × 3 or 3 × 4 on a four leg stand covers most cabins, corridors and small classrooms.",
          "Confirm the stand and the board together with the sales team. A stand quoted against a specific board size is a different conversation from a stand quoted generically.",
        ],
      },
      {
        heading: "What to check before the stand arrives",
        body: [
          "Three things go wrong with freestanding installations, and all three are avoidable with a five-minute look at the room.",
        ],
        bullets: [
          "Footprint plus writing clearance. A stand needs the floor area it occupies and space in front of it for the person writing — measure both, not just the wall.",
          "Floor level. Corridors are sloped for drainage, and a three-point base on a sloped floor will wander. Ask whether the feet adjust before you commit to a shape.",
          "Who moves it. If a cleaner or a guard has to shift the board weekly, a revolving or telescopic base is the wrong choice and a folding one may be the right one.",
        ],
      },
      {
        heading: "Can you go from stand to wall later?",
        body: [
          "Often yes, but ask at the time of ordering rather than at the time of moving. The board is a framed panel, and whether your size can be put on a wall afterwards depends on the framing and the fixing provision — which is exactly the kind of detail the wall mounting guide walks through. Say in the enquiry if you expect to mount the same board on a wall in a year; it costs nothing to note and can save you buying twice.",
          "If the room is rented permanently and the wall is not yours, the reverse plan is cheaper: buy the stand, keep the board standard, and take both with you.",
        ],
      },
      {
        heading: "The cheapest no-drill option is the right size",
        body: [
          "A lot of no-drill problems are really size problems. A 3 × 4 board is specified for a room that needs a 2 × 3, and then the buyer discovers that the larger board cannot stand safely in the space available. Sizing down is not a loss here: the board gets read from three metres away at most, and a smaller board on a proper base beats a large board leaning against a wall.",
          "The size chart lists every standard size in feet and centimetres, and the room-by-room sizing guide works out what the last row actually needs. Start with those two before you ask for anything custom.",
        ],
      },
    ],
    related: [
      "board-stands",
      "three-leg-stand",
      "four-leg-stand",
      "revolving-stand",
      "zig-zag-stand",
      "telescopic-stand",
      "board-study-essentials",
      "eco-premium-white-board",
      "white-boards-non-magnetic",
    ],
    faq: [
      {
        q: "Can a white board be used without drilling the wall?",
        a: "Yes. A board stand holds a framed board with no wall work at all, and the range lists five stand shapes — three leg, four leg, revolving, zig zag and telescopic — covering boards that travel, boards that stay put, double-sided boards, and boards that pack away between sessions.",
      },
      {
        q: "What is the largest board you can put on a stand?",
        a: "It depends on the stand and the board together, so there is no single safe answer. Boards in the smaller standard band up to about 3 × 4 ft behave well freestanding; the largest institutional sizes are wall decisions. Confirm the pairing with the sales team before ordering.",
      },
      {
        q: "If we move out, can we take the board with us?",
        a: "That is the point of a stand — nothing is fixed to the property, so the board and the base both travel. If you expect to mount the same board on a wall at the next place, say so when you order so the framing question is answered up front.",
      },
    ],
  },
  {
    slug: "how-to-compare-two-board-quotes",
    title: "Comparing Two Board Quotes: The Line-by-Line Checklist",
    seoTitle: "Comparing Board Quotes: Line-by-Line Checklist",
    description:
      "Two board proposals can look identical and specify different products. Check surface, series, size, framing and mounting before you compare the number.",
    excerpt:
      "Buyers compare board quotes by price and size. That is two of the five lines that decide whether the boards are even the same product.",
    topic: "Buying",
    published: "2026-10-24",
    updated: "2026-10-24",
    readMinutes: 6,
    coverProduct: "eco-premium-white-board",
    intro: [
      "Ask for boards for a building and you will usually get two proposals that both say 3 × 4 white board, and a price difference that looks unreasonable. Most of the time neither quote is wrong — they are describing different products in the same words, because a board is priced by its surface, its framing, its size and its mounting, and only one of those four is the size.",
      "This is a checklist for reading two proposals side by side. It is deliberately not about who is cheaper.",
    ],
    sections: [
      {
        heading: "Line 1: the surface, by name",
        body: [
          "The surface is the part that gets written on and the part that has to be replaced, so it is the first thing to pin down. Plusmark's documented surfaces are High Gloss Marker Grade HPL, Hardcore and Chalk Grade HPL, resin coated steel, ceramic steel / porcelain enamel steel, 2 mm Blazer Cloth, Super Fine Velvet Cloth and natural cork.",
          "A quote that says white board and nothing else is incomplete rather than cheap. Ask for the surface name in writing, then compare that name between proposals. The six-surface guide explains what each is for, and the surface comparison guide covers when porcelain enamel is worth it and when it is overkill.",
        ],
      },
      {
        heading: "Line 2: the series, which is the framing",
        body: [
          "The same surface comes in four build grades, and the grade is what the frame, corners and core are made of. That is the entire difference between four boards of identical size.",
        ],
        table: {
          head: ["Series", "What the catalog says", "Read this as"],
          rows: [
            ["Metallic Premium", "Heavy-duty aluminium framing, Signature Dual-Tone Corners, intensive daily institutional use", "The top build — corridors, auditoria, heavy-use classrooms"],
            ["Eco Premium", "Premium-grade materials, ABS Dual-Tone Corner Design, reliable for daily institutional use", "Strong everyday institutional build"],
            ["Deluxe Standard", "Aluminium framing with Electroplated Chrome Corners, dependable for everyday use", "Balanced specification"],
            ["Eco Regular", "Cost-effective materials, lightweight frame, standard plastic corners, light and occasional use", "Budget build for genuinely light use"],
          ],
        },
      },
      {
        heading: "Line 3: the size, and whether that size exists",
        body: [
          "Sizes in the range run from small 1 × 1 ft desk boards up to 8 × 4 ft, but not every series makes every size. The catalog states Metallic Premium and Deluxe Standard boards are made from 3 × 4 ft up to 8 × 4 ft, and Eco Premium and Eco Regular from 1.5 × 2 ft up to 8 × 4 ft, with larger or non-standard sizes made to order.",
          "That gives you a fast sanity check on a proposal. A Metallic Premium board quoted at 2 × 2 ft is either a mistake or a made-to-order item, and you should know which before comparing it to an Eco Premium board of the same size. The size chart lists the standard sizes in feet and centimetres, including the 90 × 120 cm way buyers often write 3 × 4 ft.",
        ],
      },
      {
        heading: "Line 4: magnetic or not",
        body: [
          "Magnets are a property of the surface, not an accessory. Resin coated steel and ceramic steel surfaces are listed as accepting magnets and magnetic accessories; High Gloss Marker Grade HPL surfaces are listed as non-magnetic. A board cannot be made magnetic later, so a quote that does not state which you are getting has quietly made the decision for you.",
          "Worth checking honestly, too. If nothing will be stuck to the board, paying for magnetic is waste. If charts will go up on the wall beside the writing, non-magnetic means a second surface somewhere else in the room.",
        ],
      },
      {
        heading: "Line 5: mounting, and what the site is ready for",
        body: [
          "Wall-mounted or on a stand is part of the specification, not an afterthought, and it changes what has to be bought and who has to be on site. Boards listed as wall-mountable are fixed with a quick installation; stands are separate line items, sized against the board.",
          "So compare the mounting line before the money. One proposal that includes stands and one that assumes a drilled wall are not quoting the same job, and the one with the lower number may be the one that leaves you without a base.",
        ],
      },
      {
        heading: "What the quotes leave out",
        body: [
          "Four things go missing regularly, and all four cost more than the line items they replace.",
        ],
        bullets: [
          "Custom design work. When Plusmark makes the design of a board rather than reproducing a sketch, additional charges apply — so a schedule board quote should say whose design it is.",
          "Non-standard sizes, which are made to order rather than picked from the standard list.",
          "Quantity by room. A per-building total hides the fact that two rooms need 2 × 3 and one needs 4 × 8.",
          "Prices, lead times, minimum order quantities and warranty terms are confirmed by the sales team against your specification. Compare proposals on the five lines above, then take the remaining differences to a conversation.",
        ],
      },
      {
        heading: "The one-page way to run it",
        body: [
          "Make a grid with one row per room: room, board, surface, size, series, magnetic yes or no, mounted or on a stand, quantity. Fill both proposals into it. Usually the two quotes then agree on six of eight columns and differ on one or two — and those differences are the actual comparison, rather than the price gap you started with.",
          "Where the difference is the series and nothing else, the question is not which is cheaper but which room the board is going into. Cheap is correct for a staff room board used monthly. Cheap is expensive on a wall written on by six batches a day.",
        ],
      },
    ],
    related: [
      "eco-premium-white-board",
      "metallic-premium-white-board",
      "deluxe-standard-white-board",
      "eco-regular-white-board",
      "white-boards",
      "notice-boards",
      "board-stands",
      "white-boards-magnetic",
      "metallic-premium-ceramic-board",
      "dry-wipe-schedule-board",
    ],
    faq: [
      {
        q: "Two quotes for the same size differ a lot in price. Why?",
        a: "Almost always because of the surface and the series rather than the size. The same 3 × 4 ft board can be non-magnetic HPL, magnetic resin coated steel or porcelain enamel, in four different frame grades with different corners and cores. Put both proposals against the five-line checklist and the gap usually explains itself.",
      },
      {
        q: "Should a quote name the surface?",
        a: "Yes. Ask for the surface in writing — Marker Grade HPL, Chalk Grade HPL, resin coated steel, ceramic steel, Blazer Cloth, velvet or cork. It is the part that wears out, so it is the line that decides what a replacement costs years later.",
      },
      {
        q: "Are Plusmark board prices published?",
        a: "No. Prices, lead times, minimum order quantities and warranty terms are confirmed by the sales team against the size, surface and configuration you specify, which is why comparing two proposals on specification first is the useful order of work.",
      },
    ],
  },

  {
    slug: "made-to-order-board-guide",
    title: "Made-to-Order Boards: The Six Things Plusmark Builds to Your Requirement",
    seoTitle: "Made-to-Order Boards: What Can Be Customised",
    description:
      "Folder grids, fabric colour and layout, combination faces, practice lines, schedule designs and frame variants: what is made to order, and what to send.",
    excerpt:
      "The catalog lists six specific things that get built to requirement. Anything outside them is a conversation, and anything inside them just needs the right details in the enquiry.",
    topic: "Custom",
    published: "2026-10-24",
    updated: "2026-10-24",
    readMinutes: 6,
    coverProduct: "fabric-notice-board",
    intro: [
      "Custom board enquiries usually fail in the same way: somebody asks for something impossible, gets a vague answer, and the project stalls. The reason is that made-to-order is not one switch. It is a specific list of things a manufacturer can actually change, and the rest of a board is decided by what the workshop builds anyway.",
      "Plusmark's catalog lists six areas where the product is made to the customer's requirement rather than picked from a standard list: acrylic folder grids, fabric notice board colour and layout, combination board surfaces, practice board line markings, schedule board designs, and frame variants on the cloth, cork and combination range. This guide takes each one in turn and says what to send.",
    ],
    sections: [
      {
        heading: "1. Acrylic folder display grids",
        body: [
          "Folder size and folder quantity are both made as per requirement, because the board exists to fit a document rather than a shelf standard. Send the document itself, or its finished size, plus how many need to be on the wall at the same time.",
          "What gets decided here is the grid: how many folders across, how many down, and therefore the overall panel size and frame. A change of document size after manufacture means a new board, so if the department is between two formats, settle it before the enquiry goes out.",
        ],
      },
      {
        heading: "2. Fabric notice board colour and layout",
        body: [
          "Fabric notice boards are listed in the customer's preferred fabric colour, with board layout provided as per requirement. Two separate things, and institutions use both: matching a corridor or reception finish, and laying the board so pinned content sits where it is meant to — a heading strip, a column per department, a reserved block for statutory notices.",
          "Send the colour reference (a fabric name, a photograph, or the supplier's code if you already buy the fabric), the layout sketch, and the size. If you have several boards in one building, say which ones repeat the layout — a repeated grid across ten boards is a simpler job than ten one-off layouts.",
        ],
      },
      {
        heading: "3. Combination boards",
        body: [
          "A combination board is one dry wipe face and one fabric face in a single frame. The catalog also lists it in the Metallic Premium, Eco Premium and Deluxe frame variants, so the build grade is chosen the same way as a cloth board.",
          "The custom part is the split between the two faces and which face gets the larger area. A wall that mostly announces and occasionally takes a note wants a different split from a meeting overflow wall that writes all day and pins on Fridays. Draw the split you want and send it with the size.",
        ],
      },
      {
        heading: "4. Practice board line markings",
        body: [
          "Four Line and Square Line Practice Boards carry line marking as per school or customer requirement, which is why schools specify them rather than buy a generic grid. What has to be stated is the geometry: number of lines, spacing between them, the height of the writing band, and for square-line boards the size of each square.",
          "If your school follows a particular handwriting programme, send the page from the school's own copybook. That answers the spacing question without a phone call, and it is the difference between a practice board the children actually use and one that gets painted over.",
        ],
      },
      {
        heading: "5. Schedule boards, any design and any size",
        body: [
          "The Dry Wipe Schedule Board is listed as available in any design and any size, made to your sketch. Three details have to be provided before ordering — quantity of board, sizes of board, and the sketch — and sketches are accepted in CorelDRAW, Photoshop or Word files.",
          "One thing to budget for: when Plusmark makes the design of a board rather than reproducing a sketch you supplied, additional charges apply. If your team can produce the layout file, the board is a standard made-to-order item; if the workshop has to design it, say so early and ask for that line to be quoted separately.",
        ],
      },
      {
        heading: "6. Frame variants on cloth, cork and combination boards",
        body: [
          "Cork, fabric and combination boards are available in the Metallic Premium, Eco Premium and Deluxe frame variants, so a made-to-order layout does not lock you into a build grade. Framing and corners are what separate the series, and the frame guide covers what each variant uses.",
          "This is also the line item that lets a building stay consistent. A college can order notice boards, cork boards and combination boards to three different layouts and hold one frame variant across all of them, so the corridors look like one estate rather than one purchase order per year.",
        ],
      },
      {
        heading: "What is not on this list",
        body: [
          "Sizes beyond the standard range are made to order too — the size guide states that larger or non-standard sizes are made against a requirement — but the six items above are the documented customisation areas. Anything else, including a surface the catalog does not list, a colour outside the fabric options, or a product the range does not manufacture, is a conversation with the sales team rather than a specification.",
          "The habit that makes custom work cheap is writing the enquiry as one row per location: where the board goes, what it has to do, the document or layout it carries, the size, the frame variant, and the quantity. A made-to-order board is not more expensive because it is custom; it gets expensive when the requirement is described twice.",
        ],
      },
    ],
    related: [
      "display-boards",
      "acrylic-folder-display-board",
      "fabric-notice-board",
      "combination-board",
      "cork-notice-board",
      "four-line-square-line-practice-board",
      "dry-wipe-schedule-board",
      "notice-boards",
      "specialty-boards",
      "schedule-boards",
    ],
    faq: [
      {
        q: "Can a notice board be made in our institution's colour?",
        a: "Yes. Fabric notice boards are listed in the customer's preferred fabric colour, with the board layout provided as per requirement. Send a colour reference — a fabric name, a photograph or a supplier code — along with the size and how many boards repeat that colour.",
      },
      {
        q: "Do custom boards cost more?",
        a: "Made-to-order work is quoted against the requirement rather than listed, so there is no published premium. One documented exception is design: when Plusmark creates the design of a board instead of reproducing a sketch you supplied, additional charges apply.",
      },
      {
        q: "Can we order a size that is not in the standard range?",
        a: "Yes. Standard sizes run up to 8 × 4 ft and larger or non-standard sizes are made to order once quantity, size and a layout sketch are provided. The same three details are what the schedule board route asks for, so a custom size enquiry should carry them.",
      },
      {
        q: "Can we keep one frame style across several different boards?",
        a: "That is the frame variant option. Cork, fabric and combination boards are available in Metallic Premium, Eco Premium and Deluxe framing, so boards with different layouts and surfaces can still match around the edge.",
      },
    ],
  },

];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

/** Newest first, so the index and the sitemap agree on order. */
export const articlesByNewest: Article[] = [...articles].sort(
  (a, b) => b.published.localeCompare(a.published),
);
