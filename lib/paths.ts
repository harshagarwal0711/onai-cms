import path from "path";

/**
 * Filesystem layout. Only used by the one-shot migration script
 * (`scripts/migrate-to-supabase.ts`) to read the legacy JSON files.
 * Once migrated, the data lives in Supabase and these paths can be ignored.
 */

const CMS_ROOT = process.cwd();

export const CMS_DATA = path.join(CMS_ROOT, "data");

export const FILE_PRODUCTS = path.join(CMS_DATA, "products.json");
export const FILE_ARTISANS = path.join(CMS_DATA, "artisans.json");
export const FILE_REELS = path.join(CMS_DATA, "reels.json");
export const FILE_FEATURED = path.join(CMS_DATA, "featured.json");
export const FILE_SETTINGS = path.join(CMS_DATA, "settings.json");
export const FILE_LOVE = path.join(CMS_DATA, "love.json");
