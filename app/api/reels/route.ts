import { NextResponse } from "next/server";
import { getReels, logAudit, upsertReel } from "@/lib/db";
import { syncToStorefront } from "@/lib/sync";
import { makeId } from "@/lib/utils";
import type { Reel } from "@/lib/types";

export async function GET() {
  return NextResponse.json(getReels());
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<Reel>;
  const list = getReels();
  const reel: Reel = {
    id: body.id ?? makeId(),
    title: body.title ?? "Untitled reel",
    caption: body.caption ?? "",
    handle: body.handle ?? "Original audio",
    hashtag: body.hashtag,
    productSlug: body.productSlug,
    bagColor: body.bagColor,
    scene: body.scene ?? "bag",
    video: body.video,
    likes: body.likes ?? "0",
    comments: body.comments ?? "0",
    bg: body.bg ?? "linear-gradient(160deg, #ffd1dc 0%, #ff6b9d 100%)",
    order: body.order ?? list.length,
    archived: body.archived ?? false,
    createdAt: new Date().toISOString(),
  };
  await upsertReel(reel);
  await syncToStorefront();
  await logAudit({ action: "create", entity: "reel", entityId: reel.id });
  return NextResponse.json(reel, { status: 201 });
}
