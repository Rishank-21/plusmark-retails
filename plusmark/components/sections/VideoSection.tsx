import { homeVideos } from "@/data/media";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/animations/Reveal";
import { VideoCard } from "@/components/media/VideoCard";

/** Home page: product and installation films from the Plusmark Drive. */
export function VideoSection() {
  const [lead, ...rest] = homeVideos;
  return (
    <section aria-labelledby="videos-title" className="bg-mist py-24 md:py-32">
      <div className="container-x">
        <Reveal className="mb-14">
          <SectionHeading
            id="videos-title"
            eyebrow="See it in action"
            title={
              <>
                Watch the boards <span className="text-gradient">up close.</span>
              </>
            }
            intro="Frames, corners and surfaces on camera, plus how a Plusmark board goes up on the wall."
          />
        </Reveal>
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Reveal>
            <VideoCard video={lead} large />
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {rest.slice(0, 2).map((v, i) => (
              <Reveal key={v.src} delay={0.06 * (i + 1)}>
                <VideoCard video={v} />
              </Reveal>
            ))}
          </div>
        </div>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.slice(2).map((v, i) => (
            <Reveal as="li" key={v.src} delay={0.05 * i}>
              <VideoCard video={v} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
