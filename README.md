# ONAI · CMS

Admin/back-office for the ONAI storefront. Lets you manage products, colours, inventory, artisans, reels, and the home page orbit picker — without touching code.

```
Desktop/
├── onai-next/   ← storefront  (port 3000)
└── onai-cms/    ← this repo   (port 3001)
```

The CMS owns `data/*.json`. The storefront imports those JSON files via `../onai-cms/data/...`. Every save in the CMS is auto-mirrored into `onai-next/data/`, so the storefront's dev server picks up changes instantly via Turbopack HMR.

## Run locally

```bash
# 1) Storefront, in one terminal
cd onai-next
npm run dev          # http://localhost:3000

# 2) CMS, in another terminal
cd onai-cms
npm install
npm run dev          # http://localhost:3001
```

Open the CMS at **http://localhost:3001**. The storefront preview at **http://localhost:3000** auto-reloads as you save.

## What's in here

| Tab | What it does |
| --- | --- |
| **Products** | Full CRUD: name, slug, price, story, long description, craft tag, collection, multiple hero photos, **per-colour photo + name + hex + stock count + low-stock threshold**, artisan dropdown, featured/archived toggles. |
| **Featured Bags** | Pick exactly 5 products to appear in the home page orbit animation, set their order. |
| **Reels** | CRUD for the Instagram-style deck: video upload, caption, handle, hashtag, linked product, scene fallback, gradient background, like/comment counts, deck order. |
| **Artisans** | Crafter directory: name, location, years of craft, bio, headshot. Linked from products. |
| **Inventory** | Read-only roll-up of every colourway sorted by stock — quickly spot low / OOS. Edit happens inside the product. |
| **Settings** | WhatsApp number, support email, Instagram handle, shipping fee, free-shipping threshold, order ID prefix. |

All edits hit `/api/*` → write JSON → mirror to storefront → audit log entry.

## Where uploads land

| Kind | CMS preview path | Storefront serving path |
| --- | --- | --- |
| Product image | `onai-cms/public/uploads/products/...` | `onai-next/public/images/products/...` |
| Artisan photo | `onai-cms/public/uploads/artisans/...` | `onai-next/public/images/artisans/...` |
| Reel video | `onai-cms/public/uploads/videos/...` | `onai-next/public/videos/...` |

Both copies are kept so:
- the CMS UI can show previews (served from CMS at :3001)
- the live storefront can serve them via `next/image` / `<video>` (at :3000)

The JSON only stores the storefront-relative path (`/images/products/jutt-tote-blush-1234.jpg`), which Next.js `next/image` handles natively.

## Future swap-outs

- **Auth** — none yet. For prod, drop `next-auth` with a single admin email or a hardcoded password env var.
- **Database** — `lib/db.ts` is a thin layer over JSON files. Replace with Supabase/Postgres queries when you outgrow it.
- **Image hosting** — currently saves to local disk. For prod, replace `app/api/upload/route.ts` with Cloudinary / Bunny / S3 uploads and store the CDN URL in JSON.
- **Order management** — orders flow via WhatsApp today; if/when you add a Razorpay checkout, an Orders tab here would be the next logical step.

## Note on production

This project is built for **local single-user use**. JSON-on-disk doesn't scale to multiple admins or to read-only deploys (Vercel). Before deploying the CMS publicly:

1. Add auth.
2. Move data to Postgres / Supabase.
3. Move uploads to Cloudinary or similar.

The storefront, by contrast, is deploy-ready — just commit the latest JSON and ship.
