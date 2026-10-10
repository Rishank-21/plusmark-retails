import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { videos } from "@/data/media";

/**
 * One-time initialization endpoint to populate the database with the static videos data.
 */
export async function POST() {
  try {
    const db = adminDb();
    const snapshot = await db.ref("videos").once("value");
    
    if (snapshot.exists()) {
      return NextResponse.json({ 
        success: false, 
        message: "Videos already exist in database. Use the admin panel to manage them." 
      });
    }

    // Map product slugs from productVideoMap
    const productVideoMap: Record<string, string[]> = {
      "eco-premium-white-board": ["ecoWhite", "ecoBothSide"],
      "eco-premium-both-side-board": ["ecoBothSide"],
      "eco-premium-chalk-board": ["ecoChalk", "ecoBothSide"],
      "eco-premium-notice-board": ["ecoNotice"],
      "metallic-premium-white-board": ["metallicWhite", "metallicBothSide"],
      "metallic-premium-chalk-board": ["metallicChalk", "metallicBothSide"],
      "metallic-premium-notice-board": ["metallicNotice"],
    };

    // Reverse map to get video -> products
    const videoProductMap: Record<string, string[]> = {};
    Object.entries(productVideoMap).forEach(([productSlug, videoKeys]) => {
      videoKeys.forEach((key) => {
        if (!videoProductMap[key]) videoProductMap[key] = [];
        videoProductMap[key].push(productSlug);
      });
    });

    const updates: Record<string, any> = {};
    Object.entries(videos).forEach(([key, video], index) => {
      const newRef = db.ref("videos").push();
      updates[`videos/${newRef.key}`] = {
        src: video.src,
        poster: video.poster,
        title: video.title,
        caption: video.caption,
        productSlugs: videoProductMap[key] || [],
        order: index,
        createdAt: new Date().toISOString(),
      };
    });

    await db.ref().update(updates);

    return NextResponse.json({ 
      success: true, 
      message: `Initialized ${Object.keys(videos).length} videos successfully.` 
    });
  } catch (error) {
    console.error("Error initializing videos:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
