"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

/**
 * Pick exactly 5 products to appear in the home page orbit animation.
 * Click a card to add/remove it from the chosen set, then click again
 * inside the chosen set to reorder.
 */
export function FeaturedPicker({
  products,
  initialOrbit,
}: {
  products: Product[];
  initialOrbit: string[];
}) {
  const router = useRouter();
  const [orbit, setOrbit] = useState<string[]>(initialOrbit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(slug: string) {
    setOrbit((cur) => {
      if (cur.includes(slug)) return cur.filter((s) => s !== slug);
      if (cur.length >= 5) return cur; // capped
      return [...cur, slug];
    });
  }

  function move(slug: string, dir: -1 | 1) {
    setOrbit((cur) => {
      const i = cur.indexOf(slug);
      if (i === -1) return cur;
      const j = i + dir;
      if (j < 0 || j >= cur.length) return cur;
      const next = cur.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/featured", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orbitSlugs: orbit }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* The chosen 5, in order */}
      <div className="card">
        <h2 className="mb-1 text-base font-bold">On the home page now</h2>
        <p className="mb-4 text-xs text-muted">
          Pick exactly 5. The first one starts in the centre; the others orbit on the wavy line.
          Click ▲ ▼ to re-order.
        </p>
        {orbit.length === 0 && <p className="text-sm text-muted">Nothing selected yet — pick from below.</p>}
        <ol className="grid gap-2">
          {orbit.map((slug, i) => {
            const p = products.find((x) => x.slug === slug);
            if (!p) return null;
            return (
              <li key={slug} className="flex items-center gap-3 rounded-xl bg-page px-3 py-2 ring-1 ring-black/5">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span
                  className="h-6 w-6 shrink-0 rounded-full ring-1 ring-black/10"
                  style={{ background: p.colors[0]?.hex ?? "#f6a3b8" }}
                />
                <span className="flex-1 text-sm font-semibold">{p.name}</span>
                <span className="text-xs text-muted">{p.craft}</span>
                <button
                  type="button"
                  onClick={() => move(slug, -1)}
                  disabled={i === 0}
                  className="rounded-md px-2 py-1 text-xs font-bold hover:bg-black/5 disabled:opacity-30"
                  aria-label="Move up"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => move(slug, 1)}
                  disabled={i === orbit.length - 1}
                  className="rounded-md px-2 py-1 text-xs font-bold hover:bg-black/5 disabled:opacity-30"
                  aria-label="Move down"
                >
                  ▼
                </button>
                <button
                  type="button"
                  onClick={() => toggle(slug)}
                  className="rounded-md px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* All products as a picker grid */}
      <div className="card">
        <h2 className="mb-1 text-base font-bold">All products</h2>
        <p className="mb-4 text-xs text-muted">{orbit.length} / 5 selected. Click to add or remove.</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => {
            const idx = orbit.indexOf(p.slug);
            const selected = idx !== -1;
            return (
              <button
                key={p.slug}
                type="button"
                onClick={() => toggle(p.slug)}
                className={cn(
                  "group relative flex flex-col items-start gap-2 rounded-xl bg-white p-3 ring-1 transition",
                  selected
                    ? "ring-2 ring-brand"
                    : "ring-black/5 hover:ring-brand/40",
                )}
              >
                <div
                  className="aspect-[4/5] w-full rounded-lg"
                  style={{
                    background: `linear-gradient(160deg, ${p.colors[0]?.hex ?? "#f6a3b8"}33, white)`,
                  }}
                />
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-[11px] text-muted">{p.craft}</p>
                {selected && (
                  <span className="absolute right-2 top-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">
                    #{idx + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="sticky bottom-0 -mx-5 flex items-center justify-between border-t border-black/5 bg-white px-5 py-4 md:-mx-10 md:px-10">
        <p className="text-xs text-muted">
          {orbit.length === 5 ? "Ready to publish." : `Need ${5 - orbit.length} more.`}
        </p>
        <button
          type="button"
          onClick={save}
          disabled={saving || orbit.length !== 5}
          className="btn-primary"
        >
          {saving ? "Saving…" : "Save & publish"}
        </button>
      </div>
    </div>
  );
}
