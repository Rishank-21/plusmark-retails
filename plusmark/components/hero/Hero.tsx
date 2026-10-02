import { featuredProducts } from "@/data/featured";
import { HeroExperience } from "./HeroExperience";
import { HeroProductHead, HeroProductBody } from "./HeroProductInfo";
import { HeroSpecifications } from "./HeroSpecifications";

/**
 * Server component. All product copy for the 3D showcase is rendered to HTML here
 * (indexable, usable without JS); the client HeroExperience only orchestrates
 * visibility, the timed carousel and the WebGL layer.
 */
export function Hero() {
  const products = featuredProducts;
  const initial = (i: number): React.CSSProperties =>
    i === 0 ? { opacity: 1 } : { opacity: 0, visibility: "hidden" };

  return (
    <HeroExperience
      products={products}
      title={
        // Kept for SEO / screen readers only; visually removed from the hero.
        <h1 className="sr-only">
          Plusmark Writing &amp; Display System — white boards, chalk boards, notice boards and institutional
          products, made in India
        </h1>
      }
      heads={products.map((p, i) => (
        <HeroProductHead key={p.slug} product={p} index={i} total={products.length} style={initial(i)} />
      ))}
      bodies={products.map((p, i) => (
        <HeroProductBody key={p.slug} product={p} index={i} style={initial(i)} />
      ))}
      specs={products.map((p, i) => (
        <HeroSpecifications key={p.slug} product={p} index={i} style={initial(i)} />
      ))}
    />
  );
}
