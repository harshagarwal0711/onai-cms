import "server-only";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import {
  FILE_ARTISANS,
  FILE_AUDIT,
  FILE_FEATURED,
  FILE_LOVE,
  FILE_PRODUCTS,
  FILE_REELS,
  FILE_SETTINGS,
} from "./paths";
import type {
  Artisan,
  AuditEntry,
  Featured,
  LovePost,
  Product,
  Reel,
  Settings,
} from "./types";

/**
 * Tiny JSON-file "database". Single user (you), single machine.
 * Reads are cached in-process; writes go through atomic temp-file rename.
 *
 * Production swap-out: replace these with calls to Supabase / Postgres.
 */

function readJson<T>(file: string, fallback: T): T {
  try {
    if (!fs.existsSync(file)) return fallback;
    const raw = fs.readFileSync(file, "utf8");
    if (!raw.trim()) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`[db] failed to read ${file}:`, e);
    return fallback;
  }
}

async function writeJson<T>(file: string, value: T): Promise<void> {
  await fsp.mkdir(path.dirname(file), { recursive: true });
  const tmp = file + ".tmp";
  await fsp.writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await fsp.rename(tmp, file);
}

/* ---------- Products ---------- */

export function getProducts(): Product[] {
  return readJson<Product[]>(FILE_PRODUCTS, []);
}
export function getProduct(slug: string): Product | undefined {
  return getProducts().find((p) => p.slug === slug);
}
export async function setProducts(list: Product[]): Promise<void> {
  await writeJson(FILE_PRODUCTS, list);
}
export async function upsertProduct(p: Product): Promise<void> {
  const list = getProducts();
  const idx = list.findIndex((x) => x.slug === p.slug);
  if (idx === -1) list.push(p);
  else list[idx] = p;
  await setProducts(list);
}
export async function deleteProduct(slug: string): Promise<void> {
  await setProducts(getProducts().filter((p) => p.slug !== slug));
}

/* ---------- Artisans ---------- */

export function getArtisans(): Artisan[] {
  return readJson<Artisan[]>(FILE_ARTISANS, []);
}
export function getArtisan(id: string): Artisan | undefined {
  return getArtisans().find((a) => a.id === id);
}
export async function setArtisans(list: Artisan[]): Promise<void> {
  await writeJson(FILE_ARTISANS, list);
}
export async function upsertArtisan(a: Artisan): Promise<void> {
  const list = getArtisans();
  const idx = list.findIndex((x) => x.id === a.id);
  if (idx === -1) list.push(a);
  else list[idx] = a;
  await setArtisans(list);
}
export async function deleteArtisan(id: string): Promise<void> {
  await setArtisans(getArtisans().filter((a) => a.id !== id));
}

/* ---------- Reels ---------- */

export function getReels(): Reel[] {
  return readJson<Reel[]>(FILE_REELS, []).sort((a, b) => a.order - b.order);
}
export function getReel(id: string): Reel | undefined {
  return getReels().find((r) => r.id === id);
}
export async function setReels(list: Reel[]): Promise<void> {
  await writeJson(FILE_REELS, list);
}
export async function upsertReel(r: Reel): Promise<void> {
  const list = getReels();
  const idx = list.findIndex((x) => x.id === r.id);
  if (idx === -1) list.push(r);
  else list[idx] = r;
  await setReels(list);
}
export async function deleteReel(id: string): Promise<void> {
  await setReels(getReels().filter((r) => r.id !== id));
}

/* ---------- Love posts ---------- */

export function getLovePosts(): LovePost[] {
  return readJson<LovePost[]>(FILE_LOVE, []).sort((a, b) => a.order - b.order);
}
export function getLovePost(id: string): LovePost | undefined {
  return getLovePosts().find((l) => l.id === id);
}
export async function setLovePosts(list: LovePost[]): Promise<void> {
  await writeJson(FILE_LOVE, list);
}
export async function upsertLovePost(l: LovePost): Promise<void> {
  const list = getLovePosts();
  const idx = list.findIndex((x) => x.id === l.id);
  if (idx === -1) list.push(l);
  else list[idx] = l;
  await setLovePosts(list);
}
export async function deleteLovePost(id: string): Promise<void> {
  await setLovePosts(getLovePosts().filter((l) => l.id !== id));
}

/* ---------- Featured (orbit) ---------- */

const DEFAULT_FEATURED: Featured = { orbitSlugs: [] };

export function getFeatured(): Featured {
  return readJson<Featured>(FILE_FEATURED, DEFAULT_FEATURED);
}
export async function setFeatured(f: Featured): Promise<void> {
  await writeJson(FILE_FEATURED, f);
}

/* ---------- Settings ---------- */

const DEFAULT_SETTINGS: Settings = {
  whatsappNumber: "919564732995",
  supportEmail: "hello@onai.in",
  instagramHandle: "onai.craft",
  shippingFee: 150,
  freeShippingAbove: 8000,
  orderIdPrefix: "ONAI",
};

export function getSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...readJson<Partial<Settings>>(FILE_SETTINGS, {}) };
}
export async function setSettings(s: Settings): Promise<void> {
  await writeJson(FILE_SETTINGS, s);
}

/* ---------- Audit log ---------- */

export function getAudit(): AuditEntry[] {
  return readJson<AuditEntry[]>(FILE_AUDIT, []).slice(0, 100);
}
export async function logAudit(entry: Omit<AuditEntry, "ts">): Promise<void> {
  const log = getAudit();
  log.unshift({ ts: new Date().toISOString(), ...entry });
  await writeJson(FILE_AUDIT, log.slice(0, 100));
}
