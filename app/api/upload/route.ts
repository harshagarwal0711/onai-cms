import { NextResponse } from "next/server";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import {
  CMS_UPLOADS,
  STOREFRONT_ARTISAN_PHOTOS,
  STOREFRONT_IMAGES,
  STOREFRONT_LOVE_IMAGES,
  STOREFRONT_VIDEOS,
} from "@/lib/paths";
import { slugify } from "@/lib/utils";

/**
 * Multipart upload handler.
 *
 *   POST /api/upload?kind=product-image&prefix=jutt-tote-blush
 *   POST /api/upload?kind=artisan-photo&prefix=meena-rajput
 *   POST /api/upload?kind=video&prefix=reel-jutt
 *
 * The file is saved into the CRM's public folder (so admin previews work) AND
 * into the storefront's public folder (so it's served by next/image / <video>
 * at the same path). The returned `url` is the path you store in JSON.
 */

export async function POST(req: Request) {
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") ?? "product-image";
  const prefix = url.searchParams.get("prefix") ?? "asset";

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Decide destinations based on kind.
  let cmsSubdir: string;
  let storefrontDir: string;
  let publicPath: string;

  switch (kind) {
    case "product-image": {
      cmsSubdir = "products";
      storefrontDir = STOREFRONT_IMAGES;
      publicPath = "/images/products";
      break;
    }
    case "artisan-photo": {
      cmsSubdir = "artisans";
      storefrontDir = STOREFRONT_ARTISAN_PHOTOS;
      publicPath = "/images/artisans";
      break;
    }
    case "love-photo": {
      cmsSubdir = "love";
      storefrontDir = STOREFRONT_LOVE_IMAGES;
      publicPath = "/images/love";
      break;
    }
    case "video": {
      cmsSubdir = "videos";
      storefrontDir = STOREFRONT_VIDEOS;
      publicPath = "/videos";
      break;
    }
    default:
      return NextResponse.json({ error: `Unknown kind: ${kind}` }, { status: 400 });
  }

  // Filename: <prefix>-<timestamp>.<ext>
  const orig = file.name || "upload.bin";
  const ext = path.extname(orig).toLowerCase() || guessExt(file.type);
  const safe = `${slugify(prefix)}-${Date.now()}${ext}`;

  const cmsTarget = path.join(CMS_UPLOADS, cmsSubdir, safe);
  const storefrontTarget = path.join(storefrontDir, safe);

  const buf = Buffer.from(await file.arrayBuffer());
  await fsp.mkdir(path.dirname(cmsTarget), { recursive: true });
  await fsp.writeFile(cmsTarget, buf);

  // Mirror into the storefront's public folder (skip if the storefront isn't there).
  if (fs.existsSync(path.dirname(storefrontDir))) {
    await fsp.mkdir(storefrontDir, { recursive: true });
    await fsp.writeFile(storefrontTarget, buf);
  }

  return NextResponse.json({
    url: `${publicPath}/${safe}`,
    bytes: buf.byteLength,
    type: file.type,
  });
}

function guessExt(type: string): string {
  if (!type) return "";
  if (type.startsWith("image/png")) return ".png";
  if (type.startsWith("image/jpeg")) return ".jpg";
  if (type.startsWith("image/webp")) return ".webp";
  if (type.startsWith("video/mp4")) return ".mp4";
  if (type.startsWith("video/webm")) return ".webm";
  return "";
}
