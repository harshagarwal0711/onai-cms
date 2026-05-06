"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageUploader } from "./image-uploader";
import type { Product, Reel } from "@/lib/types";

const SCENES: Reel["scene"][] = ["bag", "yarn", "stitch"];

export function ReelForm({
  initial,
  products,
  mode,
}: {
  initial: Reel;
  products: Product[];
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Reel>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch(p: Partial<Reel>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const url = mode === "create" ? "/api/reels" : `/api/reels/${initial.id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      router.push("/reels");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete reel "${draft.title}"?`)) return;
    setSaving(true);
    await fetch(`/api/reels/${initial.id}`, { method: "DELETE" });
    router.push("/reels");
    router.refresh();
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="grid gap-6 pb-24 lg:grid-cols-[280px_1fr]"
    >
      {/* Video preview */}
      <div className="card">
        <h2 className="mb-4 text-base font-bold">Video</h2>
        <ImageUploader
          kind="video"
          prefix={`reel-${draft.id || draft.title || "new"}`}
          shape="video"
          value={draft.video}
          onChange={(url) => patch({ video: url })}
        />
        <p className="mt-3 text-[11px] text-muted">
          Vertical 9:16, &lt; 4 MB. No audio (autoplay requires muted).
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Caption block */}
        <div className="card">
          <h2 className="mb-4 text-base font-bold">Caption &amp; meta</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="label">Title (internal)</label>
              <input
                className="input"
                required
                value={draft.title}
                onChange={(e) => patch({ title: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Caption (shown on the reel)</label>
              <input
                className="input"
                value={draft.caption}
                onChange={(e) => patch({ caption: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Handle / sub-text</label>
              <input
                className="input"
                value={draft.handle}
                onChange={(e) => patch({ handle: e.target.value })}
                placeholder="Original audio"
              />
            </div>
            <div>
              <label className="label">Hashtag (optional)</label>
              <input
                className="input"
                value={draft.hashtag ?? ""}
                onChange={(e) => patch({ hashtag: e.target.value })}
                placeholder="#desicraft"
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
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Scene fallback (when no video)</label>
              <select
                className="input"
                value={draft.scene}
                onChange={(e) => patch({ scene: e.target.value as Reel["scene"] })}
              >
                {SCENES.map((s) => (
                  <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Look + numbers */}
        <div className="card">
          <h2 className="mb-4 text-base font-bold">Look &amp; engagement</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Bag colour (used by SVG fallback)</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  className="h-[42px] w-12 cursor-pointer rounded-xl border border-black/10 bg-white"
                  value={draft.bagColor ?? "#f6a3b8"}
                  onChange={(e) => patch({ bagColor: e.target.value })}
                />
                <input
                  className="input"
                  value={draft.bagColor ?? ""}
                  onChange={(e) => patch({ bagColor: e.target.value || undefined })}
                />
              </div>
            </div>
            <div>
              <label className="label">Background gradient (CSS)</label>
              <input
                className="input"
                value={draft.bg}
                onChange={(e) => patch({ bg: e.target.value })}
                placeholder="linear-gradient(160deg, #ffd1dc 0%, #ff6b9d 100%)"
              />
            </div>
            <div>
              <label className="label">Likes (display)</label>
              <input
                className="input"
                value={draft.likes}
                onChange={(e) => patch({ likes: e.target.value })}
                placeholder="12.4k"
              />
            </div>
            <div>
              <label className="label">Comments (display)</label>
              <input
                className="input"
                value={draft.comments}
                onChange={(e) => patch({ comments: e.target.value })}
                placeholder="234"
              />
            </div>
            <div>
              <label className="label">Order in deck</label>
              <input
                type="number"
                className="input"
                value={draft.order}
                onChange={(e) => patch({ order: Math.max(0, Number(e.target.value) || 0) })}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded"
                  checked={draft.archived}
                  onChange={(e) => patch({ archived: e.target.checked })}
                />
                Archived (hide from deck)
              </label>
            </div>
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
            <button type="button" onClick={() => router.push("/reels")} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving…" : mode === "create" ? "Create reel" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
