"use client";

import { useRef, useState } from "react";
import { assetUrl, cn } from "@/lib/utils";

/**
 * Compact upload widget. Shows a thumb of the current file (if any) and a
 * "Replace" button. Uploaded URL (Supabase Storage public URL) is reported
 * via `onChange`.
 */
export function ImageUploader({
  value,
  onChange,
  kind = "product-image",
  prefix = "asset",
  shape = "square",
  className,
}: {
  value?: string;
  onChange: (url: string) => void;
  kind?: "product-image" | "artisan-photo" | "love-photo" | "video";
  prefix?: string;
  shape?: "square" | "portrait" | "video";
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = kind === "video" ? "video/*" : "image/*";
  const ratio = shape === "portrait" ? "aspect-[4/5]" : shape === "video" ? "aspect-[9/16]" : "aspect-square";

  async function handle(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/upload?kind=${kind}&prefix=${encodeURIComponent(prefix)}`, {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      onChange(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const previewSrc = assetUrl(value);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl bg-black/[0.03] ring-1 ring-black/5",
          ratio,
        )}
      >
        {previewSrc && kind !== "video" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewSrc} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        {previewSrc && kind === "video" && (
          <video src={previewSrc} muted loop autoPlay playsInline className="absolute inset-0 h-full w-full object-cover" />
        )}
        {!previewSrc && (
          <div className="grid h-full w-full place-items-center text-xs text-muted">
            {kind === "video" ? "No video yet" : "No photo yet"}
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-white/70 text-xs font-semibold">
            Uploading…
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="btn-ghost text-xs"
          disabled={busy}
        >
          {value ? "Replace" : "Upload"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="btn-danger text-xs"
            disabled={busy}
          >
            Remove
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
