import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtisanForm } from "@/components/artisan-form";
import { getArtisan } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditArtisanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = getArtisan(id);
  if (!a) notFound();
  return (
    <div>
      <nav className="mb-2 text-xs text-muted">
        <Link href="/artisans" className="hover:text-brand">Artisans</Link> · <span>{a.name}</span>
      </nav>
      <h1 className="mb-8 text-2xl font-bold">{a.name}</h1>
      <ArtisanForm initial={a} mode="edit" />
    </div>
  );
}
