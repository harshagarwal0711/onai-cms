import Link from "next/link";
import { notFound } from "next/navigation";
import { ReelForm } from "@/components/reel-form";
import { getProducts, getReel } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditReelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reel = getReel(id);
  if (!reel) notFound();
  const products = getProducts();
  return (
    <div>
      <nav className="mb-2 text-xs text-muted">
        <Link href="/reels" className="hover:text-brand">Reels</Link> · <span>{reel.title}</span>
      </nav>
      <h1 className="mb-8 text-2xl font-bold">{reel.title}</h1>
      <ReelForm initial={reel} products={products} mode="edit" />
    </div>
  );
}
