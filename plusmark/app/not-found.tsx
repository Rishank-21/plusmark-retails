import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { categories } from "@/data/categories";

export const metadata = { title: "Page not found", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <section className="relative flex min-h-[88svh] items-center overflow-hidden studio-bg pt-[68px]">
      <div aria-hidden className="grid-lines absolute inset-0 [mask-image:radial-gradient(60%_60%_at_50%_50%,black,transparent)]" />
      <div className="container-x relative grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <p className="eyebrow">Error 404</p>
          <h1 className="mt-5 font-display text-[clamp(2.6rem,7vw,5.6rem)] font-semibold leading-[0.98]">
            This board is blank.
          </h1>
          <p className="mt-6 max-w-md text-lg text-steel">
            The page you’re looking for doesn’t exist or has moved. Try the product catalogue instead.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <ButtonLink href="/products">Browse Products</ButtonLink>
            <ButtonLink href="/" variant="secondary" arrow={false}>
              Back to Home
            </ButtonLink>
          </div>
        </div>
        <div aria-hidden className="relative mx-auto aspect-[4/3] w-full max-w-md bg-white shadow-[0_40px_80px_-40px_rgb(28_31_35/0.35)] ring-[12px] ring-[#c9cdd2]">
          {[
            "-left-4 -top-4",
            "-right-4 -top-4",
            "-left-4 -bottom-4",
            "-right-4 -bottom-4",
          ].map((p) => (
            <span key={p} className={`absolute size-9 bg-graphite ${p}`}>
              <span className="absolute inset-2 bg-alu" />
            </span>
          ))}
          <span className="absolute inset-0 flex items-center justify-center font-display text-7xl font-semibold text-fog">404</span>
        </div>
      </div>
      <nav aria-label="Categories" className="sr-only">
        <ul>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/products/${c.slug}`}>{c.name}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
