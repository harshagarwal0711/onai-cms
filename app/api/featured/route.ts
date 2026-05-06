import { NextResponse } from "next/server";
import { getFeatured, getProducts, logAudit, setFeatured } from "@/lib/db";
import { syncToStorefront } from "@/lib/sync";
import type { Featured } from "@/lib/types";

export async function GET() {
  return NextResponse.json(getFeatured());
}

export async function PUT(req: Request) {
  const body = (await req.json()) as Featured;
  // Reject orbit slugs that don't match real products.
  const validSlugs = new Set(getProducts().map((p) => p.slug));
  const cleaned = (body.orbitSlugs ?? []).filter((s) => validSlugs.has(s));
  if (cleaned.length < 5) {
    return NextResponse.json(
      { error: "Pick exactly 5 bags for the orbit animation." },
      { status: 400 },
    );
  }
  const next: Featured = { orbitSlugs: cleaned.slice(0, 5) };
  await setFeatured(next);
  await syncToStorefront();
  await logAudit({ action: "update", entity: "featured", entityId: "orbit" });
  return NextResponse.json(next);
}
