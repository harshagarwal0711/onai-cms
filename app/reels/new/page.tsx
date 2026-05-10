import Link from "next/link";
import { ReelForm } from "@/components/reel-form";
import { getProducts, getReels } from "@/lib/db";
import { makeId } from "@/lib/utils";
import type { Reel } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NewReelPage() {
  const [products, reels] = await Promise.all([getProducts(), getReels()]);
  const blank: Reel = {
    id: makeId(),
    title: "",
    caption: "",
    handle: "Original audio",
    scene: "bag",
    likes: "0",
    comments: "0",
    bg: "linear-gradient(160deg, #ffd1dc 0%, #ff6b9d 100%)",
    order: reels.length,
    archived: false,
    createdAt: new Date().toISOString(),
  };
  return (
    <div>
      <nav className="mb-2 text-xs text-muted">
        <Link href="/reels" className="hover:text-brand">Reels</Link> · <span>New</span>
      </nav>
      <h1 className="mb-8 text-2xl font-bold">New reel</h1>
      <ReelForm initial={blank} products={products} mode="create" />
    </div>
  );
}
