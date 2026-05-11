import { NextResponse } from "next/server";
import { deleteArtisan, getArtisan, logAudit, upsertArtisan } from "@/lib/db";
import { triggerStorefrontRebuild } from "@/lib/deploy-hook";
import type { Artisan } from "@/lib/types";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await getArtisan(id);
  if (!a) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(a);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await getArtisan(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = (await req.json()) as Partial<Artisan>;
  const updated: Artisan = { ...existing, ...body, id: existing.id };
  await upsertArtisan(updated);
  await logAudit({ action: "update", entity: "artisan", entityId: id });
  triggerStorefrontRebuild();
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteArtisan(id);
  await logAudit({ action: "delete", entity: "artisan", entityId: id });
  triggerStorefrontRebuild();
  return NextResponse.json({ ok: true });
}
