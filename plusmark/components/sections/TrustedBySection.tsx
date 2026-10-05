import { trustedClients } from "@/data/clients";
import { Reveal } from "@/components/animations/Reveal";
import { LogoMarquee } from "./LogoMarquee";

/** Home page: organizations Plusmark has supplied, as a slowly drifting strip of logo cards. */
export function TrustedBySection() {
  return (
    <section aria-labelledby="trusted-title" className="border-y border-fog bg-mist/40 py-20 md:py-28">
      <Reveal className="container-x">
        <div className="mx-auto max-w-4xl text-center">
          {/* Theme C sets heading letter-spacing outside the utility layer, hence the "!" */}
          <h2
            id="trusted-title"
            className="font-display text-[clamp(1.4rem,2.6vw,2.1rem)] font-semibold uppercase leading-[1.15] !tracking-[0.07em] text-graphite"
          >
            Trusted by leading organizations
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-steel md:text-lg">
            Trusted by educational institutions, government organizations and leading businesses across India.
          </p>
        </div>
      </Reveal>
      <Reveal delay={0.08} className="mt-10 md:mt-14">
        <LogoMarquee clients={trustedClients} />
      </Reveal>
    </section>
  );
}
