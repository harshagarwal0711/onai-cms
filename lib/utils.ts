import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function makeId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function formatPrice(rupees: number): string {
  return `₹${rupees.toLocaleString("en-IN")}`;
}

/**
 * Returns a usable <img src> for an asset. Handles three cases:
 * - absolute URL (Supabase Storage, etc.) — used as-is
 * - relative path (legacy storefront-served files like `/images/...`) — falls back
 *   to NEXT_PUBLIC_STOREFRONT_URL if set, otherwise the path itself
 * - undefined — undefined (caller renders a placeholder)
 */
export function assetUrl(p: string | undefined | null): string | undefined {
  if (!p) return undefined;
  if (/^https?:\/\//i.test(p)) return p;
  const base = process.env.NEXT_PUBLIC_STOREFRONT_URL?.replace(/\/$/, "");
  return base ? `${base}${p}` : p;
}
