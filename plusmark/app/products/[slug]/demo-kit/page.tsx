import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { categoryMap } from "@/data/categories";
import { getProduct, products } from "@/data/products";
import { contactChannels, whatsappHref } from "@/data/company";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DemoKitCheckout } from "@/components/demo-kit/DemoKitCheckout";
import { DEMO_KIT_AMOUNT_INR } from "@/lib/demo-kit";
import { razorpayConfig } from "@/lib/razorpay";
import { buildMetadata } from "@/lib/seo";

/** "Get a Demo Kit" from a product page's enquiry section: a ₹600 refundable deposit paid with Razorpay. */
export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]/demo-kit">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return buildMetadata({
    title: `Get a demo kit — ${product.name}`,
    description: `Order a demo kit of the ${product.name} with a refundable ₹${DEMO_KIT_AMOUNT_INR} deposit, paid securely online.`,
    path: `/products/${product.slug}/demo-kit`,
    // A checkout step, not a landing page.
    noIndex: true,
  });
}

export default async function DemoKitPage({ params }: PageProps<"/products/[slug]/demo-kit">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const category = categoryMap[product.categorySlug];
  const points = [
    `The ₹${DEMO_KIT_AMOUNT_INR} is refunded once your order is confirmed.`,
    "Paid securely online through Razorpay.",
    "The Plusmark team contacts you to arrange the demo kit.",
  ];

  return (
    <div className="studio-bg pb-20 pt-[100px] md:pb-28 md:pt-[120px]">
      <div className="container-x">
        <Breadcrumbs
          items={[
            { name: "Products", path: "/products" },
            { name: category.name, path: `/products/${category.slug}` },
            { name: product.name, path: `/products/${product.slug}` },
            { name: "Demo kit", path: `/products/${product.slug}/demo-kit` },
          ]}
        />

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
          <div>
            <p className="eyebrow text-[0.75rem]">Demo kit · {category.name}</p>
            <h1 className="mt-4 font-display text-[clamp(2.1rem,4vw,3.25rem)] font-semibold leading-[1.05]">Get a demo kit</h1>
            <p className="mt-5 max-w-lg text-[1.0625rem] leading-relaxed text-steel md:text-[1.125rem]">
              See the {product.name} for yourself before you order. Pay a refundable deposit online and the Plusmark
              team will arrange your demo kit.
            </p>

            <div className="mt-8 flex items-center gap-5 rounded-[var(--card-radius,0px)] bg-white p-4 ring-1 ring-fog">
              <div className="relative size-24 shrink-0 bg-white">
                <Image src={product.image} alt={product.imageAlt} fill sizes="96px" className="object-contain" />
              </div>
              <div className="min-w-0">
                <p className="eyebrow">{product.series}</p>
                <p className="mt-1 font-display text-lg font-semibold leading-snug">{product.name}</p>
                <Link href={`/products/${product.slug}`} className="link-underline mt-2 inline-block text-sm font-semibold">
                  View product
                </Link>
              </div>
            </div>

            <div className="mt-5 rounded-[var(--card-radius,0px)] bg-white p-6 ring-1 ring-fog">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-display text-4xl font-semibold">₹{DEMO_KIT_AMOUNT_INR}</p>
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-verdant">Refundable deposit</p>
              </div>
              <ul className="mt-5 space-y-3">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-[0.9375rem] leading-relaxed text-graphite md:text-base">
                    <Check aria-hidden className="mt-1 size-4 shrink-0 text-verdant" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <DemoKitCheckout
            product={product.slug}
            productName={product.name}
            enabled={razorpayConfig() !== null}
            phoneLabel={contactChannels.phoneLabel}
            phoneHref={`tel:${contactChannels.phone}`}
            whatsappHref={whatsappHref(`Hello Plusmark, I would like a demo kit for the ${product.name}.`)}
          />
        </div>
      </div>
    </div>
  );
}
