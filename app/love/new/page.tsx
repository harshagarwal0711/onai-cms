import Link from "next/link";
import { LoveForm } from "@/components/love-form";
import { getLovePosts, getProducts } from "@/lib/db";
import { makeId } from "@/lib/utils";
import type { LovePost } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NewLovePage() {
  const [products, posts] = await Promise.all([getProducts(), getLovePosts()]);
  const blank: LovePost = {
    id: makeId(),
    type: "photo",
    caption: "",
    featured: false,
    archived: false,
    order: posts.length,
    createdAt: new Date().toISOString(),
  };
  return (
    <div>
      <nav className="mb-2 text-xs text-muted">
        <Link href="/love" className="hover:text-brand">Customer Love</Link> · <span>New</span>
      </nav>
      <h1 className="mb-8 text-2xl font-bold">New customer love post</h1>
      <LoveForm initial={blank} products={products} mode="create" />
    </div>
  );
}
