"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ColorEditor } from "./color-editor";
import { ImageUploader } from "./image-uploader";
import { slugify } from "@/lib/utils";
import type { Artisan, Collection, Product } from "@/lib/types";

const COLLECTIONS: Collection[] = ["summer", "wedding", "everyday", "limited"];

export function ProductForm({
  initial,
  artisans,
  mode,
}: {
  initial: Product;
  artisans: Artisan[];
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Product>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch(p: Partial<Product>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  async function save() {
    setError(null);
    setSaving(true);
    try {
      const url = mode === "create" ? "/api/products" : `/api/products/${initial.slug}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      router.push("/products");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete ${draft.name}? This cannot be undone.`)) return;
    setSaving(true);
    try {
      await fetch(`/api/products/${initial.slug}`, { method: "DELETE" });
      router.push("/products");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const totalStock = draft.colors.reduce((n, c) => n + c.stockCount, 0);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="flex flex-col gap-6 pb-24"
    >
      {/* Basic */}
      <div className="card">
        <h2 className="mb-4 text-base font-bold">Basics</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="label">Product name *</label>
            <input
              className="input"
              required
              value={draft.name}
              onChange={(e) => {
                const name = e.target.value;
                patch({
                  name,
                  ...(mode === "create" ? { slug: slugify(name) } : {}),
                });
              }}
            />
          </div>
          <div>
            <label className="label">Slug (URL)</label>
            <input
              className="input"
              value={draft.slug}
              disabled={mode === "edit"}
              onChange={(e) => patch({ slug: slugify(e.target.value) })}
            />
            <p className="mt-1 text-[11px] text-muted">{mode === "edit" ? "Locked once created." : "Used in /products/" + draft.slug}</p>
          </div>
          <div>
            <label className="label">Selling price (₹) *</label>
            <input
              type="number"
              min={0}
              className="input"
              value={draft.price}
              onChange={(e) => patch({ price: Math.max(0, Number(e.target.value) || 0) })}
            />
            <p className="mt-1 text-[11px] text-muted">What the customer pays.</p>
          </div>
          <div>
            <label className="label">MRP (₹) — optional</label>
            <input
              type="number"
              min={0}
              className="input"
              value={draft.mrp ?? ""}
              placeholder="Leave blank if no discount"
              onChange={(e) => {
                const v = e.target.value;
                patch({ mrp: v === "" ? undefined : Math.max(0, Number(v)) });
              }}
            />
            <p className="mt-1 text-[11px] text-muted">
              {draft.mrp && draft.mrp > draft.price
                ? `Customers see ₹${draft.mrp.toLocaleString("en-IN")} struck through · ${Math.round(((draft.mrp - draft.price) / draft.mrp) * 100)}% off`
                : "Original/list price. Set higher than selling price to show a discount."}
            </p>
          </div>
          <div>
            <label className="label">Collection</label>
            <select
              className="input"
              value={draft.collection}
              onChange={(e) => patch({ collection: e.target.value as Collection })}
            >
              {COLLECTIONS.map((c) => (
                <option key={c} value={c}>
                  {c[0].toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Artisan</label>
            <select
              className="input"
              value={draft.artisanId ?? ""}
              onChange={(e) => patch({ artisanId: e.target.value || undefined })}
            >
              <option value="">— None —</option>
              {artisans.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} {a.location && `· ${a.location}`}
                </option>
              ))}
            </select>
            {artisans.length === 0 && (
              <p className="mt-1 text-[11px] text-muted">No artisans yet. <a href="/artisans/new" className="font-semibold text-brand">Add one →</a></p>
            )}
          </div>
        </div>
      </div>

      {/* Copy */}
      <div className="card">
        <h2 className="mb-4 text-base font-bold">Copy</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="label">Story (1 line — shown on cards)</label>
            <input
              className="input"
              value={draft.story}
              onChange={(e) => patch({ story: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Description (long, shown on PDP)</label>
            <textarea
              rows={4}
              className="input"
              value={draft.description}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Craft tag (e.g. &quot;Hand-crocheted in Punjab&quot;)</label>
            <input
              className="input"
              value={draft.craft}
              onChange={(e) => patch({ craft: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Hero photos */}
      <div className="card">
        <h2 className="mb-1 text-base font-bold">Hero photos</h2>
        <p className="mb-4 text-xs text-muted">Optional. Per-colour photos (below) take precedence on the storefront.</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {draft.images.map((img, i) => (
            <ImageUploader
              key={i}
              kind="product-image"
              prefix={`${draft.slug || "product"}-hero-${i + 1}`}
              shape="portrait"
              value={img}
              onChange={(url) => {
                const next = [...draft.images];
                if (url) next[i] = url;
                else next.splice(i, 1);
                patch({ images: next });
              }}
            />
          ))}
          <ImageUploader
            kind="product-image"
            prefix={`${draft.slug || "product"}-hero-${draft.images.length + 1}`}
            shape="portrait"
            value=""
            onChange={(url) => {
              if (url) patch({ images: [...draft.images, url] });
            }}
          />
        </div>
      </div>

      {/* Colours + Inventory */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">Colours &amp; inventory</h2>
            <p className="text-xs text-muted">Per-colour photos appear on the PDP and product cards.</p>
          </div>
          <span className="rounded-full bg-page px-3 py-1 text-xs font-semibold text-ink ring-1 ring-black/5">
            Total stock: {totalStock}
          </span>
        </div>
        <ColorEditor
          productSlug={draft.slug}
          productPrice={draft.price}
          productMrp={draft.mrp}
          colors={draft.colors}
          onChange={(colors) => patch({ colors })}
        />
      </div>

      {/* Visibility */}
      <div className="card">
        <h2 className="mb-4 text-base font-bold">Visibility</h2>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded"
              checked={draft.featured}
              onChange={(e) => patch({ featured: e.target.checked })}
            />
            Featured (Summer Edit + filters)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded"
              checked={draft.archived}
              onChange={(e) => patch({ archived: e.target.checked })}
            />
            Archived (hidden from shop, kept for orders)
          </label>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Save bar */}
      <div className="sticky bottom-0 -mx-5 flex items-center justify-between border-t border-black/5 bg-white px-5 py-4 md:-mx-10 md:px-10">
        <div className="flex gap-2">
          {mode === "edit" && (
            <button type="button" onClick={remove} disabled={saving} className="btn-danger">
              Delete
            </button>
          )}
          {mode === "edit" && draft.slug && (
            <a
              href={`http://localhost:3000/products/${draft.slug}`}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
            >
              Preview on storefront ↗
            </a>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => router.push("/products")} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
