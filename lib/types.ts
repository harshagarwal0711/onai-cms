/**
 * Single source of truth for the data model. Both the CRM and the storefront
 * import these types — keeps the JSON shape honest on both ends.
 */

export type Collection = "summer" | "wedding" | "everyday" | "limited";

export type ProductColor = {
  id: string;
  name: string;
  hex: string;
  image?: string;          // public path: "/images/products/jutt-tote-blush.jpg"
  inStock: boolean;
  stockCount: number;      // exact units on hand
  lowStockAt: number;      // warn threshold for inventory dashboard
  /** Optional override of the product-level selling price for this colourway. */
  price?: number;
  /** Optional override of the product-level MRP (struck-through price). */
  mrp?: number;
};

export type Product = {
  slug: string;
  name: string;
  price: number;           // INR whole rupees — what customers actually pay
  /** Original / list price. If set and greater than `price`, surfaces as the
   *  struck-through MRP next to the discounted price on the storefront. */
  mrp?: number;
  story: string;           // 1-line tagline
  description: string;     // long-form
  craft: string;           // "Hand-crocheted in Kutch"
  collection: Collection;
  colors: ProductColor[];
  images: string[];        // hero photos (0..n) — colorway photo overrides this
  artisanId?: string;      // FK → Artisan.id
  featured: boolean;       // shown in Summer Edit + Featured filters
  archived: boolean;       // soft-hidden from the shop
  createdAt: string;
  updatedAt: string;
};

export type Artisan = {
  id: string;
  name: string;
  bio: string;
  location: string;        // "Kutch, Gujarat"
  photo?: string;          // public path
  craftYears?: number;
  createdAt: string;
};

export type Reel = {
  id: string;
  title: string;           // internal label
  caption: string;         // shows on the reel overlay
  handle: string;          // sub-text, e.g. "Original audio"
  hashtag?: string;
  productSlug?: string;    // optional link to the product PDP
  bagColor?: string;       // hex — controls the SVG fallback color
  scene: "bag" | "yarn" | "stitch";
  video?: string;          // public path: "/videos/reel-jutt.mp4"
  likes: string;           // display string e.g. "12.4k"
  comments: string;        // display string
  bg: string;              // CSS gradient string
  order: number;           // sort order in the deck
  archived: boolean;
  createdAt: string;
};

export type Featured = {
  /** Slugs of the 5 products that appear in the home orbit animation, in order. */
  orbitSlugs: string[];
};

export type LovePost = {
  id: string;
  /** Drives layout: photo/screenshot/video render with media + caption.
   *  "review" is a text-only quote card with a star rating. */
  type: "photo" | "video" | "review" | "screenshot";
  caption: string;
  /** Public path on the storefront — `/images/love/...` or `/videos/...`. */
  media?: string;
  customerName?: string;
  /** "Mumbai" or "Bangalore, KA" */
  location?: string;
  /** Optional FK to a product. */
  productSlug?: string;
  /** 1-5 stars. Used by review cards. */
  rating?: number;
  featured: boolean;
  archived: boolean;
  /** Lower order = appears first. */
  order: number;
  createdAt: string;
};

export type Settings = {
  whatsappNumber: string;
  supportEmail: string;
  instagramHandle: string;
  shippingFee: number;
  freeShippingAbove: number;
  orderIdPrefix: string;
};

export type AuditEntry = {
  ts: string;
  action: string;
  entity: string;
  entityId: string;
};
