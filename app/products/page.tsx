import Link from "next/link";
import { getArtisans, getProducts } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, artisans] = await Promise.all([getProducts(), getArtisans()]);

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted">
            {products.length} SKUs · {products.filter((p) => p.featured).length} featured ·{" "}
            {products.filter((p) => p.archived).length} archived
          </p>
        </div>
        <Link href="/products/new" className="btn-primary">+ New product</Link>
      </header>

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 bg-page text-left text-[11px] uppercase tracking-widest text-muted">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Collection</th>
              <th className="px-4 py-3">Colours</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Artisan</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const totalStock = p.colors.reduce((n, c) => n + c.stockCount, 0);
              const lowStock = p.colors.some((c) => c.stockCount > 0 && c.stockCount <= c.lowStockAt);
              const oosColors = p.colors.filter((c) => c.stockCount === 0).length;
              const artisan = artisans.find((a) => a.id === p.artisanId);
              return (
                <tr key={p.slug} className="border-b border-black/[0.04] last:border-none hover:bg-page">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-8 w-8 shrink-0 rounded-full ring-1 ring-black/10"
                        style={{ background: p.colors[0]?.hex ?? "#f6a3b8" }}
                      />
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-[11px] text-muted">{p.slug}</p>
                      </div>
                      {p.featured && <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">Featured</span>}
                      {p.archived && <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-bold text-muted">Archived</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs uppercase tracking-widest text-muted">{p.collection}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {p.colors.map((c) => (
                        <span
                          key={c.id}
                          title={`${c.name} · ${c.stockCount}`}
                          className="h-4 w-4 rounded-full ring-1 ring-black/10"
                          style={{ background: c.hex }}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold">{totalStock}</span>
                      {lowStock && <span className="rounded-full bg-amber-50 px-2 py-0.5 font-bold text-amber-700 ring-1 ring-amber-200">Low</span>}
                      {oosColors > 0 && <span className="rounded-full bg-red-50 px-2 py-0.5 font-bold text-red-700 ring-1 ring-red-200">{oosColors} OOS</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {artisan ? (
                      <span>{artisan.name}<span className="text-muted"> · {artisan.location}</span></span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/products/${p.slug}`} className="text-xs font-semibold text-brand hover:underline">
                      Edit →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted">
                  No products yet. <Link href="/products/new" className="font-semibold text-brand">Create one →</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
