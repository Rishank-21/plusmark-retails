import { MapPin, Phone, Navigation, MessageCircle } from "lucide-react";
import {
  company,
  contactChannels,
  fullAddress,
  location,
  mapsDirectionsUrl,
  mapsEmbedUrl,
  whatsappHref,
} from "@/data/company";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/animations/Reveal";

export function LocationSection() {
  return (
    <section id="location" aria-labelledby="location-title" className="scroll-mt-20 bg-white py-24 md:py-32">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
        <Reveal>
          <SectionHeading
            id="location-title"
            eyebrow="Visit Us"
            title="Our factory in Ahmedabad."
            intro="Walk in to see the product range, or call ahead and we'll have samples ready."
          />

          <dl className="mt-10 space-y-7 text-sm">
            <div className="flex gap-4">
              <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" />
              <div>
                <dt className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-alu-dark">Address</dt>
                <dd className="mt-1.5 leading-relaxed">
                  <address className="not-italic">
                    <span className="font-semibold">{company.name}</span>
                    <br />
                    {location.street},
                    <br />
                    {location.city}, {location.region} {location.postalCode}
                  </address>
                  <span className="mt-1 block text-xs text-steel">Plus code: {location.plusCode}</span>
                </dd>
              </div>
            </div>

            <div className="flex gap-4">
              <Phone aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" />
              <div>
                <dt className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-alu-dark">Phone</dt>
                <dd className="mt-1.5">
                  <a href={`tel:${contactChannels.phone}`} className="link-underline text-base font-semibold">
                    {contactChannels.phoneLabel}
                  </a>
                  <span className="mt-1 block text-xs text-steel">Call or WhatsApp · Opens 8 am</span>
                </dd>
              </div>
            </div>
          </dl>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={mapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 bg-graphite px-5 text-sm font-semibold text-white transition-colors hover:bg-ink"
            >
              <Navigation aria-hidden className="size-4" /> Get Directions
              <span className="sr-only">(opens Google Maps in a new tab)</span>
            </a>
            <a
              href={whatsappHref("Hello Plusmark, I would like to visit your factory.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 px-5 text-sm font-semibold text-verdant ring-1 ring-line transition-colors hover:ring-verdant"
            >
              <MessageCircle aria-hidden className="size-4" /> WhatsApp
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="relative min-h-[360px] overflow-hidden bg-mist ring-1 ring-line lg:min-h-[480px]">
          <iframe
            src={mapsEmbedUrl}
            title={`Map showing ${company.name}, ${fullAddress}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        </Reveal>
      </div>
    </section>
  );
}
