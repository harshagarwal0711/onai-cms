import Link from "next/link";
import { getProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function InventoryPage() {
  const products = getProducts();

  // Flatten all colorways into a single inventory list, sorted by lowest stock.
  const rows = products
    .flatMap((p) =>
      p.colors.map((c) => ({
        slug: p.slug,
        productName: p.name,
        colorName: c.name,
        hex: c.hex,
        stockCount: c.stockCount,
        lowStockAt: c.lowStockAt,
        archived: p.archived,
      })),
    )
    .sort((a, b) => a.stockCount - b.stockCount);

  const lowStock = rows.filter((r) => r.stockCount > 0 && r.stockCount <= r.lowStockAt);
  const oos = rows.filter((r) => r.stockCount === 0);
  const inStockUnits = rows.reduce((n, r) => n + r.stockCount, 0);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <p className="text-sm text-muted">Read-only summary across all colourways. Edit counts on the product page.</p>
      </header>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Stat title="Total units in stock" value={inStockUnits} />
        <Stat title="Low-stock SKUs" value={lowStock.length} accent="amber" />
        <Stat title="Out of stock" value={oos.length} accent="red" />
      </div>

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 bg-page text-left text-[11px] uppercase tracking-widest text-muted">
              <th className="px-4 py-3">Product · Colour</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3 text-right">Low at</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const status =
                r.stockCount === 0 ? "oos" :
                r.stockCount <= r.lowStockAt ? "low" : "ok";
              return (
                <tr key={r.slug + r.colorName} className="border-b border-black/[0.04] last:border-none hover:bg-page">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-5 w-5 shrink-0 rounded-full ring-1 ring-black/10" style={{ background: r.hex }} />
                      <div>
                        <p className="font-semibold">{r.productName}</p>
                        <p className="text-[11px] text-muted">{r.colorName}</p>
                      </div>
                      {r.archived && <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-bold text-muted">Archived</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">{r.stockCount}</td>
                  <td className="px-4 py-3 text-right text-xs text-muted">{r.lowStockAt}</td>
                  <td className="px-4 py-3">
                    {status === "oos" && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 ring-1 ring-red-200">Out of stock</span>}
                    {status === "low" && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200">Low stock</span>}
                    {status === "ok"  && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">In stock</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/products/${r.slug}`} className="text-xs font-semibold text-brand hover:underline">
                      Edit →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ title, value, accent }: { title: string; value: number; accent?: "amber" | "red" }) {
  const tone =
    accent === "amber" ? "text-amber-700 bg-amber-50 ring-amber-200" :
    accent === "red"   ? "text-red-700 bg-red-50 ring-red-200" :
                         "text-ink bg-white ring-black/5";
  return (
    <div className={`rounded-2xl px-5 py-4 ring-1 ${tone}`}>
      <p className="text-[11px] font-semibold uppercase tracking-widest opacity-80">{title}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}
