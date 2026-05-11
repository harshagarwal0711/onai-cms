import { NextResponse } from "next/server";
import { deleteReel, getReel, logAudit, upsertReel } from "@/lib/db";
import { triggerStorefrontRebuild } from "@/lib/deploy-hook";
import type { Reel } from "@/lib/types";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await getReel(id);
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(r);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await getReel(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = (await req.json()) as Partial<Reel>;
  const updated: Reel = { ...existing, ...body, id: existing.id };
  await upsertReel(updated);
  await logAudit({ action: "update", entity: "reel", entityId: id });
  triggerStorefrontRebuild();
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteReel(id);
  await logAudit({ action: "delete", entity: "reel", entityId: id });
  triggerStorefrontRebuild();
  return NextResponse.json({ ok: true });
}
