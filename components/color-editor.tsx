"use client";

import { ImageUploader } from "./image-uploader";
import { slugify } from "@/lib/utils";
import type { ProductColor } from "@/lib/types";

/**
 * Edit the color array of a product — name, hex, photo (per-color), inventory.
 * Stays "controlled" — the parent owns the array.
 */
export function ColorEditor({
  productSlug,
  productPrice,
  productMrp,
  colors,
  onChange,
}: {
  productSlug: string;
  productPrice: number;
  productMrp?: number;
  colors: ProductColor[];
  onChange: (next: ProductColor[]) => void;
}) {
  function update(idx: number, patch: Partial<ProductColor>) {
    onChange(colors.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }
  function remove(idx: number) {
    onChange(colors.filter((_, i) => i !== idx));
  }
  function add() {
    const newColor: ProductColor = {
      id: `color-${colors.length + 1}`,
      name: "New colour",
      hex: "#f6a3b8",
      inStock: true,
      stockCount: 0,
      lowStockAt: 2,
    };
    onChange([...colors, newColor]);
  }

  return (
    <div className="flex flex-col gap-4">
      {colors.map((c, i) => {
        const lowStock = c.stockCount > 0 && c.stockCount <= c.lowStockAt;
        const oos = c.stockCount === 0;
        return (
          <div key={i} className="grid gap-4 rounded-2xl bg-page p-4 ring-1 ring-black/5 md:grid-cols-[120px_1fr]">
            <ImageUploader
              kind="product-image"
              prefix={`${productSlug || "product"}-${slugify(c.name) || c.id}`}
              shape="portrait"
              value={c.image}
              onChange={(url) => update(i, { image: url })}
            />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="label">Name</label>
                <input
                  className="input"
                  value={c.name}
                  onChange={(e) => update(i, { name: e.target.value, id: slugify(e.target.value) || c.id })}
                />
              </div>
              <div>
                <label className="label">Hex</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-[42px] w-12 cursor-pointer rounded-xl border border-black/10 bg-white"
                    value={c.hex}
                    onChange={(e) => update(i, { hex: e.target.value })}
                  />
                  <input
                    className="input"
                    value={c.hex}
                    onChange={(e) => update(i, { hex: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label">In stock</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={c.stockCount}
                  onChange={(e) => {
                    const n = Math.max(0, Number(e.target.value) || 0);
                    update(i, { stockCount: n, inStock: n > 0 });
                  }}
                />
              </div>
              <div>
                <label className="label">Low-stock alert at</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={c.lowStockAt}
                  onChange={(e) => update(i, { lowStockAt: Math.max(0, Number(e.target.value) || 0) })}
                />
              </div>

              <div>
                <label className="label">Price override (₹)</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={c.price ?? ""}
                  placeholder={`Default ₹${productPrice.toLocaleString("en-IN")}`}
                  onChange={(e) => {
                    const v = e.target.value;
                    update(i, { price: v === "" ? undefined : Math.max(0, Number(v)) });
                  }}
                />
              </div>
              <div>
                <label className="label">MRP override (₹)</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={c.mrp ?? ""}
                  placeholder={productMrp ? `Default ₹${productMrp.toLocaleString("en-IN")}` : "Leave blank if no discount"}
                  onChange={(e) => {
                    const v = e.target.value;
                    update(i, { mrp: v === "" ? undefined : Math.max(0, Number(v)) });
                  }}
                />
              </div>
              {/* Two empty cells so the layout stays tidy on lg (4-col grid). */}
              <div className="hidden lg:block" />
              <div className="hidden lg:block" />

              <div className="md:col-span-2 lg:col-span-4">
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    {oos && <span className="rounded-full bg-red-50 px-2 py-0.5 font-bold text-red-700 ring-1 ring-red-200">Out of stock</span>}
                    {lowStock && <span className="rounded-full bg-amber-50 px-2 py-0.5 font-bold text-amber-700 ring-1 ring-amber-200">Low stock ({c.stockCount} left)</span>}
                    {!oos && !lowStock && <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 ring-1 ring-emerald-200">{c.stockCount} in stock</span>}
                  </div>
                  <button type="button" onClick={() => remove(i)} className="btn-danger text-xs">
                    Remove colour
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <button type="button" onClick={add} className="btn-ghost self-start text-xs">
        + Add another colour
      </button>
    </div>
  );
}
