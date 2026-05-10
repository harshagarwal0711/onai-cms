import Link from "next/link";
import { getLovePosts } from "@/lib/db";
import { assetUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  photo: "📸 Photo",
  video: "🎬 Video",
  review: "⭐ Review",
  screenshot: "📱 Screenshot",
};

export default async function LoveListPage() {
  const posts = await getLovePosts();
  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Customer Love</h1>
          <p className="text-sm text-muted">
            {posts.length} posts · {posts.filter((p) => p.featured).length} featured ·{" "}
            {posts.filter((p) => p.archived).length} archived
          </p>
        </div>
        <Link href="/love/new" className="btn-primary">+ New post</Link>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => {
          const previewSrc = assetUrl(p.media);
          const isVideo = p.type === "video";
          return (
            <Link
              key={p.id}
              href={`/love/${p.id}`}
              className="group flex flex-col gap-3 rounded-2xl bg-white p-3 ring-1 ring-black/5 transition hover:ring-brand"
            >
              <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-page ring-1 ring-black/5">
                {previewSrc && !isVideo && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={previewSrc} alt="" className="h-full w-full object-cover" />
                )}
                {previewSrc && isVideo && (
                  <video src={previewSrc} muted loop autoPlay playsInline className="h-full w-full object-cover" />
                )}
                {!previewSrc && (
                  <div className="grid h-full w-full place-items-center p-4 text-center">
                    {p.type === "review" && p.rating ? (
                      <div>
                        <p className="text-2xl">{"★".repeat(p.rating) + "☆".repeat(5 - p.rating)}</p>
                        <p className="mt-2 line-clamp-3 text-xs italic text-muted">&quot;{p.caption}&quot;</p>
                      </div>
                    ) : (
                      <span className="text-xs text-muted">{TYPE_LABEL[p.type]}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="px-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                    {TYPE_LABEL[p.type]} · #{p.order}
                  </span>
                  {p.featured && <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">Featured</span>}
                  {p.archived && <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-bold text-muted">Archived</span>}
                </div>
                <p className="mt-1 line-clamp-2 text-sm">{p.caption || <span className="text-muted">No caption</span>}</p>
                {(p.customerName || p.location) && (
                  <p className="mt-1 text-[11px] text-muted">
                    {p.customerName}{p.customerName && p.location ? " · " : ""}{p.location}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
        {posts.length === 0 && (
          <div className="col-span-full rounded-2xl bg-white p-10 text-center ring-1 ring-black/5">
            <p className="text-muted">No customer love posts yet.</p>
            <Link href="/love/new" className="mt-4 inline-block btn-primary">Post your first one</Link>
          </div>
        )}
      </div>
    </div>
  );
}
