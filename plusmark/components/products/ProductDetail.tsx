import Link from "next/link";
import { ArrowRight, Check, Info, ShieldCheck } from "lucide-react";
import type { Product } from "@/data/types";
import { categoryMap } from "@/data/categories";
import { getRelatedProducts } from "@/data/products";
import { representativeModels } from "@/data/visuals";
import { company } from "@/data/company";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/animations/Reveal";
import { productSchema } from "@/lib/structured-data";
import { ProductViewer3D } from "./ProductViewer3D";
import { ProductCard } from "./ProductCard";
import { SizeEnquiryButton, SizePicker, SizeProvider } from "./SizeSelection";
import { EnquiryBand } from "@/components/sections/EnquiryBand";
import { getProductAplus } from "@/data/aplus";
import { AplusDescription } from "./AplusDescription";

/** Display-only swatch hints for catalog colour names. The name is always shown. */
const SWATCH: Record<string, string[]> = {
  "Royal & Navy Blue": ["#2b4fa3", "#1b2a55"],
  "Almond & Dark Green": ["#d8c7a3", "#23452f"],
  Red: ["#a3222a"],
  Maroon: ["#6b1f2a"],
  "Light Gray": ["#b9bcc0"],
  "Dark Gray": ["#4c5056"],
  Blue: ["#24479a"],
  Green: ["#2d5a3a"],
};

function Swatch({ name }: { name: string }) {
  const tones = SWATCH[name];
  return (
    <li className="flex items-center gap-3 bg-white px-4 py-3 ring-1 ring-fog">
      <span aria-hidden className="flex size-6 overflow-hidden rounded-full ring-1 ring-line">
        {tones ? (
          tones.map((t) => <span key={t} className="h-full flex-1" style={{ background: t }} />)
        ) : (
          <span className="h-full flex-1 bg-[conic-gradient(#a3222a,#d8c7a3,#23452f,#2b4fa3,#6b1f2a,#a3222a)]" />
        )}
      </span>
      <span className="text-[0.9375rem] font-medium">{name}</span>
    </li>
  );
}

function Block({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <Reveal as="section" aria-labelledby={id} className="grid gap-6 border-t border-fog py-12 md:grid-cols-[15rem_1fr] md:gap-12">
      <h2 id={id} className="font-display text-2xl font-semibold md:text-[1.75rem]">
        {title}
      </h2>
      <div>{children}</div>
    </Reveal>
  );
}

