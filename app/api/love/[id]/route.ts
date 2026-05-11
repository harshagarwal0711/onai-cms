import { NextResponse } from "next/server";
import { deleteLovePost, getLovePost, logAudit, upsertLovePost } from "@/lib/db";
import { triggerStorefrontRebuild } from "@/lib/deploy-hook";
import type { LovePost } from "@/lib/types";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const l = await getLovePost(id);
  if (!l) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(l);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await getLovePost(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = (await req.json()) as Partial<LovePost>;
  const updated: LovePost = { ...existing, ...body, id: existing.id };
  await upsertLovePost(updated);
  await logAudit({ action: "update", entity: "love", entityId: id });
  triggerStorefrontRebuild();
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteLovePost(id);
  await logAudit({ action: "delete", entity: "love", entityId: id });
  triggerStorefrontRebuild();
  return NextResponse.json({ ok: true });
}
