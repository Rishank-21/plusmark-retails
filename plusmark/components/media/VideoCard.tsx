import type { Video } from "@/data/media";
import { cn } from "@/lib/utils";

/**
 * Native, lazy video player: nothing is downloaded until the visitor presses play
 * (preload="none" + poster frame), so pages stay light even with several videos.
 */
export function VideoCard({ video, className, large = false }: { video: Video; className?: string; large?: boolean }) {
  return (
    <figure className={cn("card-premium overflow-hidden", className)}>
      <div className="relative aspect-video bg-fog">
        <video
          className="absolute inset-0 size-full object-cover"
          src={video.src}
          poster={video.poster}
          controls
          preload="none"
          playsInline
          aria-label={video.title}
        />
      </div>
      <figcaption className={cn("px-5 py-4", large && "md:px-7 md:py-5")}>
        <span className={cn("block font-display font-semibold text-graphite", large ? "text-lg md:text-xl" : "text-base")}>
          {video.title}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-steel">{video.caption}</span>
      </figcaption>
    </figure>
  );
}
