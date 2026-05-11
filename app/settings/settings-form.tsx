"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Settings } from "@/lib/types";

export function SettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Settings>(initial);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  function patch(p: Partial<Settings>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error("Save failed");
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="card flex flex-col gap-4"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">WhatsApp number (no +, with country code)</label>
          <input
            className="input"
            value={draft.whatsappNumber}
            onChange={(e) => patch({ whatsappNumber: e.target.value.replace(/\D/g, "") })}
            placeholder="919564732995"
          />
          <p className="mt-1 text-[11px] text-muted">e.g. 91 + 10 digits → 919564732995</p>
        </div>
        <div>
          <label className="label">Support email</label>
          <input
            type="email"
            className="input"
            value={draft.supportEmail}
            onChange={(e) => patch({ supportEmail: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Instagram handle (no @)</label>
          <input
            className="input"
            value={draft.instagramHandle}
            onChange={(e) => patch({ instagramHandle: e.target.value.replace(/^@/, "") })}
          />
        </div>
        <div>
          <label className="label">Order ID prefix</label>
          <input
            className="input"
            value={draft.orderIdPrefix}
            onChange={(e) => patch({ orderIdPrefix: e.target.value.toUpperCase() })}
          />
          <p className="mt-1 text-[11px] text-muted">Order IDs become {draft.orderIdPrefix}-YYYYMMDD-XXXX.</p>
        </div>
        <div>
          <label className="label">Shipping fee (₹)</label>
          <input
            type="number"
            min={0}
            className="input"
            value={draft.shippingFee}
            onChange={(e) => patch({ shippingFee: Math.max(0, Number(e.target.value) || 0) })}
          />
        </div>
        <div>
          <label className="label">Free shipping above (₹)</label>
          <input
            type="number"
            min={0}
            className="input"
            value={draft.freeShippingAbove}
            onChange={(e) => patch({ freeShippingAbove: Math.max(0, Number(e.target.value) || 0) })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="label">Newsletter — Google Form pre-filled URL</label>
          <input
            type="url"
            className="input"
            value={draft.newsletterFormUrl ?? ""}
            placeholder="https://docs.google.com/forms/d/e/.../viewform?usp=pp_url&entry.123=__EMAIL__"
            onChange={(e) => patch({ newsletterFormUrl: e.target.value })}
          />
          <p className="mt-1 text-[11px] text-muted">
            Paste the Google Form pre-filled link with <code>__EMAIL__</code> as the email
            placeholder. Storefront submits there silently and the address lands in the
            linked Google Sheet. Leave blank to disable submission.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-black/5 pt-4">
        {savedFlash && <span className="text-xs font-semibold text-emerald-600">Saved ✓</span>}
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
