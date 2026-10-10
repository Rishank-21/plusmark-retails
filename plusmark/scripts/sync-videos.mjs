import { cert, initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
const app = initializeApp({
  credential: cert(sa),
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
});
const db = getDatabase(app);

const staticVideos = {
  ecoWhite: {
    title: "Eco Premium White Board",
    caption: "High Gloss HPL writing surface, aluminium anodised frame and ABS dual-tone corners.",
    src: "https://res.cloudinary.com/drt0rpkn2/video/upload/v1791015631/plusmark/videos/eco-premium-white-board.mp4",
    poster: "https://res.cloudinary.com/drt0rpkn2/video/upload/so_1,f_jpg,q_auto/v1791015631/plusmark/videos/eco-premium-white-board.jpg",
    productSlugs: ["eco-premium-white-board"],
  },
  ecoChalk: {
    title: "Eco Premium Chalk Board",
    caption: "Hardcore Chalk Grade HPL surface in the Eco Premium frame.",
    src: "https://res.cloudinary.com/drt0rpkn2/video/upload/v1791015594/plusmark/videos/eco-premium-chalk-board.mp4",
    poster: "https://res.cloudinary.com/drt0rpkn2/video/upload/so_1,f_jpg,q_auto/v1791015594/plusmark/videos/eco-premium-chalk-board.jpg",
    productSlugs: ["eco-premium-chalk-board"],
  },
  ecoNotice: {
    title: "Eco Premium Notice Board",
    caption: "Velvet pin-up surface with a soft, pin-friendly core.",
    src: "https://res.cloudinary.com/drt0rpkn2/video/upload/v1791015611/plusmark/videos/eco-premium-notice-board.mp4",
    poster: "https://res.cloudinary.com/drt0rpkn2/video/upload/so_1,f_jpg,q_auto/v1791015611/plusmark/videos/eco-premium-notice-board.jpg",
    productSlugs: ["eco-premium-notice-board"],
  },
  ecoBothSide: {
    title: "Eco Premium Both Side Board",
    caption: "White board on one side, chalk board on the other.",
    src: "https://res.cloudinary.com/drt0rpkn2/video/upload/v1791015572/plusmark/videos/eco-premium-both-side.mp4",
    poster: "https://res.cloudinary.com/drt0rpkn2/video/upload/so_1,f_jpg,q_auto/v1791015572/plusmark/videos/eco-premium-both-side.jpg",
    productSlugs: ["eco-premium-both-side-board"],
  },
  metallicWhite: {
    title: "Metallic Premium White Board",
    caption: "Heavy-duty aluminium framing with Signature Dual-Tone Corners.",
    src: "https://res.cloudinary.com/drt0rpkn2/video/upload/v1791016477/plusmark/videos/metallic-premium-white-board.mp4",
    poster: "https://res.cloudinary.com/drt0rpkn2/video/upload/so_1,f_jpg,q_auto/v1791016477/plusmark/videos/metallic-premium-white-board.jpg",
    productSlugs: ["metallic-premium-white-board"],
  },
  metallicChalk: {
    title: "Metallic Premium Chalk Board",
    caption: "Non-reflective, glare-free Hardcore Chalk Grade HPL surface.",
    src: "https://res.cloudinary.com/drt0rpkn2/video/upload/v1791016355/plusmark/videos/metallic-premium-chalk-board.mp4",
    poster: "https://res.cloudinary.com/drt0rpkn2/video/upload/so_1,f_jpg,q_auto/v1791016355/plusmark/videos/metallic-premium-chalk-board.jpg",
    productSlugs: ["metallic-premium-chalk-board"],
  },
  metallicNotice: {
    title: "Metallic Premium Notice Board",
    caption: "2 mm blazer cloth with long-lasting colour retention.",
    src: "https://res.cloudinary.com/drt0rpkn2/video/upload/v1791016412/plusmark/videos/metallic-premium-notice-board.mp4",
    poster: "https://res.cloudinary.com/drt0rpkn2/video/upload/so_1,f_jpg,q_auto/v1791016412/plusmark/videos/metallic-premium-notice-board.jpg",
    productSlugs: ["metallic-premium-notice-board"],
  },
  metallicBothSide: {
    title: "Metallic Premium Both Side Board",
    caption: "White board and chalk board in one Metallic Premium frame.",
    src: "https://res.cloudinary.com/drt0rpkn2/video/upload/v1791016288/plusmark/videos/metallic-premium-both-side.mp4",
    poster: "https://res.cloudinary.com/drt0rpkn2/video/upload/so_1,f_jpg,q_auto/v1791016288/plusmark/videos/metallic-premium-both-side.jpg",
    productSlugs: ["metallic-premium-both-side-board"],
  },
  installation: {
    title: "Board Installation",
    caption: "How a Plusmark board is mounted on the wall, step by step.",
    src: "https://res.cloudinary.com/drt0rpkn2/video/upload/v1791015552/plusmark/videos/board-installation.mp4",
    poster: "https://res.cloudinary.com/drt0rpkn2/video/upload/so_1,f_jpg,q_auto/v1791015552/plusmark/videos/board-installation.jpg",
    productSlugs: [],
  },
  retailInstallation: {
    title: "Plusmark Retail Board Installation",
    caption: "Installing a Plusmark Retail board with the supplied hangers.",
    src: "https://res.cloudinary.com/drt0rpkn2/video/upload/v1791016507/plusmark/videos/retail-board-installation.mp4",
    poster: "https://res.cloudinary.com/drt0rpkn2/video/upload/so_1,f_jpg,q_auto/v1791016507/plusmark/videos/retail-board-installation.jpg",
    productSlugs: [],
  },
};

async function sync() {
  const updates = {};
  let i = 0;
  for (const [key, v] of Object.entries(staticVideos)) {
    updates[`videos/${key}`] = {
      ...v,
      order: i++,
      updatedAt: new Date().toISOString(),
    };
  }
  await db.ref().update(updates);
  console.log("Successfully synchronized all 10 videos with complete URLs and data into Firebase!");
  process.exit(0);
}

sync().catch((err) => {
  console.error("Sync error:", err);
  process.exit(1);
});
