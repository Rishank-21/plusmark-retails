// import { ArrowUpRight, Clock, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
// import {
//   company,
//   contactChannels,
//   fullAddress,
//   location,
//   mapsDirectionsUrl,
//   mapsEmbedUrl,
//   whatsappHref,
// } from "@/data/company";
// import { Reveal } from "@/components/animations/Reveal";

// /**
//  * Factory location: a warm info panel on the left and a full-bleed map on the right
//  * (the map runs to the edge of the screen on desktop).
//  */
// export function LocationSection() {
//   return (
//     <section id="location" aria-labelledby="location-title" className="scroll-mt-20 bg-gradient-to-b from-white to-mist/30">
//       <div className="grid lg:min-h-[42rem] lg:grid-cols-[minmax(28rem,38rem)_minmax(0,1fr)]">
//         <div className="flex flex-col px-6 py-20 sm:px-12 lg:py-24 lg:pl-[max(3.5rem,calc((100vw-88rem)/2+4.5rem))] lg:pr-16">
//           <Reveal>
//             <h2 id="location-title" className="font-display text-[clamp(2.5rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight text-graphite">
//               Our factory<br />in Ahmedabad.
//             </h2>
//             <p className="mt-5 max-w-lg text-[0.98rem] leading-relaxed text-steel">
//               Walk in to see the product range, or call ahead and we&apos;ll have samples ready.
//             </p>
//           </Reveal>

//           <dl className="mt-14 space-y-8">
//             <Reveal delay={0.1}>
//               <div className="flex gap-4">
//                 <MapPin aria-hidden className="mt-1 size-5 shrink-0 text-flame" />
//                 <div>
//                   <dt className="mb-2 text-xs font-semibold uppercase tracking-wider text-alu-dark">Address</dt>
//                   <dd className="leading-relaxed text-graphite">
//                     <address className="not-italic">
//                       <span className="block font-semibold">{company.name}</span>
//                       <span className="mt-1 block text-steel">{location.street},</span>
//                       <span className="block text-steel">{location.city}, {location.region} {location.postalCode}</span>
//                     </address>
//                     <span className="mt-2 block text-xs text-alu-dark">Plus code: {location.plusCode}</span>
//                   </dd>
//                 </div>
//               </div>
//             </Reveal>
//             <Reveal delay={0.15}>
//               <div className="flex gap-4">
//                 <Phone aria-hidden className="mt-1 size-5 shrink-0 text-flame" />
//                 <div>
//                   <dt className="mb-2 text-xs font-semibold uppercase tracking-wider text-alu-dark">Phone</dt>
//                   <dd>
//                     <a href={`tel:${contactChannels.phone}`} className="text-[1rem] font-semibold text-graphite transition-colors hover:text-flame">
//                       {contactChannels.phoneLabel}
//                     </a>
//                     <span className="mt-1 block text-sm text-steel">Call or WhatsApp · Opens 8 am</span>
//                   </dd>
//                 </div>
//               </div>
//             </Reveal>
//           </dl>

//           <Reveal delay={0.2} className="mt-auto flex flex-wrap gap-3 pt-12 lg:pt-16">
//             <a
//               href={mapsDirectionsUrl}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="group inline-flex h-11 items-center gap-2 rounded-md bg-[#1a5f3f] px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#154a32]"
//             >
//               <Navigation aria-hidden className="size-4" />
//               Get Directions
//               <span className="sr-only">(opens Google Maps in a new tab)</span>
//             </a>
//             <a
//               href={whatsappHref("Hello Plusmark, I would like to visit your factory.")}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="group inline-flex h-11 items-center gap-2 rounded-md border border-line bg-white px-5 text-sm font-semibold text-graphite shadow-sm transition-all hover:border-graphite hover:bg-mist"
//             >
//               <MessageCircle aria-hidden className="size-4" />
//               WhatsApp
//               <span className="sr-only">(opens in a new tab)</span>
//             </a>
//           </Reveal>
//         </div>

//         <div className="relative min-h-[28rem] bg-mist sm:min-h-[32rem] lg:min-h-full">
//           <iframe
//             src={mapsEmbedUrl}
//             title={`Map showing ${company.name}, ${fullAddress}`}
//             loading="lazy"
//             referrerPolicy="no-referrer-when-downgrade"
//             allowFullScreen
//             className="absolute inset-0 size-full border-0"
//           />
//         </div>
//       </div>
//     </section>
//   );
// }







