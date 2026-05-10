import { FeaturedPicker } from "@/components/featured-picker";
import { getFeatured, getProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function FeaturedPage() {
  const [allProducts, featured] = await Promise.all([getProducts(), getFeatured()]);
  const products = allProducts.filter((p) => !p.archived);
  const { orbitSlugs } = featured;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Featured bags · Home orbit</h1>
        <p className="text-sm text-muted">
          Pick the 5 bags that appear in the click-to-swap animation on the storefront home page.
          The first one starts in the centre.
        </p>
      </header>
      <FeaturedPicker products={products} initialOrbit={orbitSlugs} />
    </div>
  );
}
