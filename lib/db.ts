import "server-only";
import { getSupabaseServer } from "./supabase/server";
import type {
  Artisan,
  AuditEntry,
  Collection,
  Featured,
  LovePost,
  Product,
  Reel,
  Settings,
} from "./types";

/**
 * Supabase-backed data layer. Every function is async — Server Components
 * and Route Handlers `await` them.
 *
 * RLS lets anon read the public tables, so storefront fetches still work.
 * All writes require a Supabase session (enforced by middleware + RLS).
 */

/* ---------- Row <-> domain mapping ---------- */

type ProductRow = {
  slug: string;
  name: string;
  price: number;
  mrp: number | null;
  story: string;
  description: string;
  craft: string;
  collection: string;
  colors: Product["colors"];
  images: string[];
  artisan_id: string | null;
  featured: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

function rowToProduct(r: ProductRow): Product {
  return {
    slug: r.slug,
    name: r.name,
    price: r.price,
    mrp: r.mrp ?? undefined,
    story: r.story,
    description: r.description,
    craft: r.craft,
    collection: r.collection as Collection,
    colors: r.colors ?? [],
    images: r.images ?? [],
    artisanId: r.artisan_id ?? undefined,
    featured: r.featured,
    archived: r.archived,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function productToRow(p: Product): ProductRow {
  return {
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
  };
}

type ArtisanRow = {
  id: string;
  name: string;
  bio: string;
  location: string;
  photo: string | null;
  craft_years: number | null;
  created_at: string;
};

function rowToArtisan(r: ArtisanRow): Artisan {
  return {
    id: r.id,
    name: r.name,
    bio: r.bio,
    location: r.location,
    photo: r.photo ?? undefined,
    craftYears: r.craft_years ?? undefined,
    createdAt: r.created_at,
  };
}

function artisanToRow(a: Artisan): ArtisanRow {
  return {
    id: a.id,
    name: a.name,
    bio: a.bio,
    location: a.location,
    photo: a.photo ?? null,
    craft_years: a.craftYears ?? null,
    created_at: a.createdAt,
  };
}

type ReelRow = {
  id: string;
  title: string;
  caption: string;
  handle: string;
  hashtag: string | null;
  product_slug: string | null;
  bag_color: string | null;
  scene: string;
  video: string | null;
  likes: string;
  comments: string;
  bg: string;
  order: number;
  archived: boolean;
  created_at: string;
};

function rowToReel(r: ReelRow): Reel {
  return {
    id: r.id,
    title: r.title,
    caption: r.caption,
    handle: r.handle,
    hashtag: r.hashtag ?? undefined,
    productSlug: r.product_slug ?? undefined,
    bagColor: r.bag_color ?? undefined,
    scene: r.scene as Reel["scene"],
    video: r.video ?? undefined,
    likes: r.likes,
    comments: r.comments,
    bg: r.bg,
    order: r.order,
    archived: r.archived,
    createdAt: r.created_at,
  };
}

function reelToRow(r: Reel): ReelRow {
  return {
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
  };
}

type LoveRow = {
  id: string;
  type: string;
  caption: string;
  media: string | null;
  customer_name: string | null;
  location: string | null;
  product_slug: string | null;
  rating: number | null;
  featured: boolean;
  archived: boolean;
  order: number;
  created_at: string;
};

function rowToLove(r: LoveRow): LovePost {
  return {
    id: r.id,
    type: r.type as LovePost["type"],
    caption: r.caption,
    media: r.media ?? undefined,
    customerName: r.customer_name ?? undefined,
    location: r.location ?? undefined,
    productSlug: r.product_slug ?? undefined,
    rating: r.rating ?? undefined,
    featured: r.featured,
    archived: r.archived,
    order: r.order,
    createdAt: r.created_at,
  };
}

function loveToRow(l: LovePost): LoveRow {
  return {
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
  };
}

/* ---------- Products ---------- */

export async function getProducts(): Promise<Product[]> {
  const sb = await getSupabaseServer();
  const { data, error } = await sb.from("products").select("*").order("created_at", { ascending: true });
  if (error) {
    console.error("[db] getProducts:", error);
    return [];
  }
  return (data as ProductRow[]).map(rowToProduct);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const sb = await getSupabaseServer();
  const { data, error } = await sb.from("products").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return undefined;
  return rowToProduct(data as ProductRow);
}

export async function upsertProduct(p: Product): Promise<void> {
  const sb = await getSupabaseServer();
  const { error } = await sb.from("products").upsert(productToRow(p), { onConflict: "slug" });
  if (error) throw new Error(`upsertProduct: ${error.message}`);
}

export async function deleteProduct(slug: string): Promise<void> {
  const sb = await getSupabaseServer();
  const { error } = await sb.from("products").delete().eq("slug", slug);
  if (error) throw new Error(`deleteProduct: ${error.message}`);
}

/* ---------- Artisans ---------- */

export async function getArtisans(): Promise<Artisan[]> {
  const sb = await getSupabaseServer();
  const { data, error } = await sb.from("artisans").select("*").order("created_at", { ascending: true });
  if (error) {
    console.error("[db] getArtisans:", error);
    return [];
  }
  return (data as ArtisanRow[]).map(rowToArtisan);
}

export async function getArtisan(id: string): Promise<Artisan | undefined> {
  const sb = await getSupabaseServer();
  const { data, error } = await sb.from("artisans").select("*").eq("id", id).maybeSingle();
  if (error || !data) return undefined;
  return rowToArtisan(data as ArtisanRow);
}

export async function upsertArtisan(a: Artisan): Promise<void> {
  const sb = await getSupabaseServer();
  const { error } = await sb.from("artisans").upsert(artisanToRow(a), { onConflict: "id" });
  if (error) throw new Error(`upsertArtisan: ${error.message}`);
}

export async function deleteArtisan(id: string): Promise<void> {
  const sb = await getSupabaseServer();
  const { error } = await sb.from("artisans").delete().eq("id", id);
  if (error) throw new Error(`deleteArtisan: ${error.message}`);
}

/* ---------- Reels ---------- */

export async function getReels(): Promise<Reel[]> {
  const sb = await getSupabaseServer();
  const { data, error } = await sb.from("reels").select("*").order("order", { ascending: true });
  if (error) {
    console.error("[db] getReels:", error);
    return [];
  }
  return (data as ReelRow[]).map(rowToReel);
}

export async function getReel(id: string): Promise<Reel | undefined> {
  const sb = await getSupabaseServer();
  const { data, error } = await sb.from("reels").select("*").eq("id", id).maybeSingle();
  if (error || !data) return undefined;
  return rowToReel(data as ReelRow);
}

export async function upsertReel(r: Reel): Promise<void> {
  const sb = await getSupabaseServer();
  const { error } = await sb.from("reels").upsert(reelToRow(r), { onConflict: "id" });
  if (error) throw new Error(`upsertReel: ${error.message}`);
}

export async function deleteReel(id: string): Promise<void> {
  const sb = await getSupabaseServer();
  const { error } = await sb.from("reels").delete().eq("id", id);
  if (error) throw new Error(`deleteReel: ${error.message}`);
}

/* ---------- Love posts ---------- */

export async function getLovePosts(): Promise<LovePost[]> {
  const sb = await getSupabaseServer();
  const { data, error } = await sb.from("love_posts").select("*").order("order", { ascending: true });
  if (error) {
    console.error("[db] getLovePosts:", error);
    return [];
  }
  return (data as LoveRow[]).map(rowToLove);
}

export async function getLovePost(id: string): Promise<LovePost | undefined> {
  const sb = await getSupabaseServer();
  const { data, error } = await sb.from("love_posts").select("*").eq("id", id).maybeSingle();
  if (error || !data) return undefined;
  return rowToLove(data as LoveRow);
}

export async function upsertLovePost(l: LovePost): Promise<void> {
  const sb = await getSupabaseServer();
  const { error } = await sb.from("love_posts").upsert(loveToRow(l), { onConflict: "id" });
  if (error) throw new Error(`upsertLovePost: ${error.message}`);
}

export async function deleteLovePost(id: string): Promise<void> {
  const sb = await getSupabaseServer();
  const { error } = await sb.from("love_posts").delete().eq("id", id);
  if (error) throw new Error(`deleteLovePost: ${error.message}`);
}

/* ---------- Featured (orbit) ---------- */

export async function getFeatured(): Promise<Featured> {
  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("featured")
    .select("orbit_slugs")
    .eq("key", "default")
    .maybeSingle();
  if (error || !data) return { orbitSlugs: [] };
  return { orbitSlugs: ((data as { orbit_slugs: string[] }).orbit_slugs ?? []) };
}

export async function setFeatured(f: Featured): Promise<void> {
  const sb = await getSupabaseServer();
  const { error } = await sb
    .from("featured")
    .upsert({ key: "default", orbit_slugs: f.orbitSlugs }, { onConflict: "key" });
  if (error) throw new Error(`setFeatured: ${error.message}`);
}

/* ---------- Settings ---------- */

const DEFAULT_SETTINGS: Settings = {
  whatsappNumber: "918617087067",
  supportEmail: "oonaistudio@gmail.com",
  instagramHandle: "onai.collective",
  shippingFee: 150,
  freeShippingAbove: 8000,
  orderIdPrefix: "ONAI",
  newsletterFormUrl: "",
};

type SettingsRow = {
  whatsapp_number: string;
  support_email: string;
  instagram_handle: string;
  shipping_fee: number;
  free_shipping_above: number;
  order_id_prefix: string;
};

export async function getSettings(): Promise<Settings> {
  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("settings")
    .select("*")
    .eq("key", "default")
    .maybeSingle();
  if (error || !data) return { ...DEFAULT_SETTINGS };
  const r = data as SettingsRow;
  return {
    whatsappNumber: r.whatsapp_number,
    supportEmail: r.support_email,
    instagramHandle: r.instagram_handle,
    shippingFee: r.shipping_fee,
    freeShippingAbove: r.free_shipping_above,
    orderIdPrefix: r.order_id_prefix,
  };
}

export async function setSettings(s: Settings): Promise<void> {
  const sb = await getSupabaseServer();
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
  if (error) throw new Error(`setSettings: ${error.message}`);
}

/* ---------- Audit log ---------- */

export async function getAudit(): Promise<AuditEntry[]> {
  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("audit_log")
    .select("ts, action, entity, entity_id")
    .order("ts", { ascending: false })
    .limit(100);
  if (error || !data) return [];
  return (data as { ts: string; action: string; entity: string; entity_id: string }[]).map((r) => ({
    ts: r.ts,
    action: r.action,
    entity: r.entity,
    entityId: r.entity_id,
  }));
}

export async function logAudit(entry: Omit<AuditEntry, "ts">): Promise<void> {
  const sb = await getSupabaseServer();
  const { error } = await sb.from("audit_log").insert({
    action: entry.action,
    entity: entry.entity,
    entity_id: entry.entityId,
  });
  if (error) console.error("[db] logAudit:", error);
}
