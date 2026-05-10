import Link from "next/link";
import { ProductForm } from "@/components/product-form";
import { getArtisans } from "@/lib/db";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const artisans = await getArtisans();

  const blank: Product = {
    slug: "",
    name: "",
    price: 0,
    story: "",
    description: "",
    craft: "",
    collection: "summer",
    colors: [],
    images: [],
    featured: false,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div>
      <nav className="mb-2 text-xs text-muted">
        <Link href="/products" className="hover:text-brand">Products</Link> · <span>New</span>
      </nav>
      <h1 className="mb-8 text-2xl font-bold">New product</h1>
      <ProductForm initial={blank} artisans={artisans} mode="create" />
    </div>
  );
}
