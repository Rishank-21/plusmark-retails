import Image from "next/image";
import type { AplusImage } from "@/data/aplus";
import { APLUS_HEIGHT, APLUS_WIDTH } from "@/data/aplus";
import type { Video } from "@/data/media";
import { Reveal } from "@/components/animations/Reveal";
import { VideoCard } from "@/components/media/VideoCard";

/** Amazon A+ style explainer banners, stacked full width like the marketplace listing. */
export function ProductHighlights({ images, name }: { images: AplusImage[]; name: string }) {
  if (!images.length) return null;
  return (
    <section aria-labelledby="highlights-title" className="border-t border-fog bg-mist py-16 md:py-24">
      <div className="container-x">
        <Reveal className="mb-10 max-w-2xl">
          <p className="eyebrow">Product highlights</p>
          <h2 id="highlights-title" className="mt-3 font-display text-2xl font-semibold md:text-4xl">
            {name}, explained.
          </h2>
        </Reveal>
        <ul className="mx-auto grid max-w-6xl gap-5 md:gap-8">
          {images.map((img) => (
            <Reveal as="li" key={img.src} className="card-premium overflow-hidden">
              <Image
                src={img.src}
                alt={img.alt}
                width={APLUS_WIDTH}
                height={APLUS_HEIGHT}
                sizes="(min-width: 1152px) 1152px, 100vw"
                quality={85}
                className="h-auto w-full"
              />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Product and installation videos. The first one is shown large. */
export function ProductVideos({ videos }: { videos: Video[] }) {
  if (!videos.length) return null;
  const [lead, ...rest] = videos;
  return (
    <section aria-labelledby="videos-title" className="border-t border-fog py-16 md:py-24">
      <div className="container-x">
        <Reveal className="mb-10 max-w-2xl">
          <p className="eyebrow">Videos</p>
          <h2 id="videos-title" className="mt-3 font-display text-2xl font-semibold md:text-4xl">
            See it on camera.
          </h2>
        </Reveal>
        <div className={rest.length ? "grid gap-6 lg:grid-cols-[1.6fr_1fr]" : "mx-auto max-w-4xl"}>
          <Reveal>
            <VideoCard video={lead} large />
          </Reveal>
          {rest.length > 0 && (
            <ul className="grid content-start gap-6 sm:grid-cols-2 lg:grid-cols-1">
              {rest.map((v, i) => (
                <Reveal as="li" key={v.src} delay={0.06 * (i + 1)}>
                  <VideoCard video={v} />
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
