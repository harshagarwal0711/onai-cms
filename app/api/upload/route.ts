import { NextResponse } from "next/server";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

/**
 * Multipart upload handler. Saves to Supabase Storage and returns the public URL.
 *
 *   POST /api/upload?kind=product-image&prefix=jutt-tote-blush
 *   POST /api/upload?kind=artisan-photo&prefix=meena-rajput
 *   POST /api/upload?kind=love-photo&prefix=customer-shot
 *   POST /api/upload?kind=video&prefix=reel-jutt
 *
 * Auth is enforced upstream by middleware. The returned `url` is what you
 * store in JSON / DB.
 */

const BUCKET = "uploads";

const SUBDIR: Record<string, string> = {
  "product-image": "products",
  "artisan-photo": "artisans",
  "love-photo": "love",
  video: "videos",
};

export async function POST(req: Request) {
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") ?? "product-image";
  const prefix = url.searchParams.get("prefix") ?? "asset";

  const subdir = SUBDIR[kind];
  if (!subdir) {
    return NextResponse.json({ error: `Unknown kind: ${kind}` }, { status: 400 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const orig = file.name || "upload.bin";
  const ext = path.extname(orig).toLowerCase() || guessExt(file.type);
  const filename = `${slugify(prefix)}-${Date.now()}${ext}`;
  const objectPath = `${subdir}/${filename}`;

  const buf = Buffer.from(await file.arrayBuffer());

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, buf, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    console.error("[upload] supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);

  return NextResponse.json({
    url: data.publicUrl,
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