export function ProductDetail({ product }: { product: Product }) {
  const category = categoryMap[product.categorySlug];
  const related = getRelatedProducts(product, 4);
  const listing = product.catalogDetail === "listing";
  const aplusSets = getProductAplus(product.slug);

  return (
    <article>
      <div className="studio-bg pb-14 pt-[100px] md:pt-[120px]">
        <div className="container-x">
          <Breadcrumbs
            items={[
              { name: "Products", path: "/products" },
              { name: category.name, path: `/products/${category.slug}` },
              { name: product.name, path: `/products/${product.slug}` },
            ]}
          />
          <SizeProvider options={product.sizeOptions}>
          {/* Copy left, viewer right; the viewer takes the wider column so the product reads large. */}
          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-center lg:gap-12">
            <div className="min-w-0 animate-fade lg:order-1">
              <ProductViewer3D
                model={product.model}
                fallback={product.modelFallback}
                images={product.gallery}
                alt={product.imageAlt}
                name={product.name}
                representative={representativeModels.has(product.slug)}
                priority
              />
            </div>
            <div className="animate-rise">
              <p className="eyebrow text-[0.75rem]">
                <Link href={`/products/${category.slug}`} className="link-underline hover:text-graphite">
                  {category.name}
                </Link>
                <span aria-hidden> · </span>
                {product.series}
              </p>
              <h1 className="mt-4 font-display text-[clamp(2.35rem,4.4vw,3.75rem)] font-semibold leading-[1.03]">
                {product.name}
              </h1>
              <p className="mt-6 text-[1.0625rem] leading-relaxed text-steel md:text-[1.1875rem]">{product.shortDescription}</p>
              {product.highlights.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-2" aria-label="Highlights">
                  {product.highlights.map((h) => (
                    <li key={h} className="bg-white px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-graphite ring-1 ring-line">
                      {h}
                    </li>
                  ))}
                </ul>
              )}
              <SizePicker className="mt-8" />
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <SizeEnquiryButton slug={product.slug}>Request Enquiry</SizeEnquiryButton>
                <a href="#specifications" className="group inline-flex items-center gap-2 text-sm font-semibold">
                  <span className="link-underline">View specifications</span>
                  <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>
          </SizeProvider>
        </div>
      </div>

      <div className="container-x pb-8 pt-4">
        <Block id="description" title="Description">
          <p className="max-w-3xl text-[1.0625rem] leading-relaxed text-graphite md:text-[1.1875rem]">{product.description}</p>
          {listing && (
            <p className="mt-5 flex max-w-2xl items-start gap-3 text-[0.9375rem] leading-relaxed text-steel md:text-base">
              <Info aria-hidden className="mt-1 size-4 shrink-0 text-accent" />
              Detailed specifications for this model are not published in the catalog. Request an enquiry and the
              Plusmark team will share current details.
            </p>
          )}
        </Block>
      </div>

      {/* A+ banners break out of the container so they run full width, like Amazon */}
      {aplusSets.length > 0 && <AplusDescription sets={aplusSets} productName={product.name} />}

      <div className="container-x pb-8">
        {product.features.length > 0 && (
          <Block id="features" title="Key Features">
            <ul className="grid gap-3 sm:grid-cols-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-3.5 bg-mist px-5 py-4 text-base leading-relaxed md:text-[1.125rem]">
                  <Check aria-hidden className="mt-1 size-5 shrink-0 text-verdant" />
                  {f}
                </li>
              ))}
            </ul>
          </Block>
        )}

        {product.specifications.length > 0 && (
          <Block id="specifications" title="Specifications">
            <dl className="divide-y divide-fog border-y border-fog">
              {product.specifications.map((s) => (
                <div key={s.label + s.value} className="grid gap-1.5 py-5 sm:grid-cols-[14rem_1fr] sm:gap-6">
                  <dt className="font-mono text-[0.8rem] uppercase tracking-[0.14em] text-steel sm:pt-1">{s.label}</dt>
                  <dd className="text-base leading-relaxed text-graphite md:text-[1.125rem]">{s.value}</dd>
                </div>
              ))}
            </dl>
          </Block>
        )}

        {product.variants.length > 0 && (
          <Block id="variants" title="Variants">
            <ul className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <li key={v} className="bg-white px-4 py-2.5 text-[0.9375rem] font-medium ring-1 ring-line">
                  {v}
                </li>
              ))}
            </ul>
          </Block>
        )}

        {product.sizes.length > 0 && (
          <Block id="sizes" title="Available Sizes">
            <ul className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <li key={s} className="bg-graphite px-4 py-2.5 font-mono text-[0.8125rem] text-white">
                  {s}
                </li>
              ))}
            </ul>
          </Block>
        )}

        {product.colors.length > 0 && (
          <Block id="colors" title="Available Colors">
            <ul className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <Swatch key={c} name={c} />
              ))}
            </ul>
            <p className="mt-3 text-sm text-steel">Swatches are indicative; confirm the exact shade at enquiry.</p>
          </Block>
        )}

        {product.applications.length > 0 && (
          <Block id="applications" title="Applications">
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {product.applications.map((a) => (
                <li key={a} className="flex items-center gap-2.5 text-base font-medium md:text-[1.0625rem]">
                  <span aria-hidden className="size-1.5 bg-accent" />
                  {a}
                </li>
              ))}
            </ul>
          </Block>
        )}

        {product.notes.length > 0 && (
          <Block id="guidance" title="Selection Guidance">
            {product.notes.map((n) => (
              <p key={n} className="max-w-3xl border-l-2 border-accent bg-accent-soft/50 px-5 py-4 text-base leading-relaxed md:text-[1.0625rem]">
                {n}
              </p>
            ))}
          </Block>
        )}

        <Block id="warranty" title="Warranty">
          <p className="flex max-w-3xl items-start gap-3.5 text-base leading-relaxed text-steel md:text-[1.125rem]">
            <ShieldCheck aria-hidden className="mt-1 size-5 shrink-0 text-verdant" />
            {company.warranty}
          </p>
        </Block>
      </div>

      {related.length > 0 && (
        <section className="border-t border-fog bg-mist py-16 md:py-20" aria-labelledby="related-title">
          <div className="container-x">
            <div className="mb-8 flex items-end justify-between gap-6">
              <h2 id="related-title" className="font-display text-2xl font-semibold md:text-3xl">
                Related Products
              </h2>
              <Link href={`/products/${category.slug}`} className="group hidden items-center gap-2 text-sm font-semibold sm:inline-flex">
                <span className="link-underline">All {category.name}</span>
                <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <li key={p.slug}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <EnquiryBand title={`Request an enquiry for the ${product.name}`} product={product.slug} productName={product.name} />
      <JsonLd data={productSchema(product)} />
    </article>
  );
}
