"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageUploader } from "./image-uploader";
import type { LovePost, Product } from "@/lib/types";

const TYPE_OPTS: Array<{ id: LovePost["type"]; label: string; hint: string }> = [
  { id: "photo",      label: "Customer photo",   hint: "Real customer using the bag" },
  { id: "screenshot", label: "Screenshot",       hint: "DM, story, or social proof" },
  { id: "video",      label: "Video",            hint: "Short clip or unboxing" },
  { id: "review",     label: "Review (text)",    hint: "Pull-quote with star rating" },
];

export function LoveForm({
  initial,
  products,
  mode,
}: {
  initial: LovePost;
  products: Product[];
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<LovePost>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch(p: Partial<LovePost>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const url = mode === "create" ? "/api/love" : `/api/love/${initial.id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      router.push("/love");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this customer love post?")) return;
    setSaving(true);
    await fetch(`/api/love/${initial.id}`, { method: "DELETE" });
    router.push("/love");
    router.refresh();
  }

  const isReview = draft.type === "review";
  const isVideo = draft.type === "video";
  const uploadKind = isVideo ? "video" : "love-photo";
  const uploadShape = isVideo ? "video" : "portrait";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="grid gap-6 pb-24 lg:grid-cols-[280px_1fr]"
    >
      {/* Media uploader (hidden for text-only reviews) */}
      <div className="card">
        <h2 className="mb-4 text-base font-bold">{isReview ? "No media" : "Media"}</h2>
        {isReview ? (
          <p className="text-xs text-muted">
            Reviews render as text-only quote cards on the storefront. Skip to the form on the right.
          </p>
        ) : (
          <>
            <ImageUploader
              key={uploadKind /* re-mount when switching photo↔video */}
              kind={uploadKind}
              prefix={`love-${draft.id || draft.customerName || "post"}`}
              shape={uploadShape}
              value={draft.media}
              onChange={(url) => patch({ media: url })}
            />
            <p className="mt-3 text-[11px] text-muted">
              {isVideo
                ? "Vertical 9:16, < 4 MB. Will autoplay muted on the storefront."
                : "Vertical 4:5, < 250 KB. JPG or PNG."}
            </p>
          </>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {/* Type picker */}
        <div className="card">
          <h2 className="mb-4 text-base font-bold">Type</h2>
          <div className="grid grid-cols-2 gap-2">
            {TYPE_OPTS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => patch({ type: opt.id })}
                className={
                  "rounded-xl px-3 py-3 text-left text-sm transition " +
                  (draft.type === opt.id
                    ? "bg-ink text-white ring-2 ring-ink"
                    : "bg-page text-ink ring-1 ring-black/5 hover:ring-brand")
                }
              >
                <p className="font-semibold">{opt.label}</p>
                <p className={`text-[11px] ${draft.type === opt.id ? "text-white/70" : "text-muted"}`}>
                  {opt.hint}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Caption + meta */}
        <div className="card">
          <h2 className="mb-4 text-base font-bold">Caption &amp; details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="label">Caption *</label>
              <textarea
                rows={3}
                className="input"
                required
                value={draft.caption}
                onChange={(e) => patch({ caption: e.target.value })}
                placeholder={isReview
                  ? "“Obsessed with my Jutt Tote — fits everything and gets compliments daily.”"
                  : "“At the Jaipur Lit Fest, can’t leave home without it 💕”"
                }
              />
            </div>
            <div>
              <label className="label">Customer name</label>
              <input
                className="input"
                value={draft.customerName ?? ""}
                onChange={(e) => patch({ customerName: e.target.value || undefined })}
                placeholder="Anika · @anikaknits"
              />
            </div>
            <div>
              <label className="label">Location</label>
              <input
                className="input"
                value={draft.location ?? ""}
                onChange={(e) => patch({ location: e.target.value || undefined })}
                placeholder="Mumbai"
              />
            </div>
            <div>
              <label className="label">Linked product (optional)</label>
              <select
                className="input"
                value={draft.productSlug ?? ""}
                onChange={(e) => patch({ productSlug: e.target.value || undefined })}
              >
                <option value="">— None —</option>
                {products.map((p) => (
                  <option key={p.slug} value={p.slug}>{p.name}</option>
                ))}
              </select>
            </div>
            {isReview && (
              <div>
                <label className="label">Star rating</label>
                <select
                  className="input"
                  value={draft.rating ?? 5}
                  onChange={(e) => patch({ rating: Number(e.target.value) })}
                >
                  <option value={5}>★★★★★ (5)</option>
                  <option value={4}>★★★★☆ (4)</option>
                  <option value={3}>★★★☆☆ (3)</option>
                  <option value={2}>★★☆☆☆ (2)</option>
                  <option value={1}>★☆☆☆☆ (1)</option>
                </select>
              </div>
            )}
            <div>
              <label className="label">Order in feed</label>
              <input
                type="number"
                className="input"
                value={draft.order}
                onChange={(e) => patch({ order: Math.max(0, Number(e.target.value) || 0) })}
              />
            </div>
          </div>
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
              Featured (shows first on the storefront)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded"
                checked={draft.archived}
                onChange={(e) => patch({ archived: e.target.checked })}
              />
              Archived (hidden from storefront)
            </label>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="sticky bottom-0 -mx-5 flex items-center justify-between border-t border-black/5 bg-white px-5 py-4 md:-mx-10 md:px-10">
          {mode === "edit" ? (
            <button type="button" onClick={remove} className="btn-danger" disabled={saving}>
              Delete
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button type="button" onClick={() => router.push("/love")} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving…" : mode === "create" ? "Post love" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
