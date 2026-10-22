import { NextResponse } from "next/server";
import { websiteFirestore } from "@/lib/firebase-admin";
import { isAdmin } from "@/lib/admin-auth";
import { videos } from "@/data/media";

/**
 * One-time initialization endpoint to populate the database with the static videos data.
 */
export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const collection = websiteFirestore().collection("website_videos");
    const snapshot = await collection.get();
    
    if (!snapshot.empty) {
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

    const batch = websiteFirestore().batch();
    Object.entries(videos).forEach(([key, video], index) => {
      const newRef = collection.doc();
      batch.set(newRef, {
        src: video.src,
        poster: video.poster,
        title: video.title,
        caption: video.caption,
        productSlugs: videoProductMap[key] || [],
        order: index,
        createdAt: new Date().toISOString(),
      });
    });
    await batch.commit();

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
