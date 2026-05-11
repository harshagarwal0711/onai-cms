import { NextResponse } from "next/server";
import { getLovePosts, logAudit, upsertLovePost } from "@/lib/db";
import { triggerStorefrontRebuild } from "@/lib/deploy-hook";
import { makeId } from "@/lib/utils";
import type { LovePost } from "@/lib/types";

export async function GET() {
  return NextResponse.json(await getLovePosts());
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<LovePost>;
  const list = await getLovePosts();
  const post: LovePost = {
    id: body.id ?? makeId(),
    type: body.type ?? "photo",
    caption: body.caption ?? "",
    media: body.media,
    customerName: body.customerName,
    location: body.location,
    productSlug: body.productSlug,
    rating: body.rating,
    featured: body.featured ?? false,
    archived: body.archived ?? false,
    order: body.order ?? list.length,
    createdAt: new Date().toISOString(),
  };
  await upsertLovePost(post);
  await logAudit({ action: "create", entity: "love", entityId: post.id });
  triggerStorefrontRebuild();
  return NextResponse.json(post, { status: 201 });
}
