import path from "path";

/**
 * Filesystem layout. The CRM and storefront sit as siblings under `Desktop/`.
 * If you move them, update STOREFRONT_DIR.
 */

const CMS_ROOT = process.cwd();

export const CMS_DATA = path.join(CMS_ROOT, "data");
export const CMS_UPLOADS = path.join(CMS_ROOT, "public", "uploads");

// Sibling project — the storefront.
export const STOREFRONT_DIR = path.resolve(CMS_ROOT, "..", "onai-next");
export const STOREFRONT_DATA = path.join(STOREFRONT_DIR, "data");
export const STOREFRONT_PUBLIC = path.join(STOREFRONT_DIR, "public");
export const STOREFRONT_IMAGES = path.join(STOREFRONT_PUBLIC, "images", "products");
export const STOREFRONT_ARTISAN_PHOTOS = path.join(STOREFRONT_PUBLIC, "images", "artisans");
export const STOREFRONT_VIDEOS = path.join(STOREFRONT_PUBLIC, "videos");
export const STOREFRONT_LOVE_IMAGES = path.join(STOREFRONT_PUBLIC, "images", "love");

// JSON files (CRM-owned; storefront imports these via relative path).
export const FILE_PRODUCTS = path.join(CMS_DATA, "products.json");
export const FILE_ARTISANS = path.join(CMS_DATA, "artisans.json");
export const FILE_REELS = path.join(CMS_DATA, "reels.json");
export const FILE_FEATURED = path.join(CMS_DATA, "featured.json");
export const FILE_SETTINGS = path.join(CMS_DATA, "settings.json");
export const FILE_AUDIT = path.join(CMS_DATA, "audit.json");
export const FILE_LOVE = path.join(CMS_DATA, "love.json");
