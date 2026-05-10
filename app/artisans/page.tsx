import Link from "next/link";
import { getArtisans, getProducts } from "@/lib/db";
import { assetUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ArtisansPage() {
  const [artisans, products] = await Promise.all([getArtisans(), getProducts()]);
  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Artisans</h1>
          <p className="text-sm text-muted">{artisans.length} crafters · linked to products via the artisan field.</p>
        </div>
        <Link href="/artisans/new" className="btn-primary">+ New artisan</Link>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {artisans.map((a) => {
          const linked = products.filter((p) => p.artisanId === a.id);
          const photoSrc = assetUrl(a.photo);
          return (
            <Link
              key={a.id}
              href={`/artisans/${a.id}`}
              className="flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-black/5 hover:ring-brand"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-page ring-1 ring-black/5">
                {photoSrc ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={photoSrc} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-2xl text-muted">{a.name.charAt(0).toUpperCase()}</div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{a.name}</p>
                <p className="text-xs text-muted">{a.location}</p>
                {a.bio && <p className="mt-2 line-clamp-2 text-xs text-ink/70">{a.bio}</p>}
                <p className="mt-3 text-[11px] uppercase tracking-widest text-muted">
                  {linked.length} product{linked.length === 1 ? "" : "s"}
                </p>
              </div>
            </Link>
          );
        })}
        {artisans.length === 0 && (
          <div className="col-span-full rounded-2xl bg-white p-10 text-center ring-1 ring-black/5">
            <p className="text-muted">No artisans yet.</p>
            <Link href="/artisans/new" className="mt-4 inline-block btn-primary">Add your first crafter</Link>
          </div>
        )}
      </div>
    </div>
  );
}
