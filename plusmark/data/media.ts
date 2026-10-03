/**
 * Product videos from the Plusmark Drive: re-encoded from the 1920×1080 masters to 1080p H.264
 * (CRF 21, ≤4.5 Mbps, faststart) in Cloudinary, with a full-HD poster frame alongside. Only products that have their own footage get a product video; every wall
 * board also shows the installation guide.
 */
export interface Video {
  src: string;
  poster: string;
  title: string;
  caption: string;
}

const cloudinaryVideoUrls: Record<string, string> = {
  "board-installation":
    "https://res.cloudinary.com/drt0rpkn2/video/upload/v1791015552/plusmark/videos/board-installation.mp4",
  "eco-premium-both-side":
    "https://res.cloudinary.com/drt0rpkn2/video/upload/v1791015572/plusmark/videos/eco-premium-both-side.mp4",
  "eco-premium-chalk-board":
    "https://res.cloudinary.com/drt0rpkn2/video/upload/v1791015594/plusmark/videos/eco-premium-chalk-board.mp4",
  "eco-premium-notice-board":
    "https://res.cloudinary.com/drt0rpkn2/video/upload/v1791015611/plusmark/videos/eco-premium-notice-board.mp4",
  "eco-premium-white-board":
    "https://res.cloudinary.com/drt0rpkn2/video/upload/v1791015631/plusmark/videos/eco-premium-white-board.mp4",
  "metallic-premium-both-side":
    "https://res.cloudinary.com/drt0rpkn2/video/upload/v1791016288/plusmark/videos/metallic-premium-both-side.mp4",
  "metallic-premium-chalk-board":
    "https://res.cloudinary.com/drt0rpkn2/video/upload/v1791016355/plusmark/videos/metallic-premium-chalk-board.mp4",
  "metallic-premium-notice-board":
    "https://res.cloudinary.com/drt0rpkn2/video/upload/v1791016412/plusmark/videos/metallic-premium-notice-board.mp4",
  "metallic-premium-white-board":
    "https://res.cloudinary.com/drt0rpkn2/video/upload/v1791016477/plusmark/videos/metallic-premium-white-board.mp4",
  "retail-board-installation":
    "https://res.cloudinary.com/drt0rpkn2/video/upload/v1791016507/plusmark/videos/retail-board-installation.mp4",
};

const v = (file: string, title: string, caption: string): Video => ({
  src: cloudinaryVideoUrls[file],
  poster: `/videos/${file}.jpg`,
  title,
  caption,
});

export const videos = {
  ecoWhite: v("eco-premium-white-board", "Eco Premium White Board", "High Gloss HPL writing surface, aluminium anodised frame and ABS dual-tone corners."),
  ecoChalk: v("eco-premium-chalk-board", "Eco Premium Chalk Board", "Hardcore Chalk Grade HPL surface in the Eco Premium frame."),
  ecoNotice: v("eco-premium-notice-board", "Eco Premium Notice Board", "Velvet pin-up surface with a soft, pin-friendly core."),
  ecoBothSide: v("eco-premium-both-side", "Eco Premium Both Side Board", "White board on one side, chalk board on the other."),
  metallicWhite: v("metallic-premium-white-board", "Metallic Premium White Board", "Heavy-duty aluminium framing with Signature Dual-Tone Corners."),
  metallicChalk: v("metallic-premium-chalk-board", "Metallic Premium Chalk Board", "Non-reflective, glare-free Hardcore Chalk Grade HPL surface."),
  metallicNotice: v("metallic-premium-notice-board", "Metallic Premium Notice Board", "2 mm blazer cloth with long-lasting colour retention."),
  metallicBothSide: v("metallic-premium-both-side", "Metallic Premium Both Side Board", "White board and chalk board in one Metallic Premium frame."),
  installation: v("board-installation", "Board Installation", "How a Plusmark board is mounted on the wall, step by step."),
  retailInstallation: v("retail-board-installation", "Plusmark Retail Board Installation", "Installing a Plusmark Retail board with the supplied hangers."),
} satisfies Record<string, Video>;

/** Product slug → its own product videos (first one is the headline video). */
const productVideoMap: Record<string, Video[]> = {
  "eco-premium-white-board": [videos.ecoWhite, videos.ecoBothSide],
  "eco-premium-both-side-board": [videos.ecoBothSide],
  "eco-premium-chalk-board": [videos.ecoChalk, videos.ecoBothSide],
  "eco-premium-notice-board": [videos.ecoNotice],
  "metallic-premium-white-board": [videos.metallicWhite, videos.metallicBothSide],
  "metallic-premium-chalk-board": [videos.metallicChalk, videos.metallicBothSide],
  "metallic-premium-notice-board": [videos.metallicNotice],
};

/** Wall boards that get the installation guide video. */
const WALL_BOARD_CATEGORIES = new Set(["white-boards", "chalk-boards", "notice-boards", "magnetic-boards", "ceramic-boards", "specialty-boards"]);

export function getProductVideos(slug: string, categorySlug: string): Video[] {
  const own = productVideoMap[slug] ?? [];
  if (!WALL_BOARD_CATEGORIES.has(categorySlug)) return own;
  return [...own, videos.installation];
}

/** Every film once, for the "Spin the film reel" section on every home page variant. */
export const allVideos: Video[] = Object.values(videos);
