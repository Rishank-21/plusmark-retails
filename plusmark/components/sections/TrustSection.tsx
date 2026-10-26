// import { company } from "@/data/company";
// import { Reveal } from "@/components/animations/Reveal";
// import { LogoMark } from "@/components/ui/Logo";

// const RING = "GEM PORTAL APPROVED • PAN INDIA SUPPLY • MADE IN INDIA • ";

// export function TrustSection() {
//   return (
//     <section aria-labelledby="trust-title" className="noise relative overflow-hidden bg-gradient-to-br from-brand-deep via-graphite to-ink py-24 text-white md:py-32">
//       <div aria-hidden className="grid-lines absolute inset-0 opacity-[0.12] invert [mask-image:radial-gradient(80%_70%_at_50%_40%,black,transparent)]" />
//       <div aria-hidden className="pointer-events-none absolute -left-32 top-10 size-[30rem] rounded-full bg-accent/25 blur-[120px]" />
//       <div aria-hidden className="pointer-events-none absolute -right-24 bottom-0 size-[26rem] rounded-full bg-flame/20 blur-[120px]" />
//       <div className="container-x relative">
//         <div className="grid items-center gap-16 lg:grid-cols-[1.2fr_1fr] lg:gap-24">
//           <Reveal>
//             <h2 id="trust-title" className="font-display text-[clamp(2.6rem,6vw,5rem)] font-semibold leading-[1]">
//               Best Quality. <span className="text-gradient-light">Best Rate.</span>
//             </h2>
//             <p className="mt-8 max-w-2xl text-lg leading-relaxed text-alu md:text-xl md:leading-relaxed">{company.panIndia}</p>
//           </Reveal>

//           {/* Brand emblem: the Plusmark monogram inside a slowly turning seal of its credentials. */}
//           <Reveal delay={0.1} className="flex justify-center lg:justify-end">
//             <div className="relative aspect-square w-full max-w-[22rem]">
//               <svg viewBox="0 0 200 200" aria-hidden className="absolute inset-0 size-full animate-[spin_50s_linear_infinite] motion-reduce:animate-none">
//                 <defs>
//                   <path id="trust-ring" d="M100,100 m-84,0 a84,84 0 1,1 168,0 a84,84 0 1,1 -168,0" />
//                 </defs>
//                 <text className="fill-white/60 font-mono" fontSize="10" letterSpacing="2.8">
//                   <textPath href="#trust-ring">{RING.repeat(2)}</textPath>
//                 </text>
//               </svg>
//               <div className="absolute inset-[16%] flex items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/15 backdrop-blur-sm">
//                 <div className="absolute inset-[8%] rounded-full border border-dashed border-white/15" />
//                 <div className="flex flex-col items-center gap-4 px-6 text-center">
//                   <LogoMark className="size-28" />
//                   <span className="rounded-full bg-flame px-3 py-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white">
//                     Since {company.established}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </Reveal>
//         </div>
//       </div>
//     </section>
//   );
// }






import { ArrowUpRight } from "lucide-react";

import { company } from "@/data/company";
import { Reveal } from "@/components/animations/Reveal";
import { LogoMark } from "@/components/ui/Logo";

export function TrustSection() {
  return (
    <section
      aria-labelledby="trust-title"
      className="noise relative isolate overflow-hidden bg-gradient-to-br from-brand-deep via-graphite to-ink py-16 text-white sm:py-20 lg:py-24"
    >
      {/* Soft background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-0 size-[28rem] rounded-full bg-accent/[0.12] blur-[130px]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 bottom-0 size-[26rem] rounded-full bg-white/[0.035] blur-[130px]"
      />

      <div className="container-x relative">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* LEFT: MAIN MESSAGE */}
          <Reveal>
            <div className="max-w-xl">
              <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-alu sm:text-xs">
                The Plusmark Difference
              </p>

              <h2
                id="trust-title"
                className="font-display text-[clamp(2.8rem,5.5vw,4.8rem)] font-medium leading-[1.05] tracking-tight"
              >
                Best Quality.
                <span className="mt-1 block text-gradient-light">
                  Best Rate.
                </span>
              </h2>

              <p className="mt-5 max-w-lg text-base leading-7 text-alu sm:leading-8">
                GEM-approved and made in India, Plusmark delivers dependable educational and institutional products with consistent quality, fair rates and Pan India supply.
              </p>

              <a
                href="#location"
                className="group mt-6 inline-flex items-center gap-2.5 text-lg font-semibold text-white/90 transition-colors hover:text-accent"
              >
                Discover Plusmark
                <ArrowUpRight className="size-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
            </div>
          </Reveal>

          {/* RIGHT: MINIMAL BRAND IDENTITY */}
          <Reveal delay={0.12}>
            <div className="flex min-h-[260px] w-full items-center justify-center py-8 sm:min-h-[320px] lg:min-h-[420px] lg:py-0">
              <div className="flex items-baseline gap-3 sm:gap-4 lg:gap-5">
                {/* Lightened Logo */}
                <div className="relative top-1 size-14 shrink-0 opacity-60 sm:top-1.5 sm:size-20 lg:top-2 lg:size-24">
                  <LogoMark className="size-full" />
                </div>

                {/* Brand Name + Centered Tagline */}
                <div className="min-w-0">
                  <h3 className="whitespace-nowrap font-display text-[3.5rem] font-bold leading-none tracking-[-0.065em] text-white/75 sm:text-[5rem] lg:text-[6rem] xl:text-[6.5rem]">
                    PLUSMARK
                    <sup className="ml-1 align-top text-xs tracking-normal text-white/50 sm:text-sm">
                      ®
                    </sup>
                  </h3>

                  <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-white/55 sm:text-xs sm:tracking-[0.24em] lg:text-sm">
                    WRITING &amp; DISPLAY SYSTEM
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
