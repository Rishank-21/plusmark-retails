import { requireAdmin } from "@/lib/admin-auth";
import { products } from "@/data/products";
import { getVideos } from "./actions";
import { VideosManager } from "./VideosManager";
import { PageTitle } from "../PageTitle";

export const metadata = { title: "Videos" };

export default async function AdminVideosPage() {
  await requireAdmin();
  const videos = await getVideos();
  const productOptions = products.map((p) => ({ slug: p.slug, name: p.name })).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <PageTitle title="Videos" text="Product and installation videos for the home page film reel and product pages." />
      <VideosManager initialVideos={videos} products={productOptions} />
    </div>
  );
}
