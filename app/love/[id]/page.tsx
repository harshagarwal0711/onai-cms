import Link from "next/link";
import { notFound } from "next/navigation";
import { LoveForm } from "@/components/love-form";
import { getLovePost, getProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditLovePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, products] = await Promise.all([getLovePost(id), getProducts()]);
  if (!post) notFound();
  return (
    <div>
      <nav className="mb-2 text-xs text-muted">
        <Link href="/love" className="hover:text-brand">Customer Love</Link> · <span>{post.caption.slice(0, 40) || "Untitled"}</span>
      </nav>
      <h1 className="mb-8 text-2xl font-bold">Edit love post</h1>
      <LoveForm initial={post} products={products} mode="edit" />
    </div>
  );
}
