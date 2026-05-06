import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/product-form";
import { getArtisans, getProduct } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const artisans = getArtisans();

  return (
    <div>
      <nav className="mb-2 text-xs text-muted">
        <Link href="/products" className="hover:text-brand">Products</Link> · <span>{product.name}</span>
      </nav>
      <h1 className="mb-1 text-2xl font-bold">{product.name}</h1>
      <p className="mb-8 text-sm text-muted">Updated {new Date(product.updatedAt).toLocaleString("en-IN")}</p>
      <ProductForm initial={product} artisans={artisans} mode="edit" />
    </div>
  );
}
