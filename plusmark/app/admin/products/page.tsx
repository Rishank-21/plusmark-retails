import { requireAdmin } from "@/lib/admin-auth";
import { getProducts } from "./actions";
import { ProductsManager } from "./ProductsManager";
import { PageTitle } from "../PageTitle";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <PageTitle title="Products" text="Add products, upload photos and keep sizes and specifications up to date." />
      <ProductsManager initialProducts={products} />
    </div>
  );
}
