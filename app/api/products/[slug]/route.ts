import { NextResponse } from "next/server";
import { deleteProduct, getProduct, logAudit, upsertProduct } from "@/lib/db";
import { syncToStorefront } from "@/lib/sync";
import type { Product } from "@/lib/types";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const existing = getProduct(slug);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json()) as Partial<Product>;
  const updated: Product = {
    ...existing,
    ...body,
    slug: existing.slug, // never let slug change via PUT
    updatedAt: new Date().toISOString(),
  };
  await upsertProduct(updated);
  await syncToStorefront();
  await logAudit({ action: "update", entity: "product", entityId: slug });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await deleteProduct(slug);
  await syncToStorefront();
  await logAudit({ action: "delete", entity: "product", entityId: slug });
  return NextResponse.json({ ok: true });
}
