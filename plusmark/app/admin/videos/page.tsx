import { getVideos } from "./actions";
import { VideosManager } from "./VideosManager";

export const metadata = {
  title: "Manage Videos — Plusmark Admin",
};

export default async function AdminVideosPage() {
  const videos = await getVideos();

  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-5">
        <h1 className="font-display text-2xl font-bold tracking-tight text-graphite sm:text-3xl">
          Manage Videos
        </h1>
        <p className="mt-1 text-sm text-steel">
          Preview, upload, link to products, and reorder product videos for the showroom reel.
        </p>
      </div>

      <VideosManager initialVideos={videos} />
    </div>
  );
}
