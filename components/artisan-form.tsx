"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageUploader } from "./image-uploader";
import type { Artisan } from "@/lib/types";

export function ArtisanForm({
  initial,
  mode,
}: {
  initial: Artisan;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Artisan>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch(p: Partial<Artisan>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const url = mode === "create" ? "/api/artisans" : `/api/artisans/${initial.id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      router.push("/artisans");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete artisan ${draft.name}? Products linked to them will lose the reference.`)) return;
    setSaving(true);
    await fetch(`/api/artisans/${initial.id}`, { method: "DELETE" });
    router.push("/artisans");
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
      <div className="card">
        <h2 className="mb-4 text-base font-bold">Photo</h2>
        <ImageUploader
          kind="artisan-photo"
          prefix={`artisan-${draft.id || draft.name || "new"}`}
          shape="square"
          value={draft.photo}
          onChange={(url) => patch({ photo: url })}
        />
      </div>

      <div className="flex flex-col gap-6">
        <div className="card">
          <h2 className="mb-4 text-base font-bold">Profile</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="label">Name *</label>
              <input
                className="input"
                required
                value={draft.name}
                onChange={(e) => patch({ name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Location (city, state)</label>
              <input
                className="input"
                value={draft.location}
                onChange={(e) => patch({ location: e.target.value })}
                placeholder="Kutch, Gujarat"
              />
            </div>
            <div>
              <label className="label">Years of craft (optional)</label>
              <input
                type="number"
                min={0}
                className="input"
                value={draft.craftYears ?? ""}
                onChange={(e) => patch({ craftYears: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Bio</label>
              <textarea
                rows={4}
                className="input"
                value={draft.bio}
                onChange={(e) => patch({ bio: e.target.value })}
                placeholder="A few sentences about their craft, family, technique."
              />
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
            <button type="button" onClick={() => router.push("/artisans")} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving…" : mode === "create" ? "Create artisan" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
