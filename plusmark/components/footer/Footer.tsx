import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { categories } from "@/data/categories";
import { company, contactChannels } from "@/data/company";
import { navLinks } from "@/lib/seo";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="noise relative overflow-hidden bg-gradient-to-b from-graphite to-ink text-alu">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-brand/40 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="container-x relative pt-16">
        <p
          aria-hidden
          className="select-none text-center font-display text-[clamp(3.5rem,14vw,12rem)] font-semibold leading-none tracking-[-0.04em] text-white/[0.04]"
        >
          plusmark
        </p>
      </div>
      <div className="container-x relative grid gap-14 pb-20 pt-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo tone="light" />
          <p className="mt-6 max-w-sm text-sm leading-relaxed">
            An Indian manufacturing brand established in {company.established}, specializing in high-quality
            educational and institutional products — white boards, chalk boards, notice boards, ceramic and magnetic
            boards, school benches and all types of board stands.
          </p>
          <p className="mt-6 font-display text-lg text-white">{company.tagline}</p>
          <p className="eyebrow mt-1 !text-alu-dark">{company.subline}</p>
        </div>

        <nav aria-label="Footer" className="md:col-span-2">
          <h2 className="eyebrow mb-5 !text-alu-dark">Navigate</h2>
          <ul className="space-y-2.5 text-sm">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-underline hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Product categories" className="md:col-span-4">
          <h2 className="eyebrow mb-5 !text-alu-dark">Products</h2>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-2.5 text-sm sm:grid-cols-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/products/${c.slug}`} className="link-underline hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-2">
          <h2 className="eyebrow mb-5 !text-alu-dark">Contact</h2>
          <ul className="space-y-2.5 text-sm">
            <li>
              <a href={company.website} className="link-underline hover:text-white">
                {company.websiteLabel}
              </a>
            </li>
            {contactChannels.email && (
              <li>
                <a href={`mailto:${contactChannels.email}`} className="link-underline hover:text-white">
                  {contactChannels.email}
                </a>
              </li>
            )}
            {contactChannels.phone && (
              <li>
                <a href={`tel:${contactChannels.phone}`} className="link-underline hover:text-white">
                  {contactChannels.phoneLabel}
                </a>
              </li>
            )}
            <li>
              <Link href="/contact#location" className="link-underline hover:text-white">
                Narolgam, Ahmedabad
              </Link>
            </li>
            <li>
              <Link
                href="/contact#enquiry"
                className="mt-2 inline-flex h-10 items-center rounded-full bg-white px-5 text-[0.8rem] font-semibold text-graphite transition hover:bg-mist"
              >
                Request Enquiry →
              </Link>
            </li>
          </ul>
          <ul className="mt-8 flex flex-wrap gap-2 text-[0.7rem] text-alu">
            {["Made in India", "GEM Portal Approved", "Pan India Supply"].map((t) => (
              <li key={t} className="rounded-full px-3 py-1 ring-1 ring-white/15">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-x flex flex-col gap-3 py-6 text-xs text-alu-dark md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {company.name}. All rights reserved.
          </p>
          <ul className="flex gap-6">
            <li>
              <Link href="/privacy-policy" className="link-underline hover:text-white">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms" className="link-underline hover:text-white">Terms</Link>
            </li>
            <li>
              <Link href="/site-map" className="link-underline hover:text-white">Sitemap</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
