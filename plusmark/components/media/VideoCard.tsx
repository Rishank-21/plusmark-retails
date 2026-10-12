import type { Video } from "@/data/media";
import { videoEmbed } from "@/lib/video-embed";
import { cn } from "@/lib/utils";

/**
 * Native, lazy video player: nothing is downloaded until the visitor presses play
 * (preload="none" + poster frame), so pages stay light even with several videos.
 * YouTube / Vimeo links use a lazy-loaded embed instead.
 */
export function VideoCard({ video, className, large = false }: { video: Video; className?: string; large?: boolean }) {
  const embed = videoEmbed(video.src).embedUrl;
  return (
    <figure className={cn("card-premium overflow-hidden", className)}>
      <div className="relative aspect-video bg-fog">
        {embed ? (
          <iframe
            src={embed}
            title={video.title}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <video
            className="absolute inset-0 size-full object-cover"
            src={video.src}
            poster={video.poster || undefined}
            controls
            preload="none"
            playsInline
            aria-label={video.title}
          />
        )}
      </div>
      <figcaption className={cn("px-5 py-4", large && "md:px-7 md:py-5")}>
        <span className={cn("block font-display font-semibold text-graphite", large ? "text-lg md:text-xl" : "text-base")}>
          {video.title}
        </span>
        {video.caption && <span className="mt-1 block text-sm leading-relaxed text-steel">{video.caption}</span>}
      </figcaption>
    </figure>
  );
}
