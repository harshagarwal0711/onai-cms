import "server-only";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import {
  FILE_ARTISANS,
  FILE_FEATURED,
  FILE_LOVE,
  FILE_PRODUCTS,
  FILE_REELS,
  FILE_SETTINGS,
  STOREFRONT_DATA,
} from "./paths";

/**
 * Mirrors the CRM's data files into the storefront's `data/` directory so that
 * Next.js's `import` of those JSON files picks up the change via HMR.
 *
 * Called from API routes after every successful write.
 */
export async function syncToStorefront(): Promise<void> {
  if (!fs.existsSync(path.dirname(STOREFRONT_DATA))) {
    // Storefront not present alongside the CRM — skip silently.
    console.warn(`[sync] storefront dir not found at ${STOREFRONT_DATA}, skipping`);
    return;
  }
  await fsp.mkdir(STOREFRONT_DATA, { recursive: true });

  const pairs: Array<[string, string]> = [
    [FILE_PRODUCTS, "products.json"],
    [FILE_ARTISANS, "artisans.json"],
    [FILE_REELS, "reels.json"],
    [FILE_FEATURED, "featured.json"],
    [FILE_SETTINGS, "settings.json"],
    [FILE_LOVE, "love.json"],
  ];

  await Promise.all(
    pairs.map(async ([src, name]) => {
      if (!fs.existsSync(src)) return;
      const dst = path.join(STOREFRONT_DATA, name);
      await fsp.copyFile(src, dst);
    }),
  );
}