import {
  ArrowUpRight,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
} from "lucide-react";

import {
  company,
  contactChannels,
  fullAddress,
  location,
  mapsDirectionsUrl,
  mapsEmbedUrl,
  whatsappHref,
} from "@/data/company";

import { Reveal } from "@/components/animations/Reveal";

export function LocationSection() {
  return (
    <section
      id="location"
      aria-labelledby="location-title"
      className="scroll-mt-20 overflow-hidden bg-[#F6F5F0]"
    >
      <div className="grid min-h-[540px] lg:min-h-[580px] lg:grid-cols-[minmax(360px,0.38fr)_minmax(0,0.62fr)]">
        {/* LEFT: LOCATION DETAILS */}
        <div className="flex flex-col px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14 xl:px-16">
          <Reveal>
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-[#1A5F3F]" />

                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A5F3F]">
                  Plusmark · Ahmedabad
                </span>
              </div>

              <h2
                id="location-title"
                className="font-display text-4xl font-semibold leading-tight tracking-tight text-[#202923] sm:text-5xl"
              >
                Our
                <span className="block text-[#1A5F3F]">
                  Location.
                </span>
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-6 text-[#68716B] sm:text-base">
                Visit our facility to explore our board collection
                and discuss your product requirements with our team.
              </p>
            </div>
          </Reveal>

          {/* ADDRESS */}
          <Reveal delay={0.1}>
            <div className="border-t border-[#DDE1D8] py-5">
              <h3 className="text-xl font-semibold tracking-tight text-[#202923]">
                Visit Our Facility
              </h3>

              <div className="mt-4 flex items-start gap-3">
                <MapPin className="mt-1 size-5 shrink-0 text-[#1A5F3F]" />

                <address className="not-italic text-sm leading-6 text-[#505C53]">
                  <span className="block font-semibold text-[#202923]">
                    {company.name}
                  </span>

                  {location.street}
                  <br />

                  {location.city}, {location.region}{" "}
                  {location.postalCode}

                  <span className="mt-2 block text-xs text-[#7D887F]">
                    Plus Code: {location.plusCode}
                  </span>
                </address>
              </div>
            </div>
          </Reveal>

          {/* PHONE */}
          <Reveal delay={0.15}>
            <div className="border-t border-[#DDE1D8] py-5">
              <h3 className="text-xl font-semibold tracking-tight text-[#202923]">
                Get in Touch
              </h3>

              <div className="mt-4 flex items-start gap-3">
                <Phone className="mt-1 size-5 shrink-0 text-[#1A5F3F]" />

                <div>
                  <a
                    href={`tel:${contactChannels.phone}`}
                    className="text-base font-semibold text-[#202923] transition-colors hover:text-[#1A5F3F]"
                  >
                    {contactChannels.phoneLabel}
                  </a>

                  <p className="mt-1 text-sm leading-6 text-[#68716B]">
                    Call ahead to arrange your visit.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* ACTION BUTTONS */}
          <Reveal delay={0.2} className="mt-auto pt-4">
            <div className="flex flex-wrap gap-3">
              <a
                href={mapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1A5F3F] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-[#154A32] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5F3F] focus-visible:ring-offset-2 sm:px-6"
              >
                <Navigation className="size-4" />

                Get Directions

                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>

              <a
                href={whatsappHref(
                  "Hello Plusmark, I would like to visit your facility."
                )}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact Plusmark on WhatsApp"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#CCD7CC] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#1A5F3F] transition-colors hover:bg-[#E7EDE5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5F3F] focus-visible:ring-offset-2"
              >
                <MessageCircle className="size-4" />

                WhatsApp Us
              </a>
            </div>

            <p className="mt-3 text-xs leading-5 text-[#7D887F]">
              Please contact our team to confirm availability before
              visiting.
            </p>
          </Reveal>
        </div>

        {/* RIGHT: GOOGLE MAP */}
        <div className="relative min-h-[340px] overflow-hidden bg-[#E8EDE7] sm:min-h-[420px] lg:min-h-0">
          <iframe
            src={mapsEmbedUrl}
            title={`Map showing ${company.name}, ${fullAddress}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        </div>
      </div>
    </section>
  );
}
