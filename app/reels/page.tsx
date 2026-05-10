import Link from "next/link";
import { getReels } from "@/lib/db";
import { assetUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReelsPage() {
  const reels = await getReels();
  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Instagram reels</h1>
          <p className="text-sm text-muted">{reels.length} reels in the home page deck.</p>
        </div>
        <Link href="/reels/new" className="btn-primary">+ New reel</Link>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reels.map((r) => {
          const previewSrc = assetUrl(r.video);
          return (
            <Link
              key={r.id}
              href={`/reels/${r.id}`}
              className="group flex gap-4 rounded-2xl bg-white p-3 ring-1 ring-black/5 transition hover:ring-brand"
            >
              <div className="aspect-[9/16] w-24 shrink-0 overflow-hidden rounded-xl ring-1 ring-black/5" style={{ background: r.bg }}>
                {previewSrc && (
                  <video src={previewSrc} muted loop autoPlay playsInline className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted">#{r.order} · {r.scene}</p>
                  <p className="font-semibold">{r.title}</p>
                  <p className="mt-1 text-xs text-muted">{r.caption}</p>
                </div>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-muted">
                  <span>♥ {r.likes}</span>
                  <span>· 💬 {r.comments}</span>
                  {r.archived && <span className="ml-auto rounded-full bg-black/5 px-2 py-0.5 font-bold">Archived</span>}
                </div>
              </div>
            </Link>
          );
        })}
        {reels.length === 0 && (
          <div className="col-span-full rounded-2xl bg-white p-10 text-center ring-1 ring-black/5">
            <p className="text-muted">No reels yet.</p>
            <Link href="/reels/new" className="mt-4 inline-block btn-primary">Create your first reel</Link>
          </div>
        )}
      </div>
    </div>
  );
}
