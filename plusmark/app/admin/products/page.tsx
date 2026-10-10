import { getProducts } from "./actions";
import { ProductsManager } from "./ProductsManager";

export const metadata = {
  title: "Manage Products — Plusmark Admin",
};

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-5">
        <h1 className="font-display text-2xl font-bold tracking-tight text-graphite sm:text-3xl">
          Product Catalog
        </h1>
        <p className="mt-1 text-sm text-steel">
          Add, modify, and manage product specifications, pricing, gallery photos, and A+ content.
        </p>
      </div>

      <ProductsManager initialProducts={products} />
    </div>
  );
}
