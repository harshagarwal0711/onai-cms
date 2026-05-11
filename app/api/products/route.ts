import { NextResponse } from "next/server";
import { getProduct, getProducts, logAudit, upsertProduct } from "@/lib/db";
import { triggerStorefrontRebuild } from "@/lib/deploy-hook";
import { slugify } from "@/lib/utils";
import type { Product } from "@/lib/types";

export async function GET() {
  return NextResponse.json(await getProducts());
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<Product>;
  const now = new Date().toISOString();

  if (!body.name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  const slug = body.slug ? slugify(body.slug) : slugify(body.name);
  if (await getProduct(slug)) {
    return NextResponse.json({ error: `Slug "${slug}" already exists` }, { status: 409 });
  }

  const product: Product = {
    slug,
    name: body.name,
    price: body.price ?? 0,
    story: body.story ?? "",
    description: body.description ?? "",
    craft: body.craft ?? "",
    collection: body.collection ?? "everyday",
    colors: body.colors ?? [],
    images: body.images ?? [],
    artisanId: body.artisanId,
    featured: body.featured ?? false,
    archived: body.archived ?? false,
    createdAt: now,
    updatedAt: now,
  };

  await upsertProduct(product);
  await logAudit({ action: "create", entity: "product", entityId: slug });
  triggerStorefrontRebuild();
  return NextResponse.json(product, { status: 201 });
}
