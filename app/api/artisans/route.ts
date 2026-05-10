import { NextResponse } from "next/server";
import { getArtisans, logAudit, upsertArtisan } from "@/lib/db";
import { makeId } from "@/lib/utils";
import type { Artisan } from "@/lib/types";

export async function GET() {
  return NextResponse.json(await getArtisans());
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<Artisan>;
  if (!body.name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const artisan: Artisan = {
    id: body.id ?? makeId(),
    name: body.name,
    bio: body.bio ?? "",
    location: body.location ?? "",
    photo: body.photo,
    craftYears: body.craftYears,
    createdAt: new Date().toISOString(),
  };
  await upsertArtisan(artisan);
  await logAudit({ action: "create", entity: "artisan", entityId: artisan.id });
  return NextResponse.json(artisan, { status: 201 });
}
