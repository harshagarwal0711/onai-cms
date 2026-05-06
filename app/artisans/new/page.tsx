import Link from "next/link";
import { ArtisanForm } from "@/components/artisan-form";
import { makeId } from "@/lib/utils";
import type { Artisan } from "@/lib/types";

export const dynamic = "force-dynamic";

export default function NewArtisanPage() {
  const blank: Artisan = {
    id: makeId(),
    name: "",
    bio: "",
    location: "",
    createdAt: new Date().toISOString(),
  };
  return (
    <div>
      <nav className="mb-2 text-xs text-muted">
        <Link href="/artisans" className="hover:text-brand">Artisans</Link> · <span>New</span>
      </nav>
      <h1 className="mb-8 text-2xl font-bold">New artisan</h1>
      <ArtisanForm initial={blank} mode="create" />
    </div>
  );
}
