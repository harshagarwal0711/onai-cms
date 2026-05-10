/* eslint-disable no-console */
/**
 * One-shot migration: reads the legacy `data/*.json` files and inserts them
 * into Supabase using the service-role key.
 *
 * Run:
 *   npm run migrate
 *
 * Idempotent: every insert is an upsert keyed on the primary key.
 */
import "dotenv/config";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import {
  FILE_ARTISANS,
  FILE_FEATURED,
  FILE_LOVE,
  FILE_PRODUCTS,
  FILE_REELS,
  FILE_SETTINGS,
} from "../lib/paths";
import type {
  Artisan,
  Featured,
  LovePost,
  Product,
  Reel,
  Settings,
} from "../lib/types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

function readJson<T>(file: string, fallback: T): T {
  if (!fs.existsSync(file)) return fallback;
  const raw = fs.readFileSync(file, "utf8");
  if (!raw.trim()) return fallback;
  return JSON.parse(raw) as T;
}

async function migrateProducts() {
  const list = readJson<Product[]>(FILE_PRODUCTS, []);
  if (!list.length) return console.log("• products: nothing to migrate");
  const rows = list.map((p) => ({
    slug: p.slug,
    name: p.name,
    price: p.price,
    mrp: p.mrp ?? null,
    story: p.story,
    description: p.description,
    craft: p.craft,
    collection: p.collection,
    colors: p.colors,
    images: p.images,
    artisan_id: p.artisanId ?? null,
    featured: p.featured,
    archived: p.archived,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  }));
  const { error } = await sb.from("products").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
  console.log(`✓ products: ${rows.length} rows`);
}

async function migrateArtisans() {
  const list = readJson<Artisan[]>(FILE_ARTISANS, []);
  if (!list.length) return console.log("• artisans: nothing to migrate");
  const rows = list.map((a) => ({
    id: a.id,
    name: a.name,
    bio: a.bio,
    location: a.location,
    photo: a.photo ?? null,
    craft_years: a.craftYears ?? null,
    created_at: a.createdAt,
  }));
  const { error } = await sb.from("artisans").upsert(rows, { onConflict: "id" });
  if (error) throw error;
  console.log(`✓ artisans: ${rows.length} rows`);
}

async function migrateReels() {
  const list = readJson<Reel[]>(FILE_REELS, []);
  if (!list.length) return console.log("• reels: nothing to migrate");
  const rows = list.map((r) => ({
    id: r.id,
    title: r.title,
    caption: r.caption,
    handle: r.handle,
    hashtag: r.hashtag ?? null,
    product_slug: r.productSlug ?? null,
    bag_color: r.bagColor ?? null,
    scene: r.scene,
    video: r.video ?? null,
    likes: r.likes,
    comments: r.comments,
    bg: r.bg,
    order: r.order,
    archived: r.archived,
    created_at: r.createdAt,
  }));
  const { error } = await sb.from("reels").upsert(rows, { onConflict: "id" });
  if (error) throw error;
  console.log(`✓ reels: ${rows.length} rows`);
}

async function migrateLove() {
  const list = readJson<LovePost[]>(FILE_LOVE, []);
  if (!list.length) return console.log("• love_posts: nothing to migrate");
  const rows = list.map((l) => ({
    id: l.id,
    type: l.type,
    caption: l.caption,
    media: l.media ?? null,
    customer_name: l.customerName ?? null,
    location: l.location ?? null,
    product_slug: l.productSlug ?? null,
    rating: l.rating ?? null,
    featured: l.featured,
    archived: l.archived,
    order: l.order,
    created_at: l.createdAt,
  }));
  const { error } = await sb.from("love_posts").upsert(rows, { onConflict: "id" });
  if (error) throw error;
  console.log(`✓ love_posts: ${rows.length} rows`);
}

async function migrateFeatured() {
  const f = readJson<Featured | null>(FILE_FEATURED, null);
  if (!f) return console.log("• featured: nothing to migrate");
  const { error } = await sb
    .from("featured")
    .upsert({ key: "default", orbit_slugs: f.orbitSlugs }, { onConflict: "key" });
  if (error) throw error;
  console.log(`✓ featured: orbit set (${f.orbitSlugs.length} slugs)`);
}

async function migrateSettings() {
  const s = readJson<Settings | null>(FILE_SETTINGS, null);
  if (!s) return console.log("• settings: nothing to migrate");
  const { error } = await sb.from("settings").upsert(
    {
      key: "default",
      whatsapp_number: s.whatsappNumber,
      support_email: s.supportEmail,
      instagram_handle: s.instagramHandle,
      shipping_fee: s.shippingFee,
      free_shipping_above: s.freeShippingAbove,
      order_id_prefix: s.orderIdPrefix,
    },
    { onConflict: "key" },
  );
  if (error) throw error;
  console.log(`✓ settings: 1 row`);
}

async function main() {
  console.log("→ Migrating data/*.json into Supabase…");
  await migrateProducts();
  await migrateArtisans();
  await migrateReels();
  await migrateLove();
  await migrateFeatured();
  await migrateSettings();
  console.log("\nDone. Verify in the Supabase dashboard → Table Editor.");
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
