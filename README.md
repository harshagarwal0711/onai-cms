# ONAI · CMS

Admin/back-office for the ONAI storefront. Manage products, colours, inventory, artisans, reels, the home-page orbit picker, and customer-love posts — all without touching code.

Backed by **Supabase** (Postgres + Auth + Storage). Single-admin login.

## Stack

| Layer | Tech |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Database | Supabase Postgres |
| Auth | Supabase Auth (email + password, single admin) |
| Image / video hosting | Supabase Storage (public bucket `uploads`) |
| Styling | Tailwind CSS |

## First-time setup

You'll do this once.

### 1. Create a Supabase project

- Go to [supabase.com](https://supabase.com) → **New project** → free tier is fine.
- Name it `onai-cms`. Pick a region near your customers (e.g. Mumbai/Singapore).
- Save the database password somewhere safe (you won't need it for the app — only if you ever connect with an SQL client).

### 2. Run the schema

- Dashboard → **SQL Editor** → **New query**.
- Paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
- It creates the tables (`products`, `artisans`, `reels`, `love_posts`, `featured`, `settings`, `audit_log`) and the RLS policies that let the storefront read but only the admin write.

### 3. Create the storage bucket

- Dashboard → **Storage** → **New bucket**.
- Name: `uploads`. **Mark as Public.** Click **Create**.
- Then go back to SQL Editor, paste [`supabase/storage.sql`](supabase/storage.sql), and **Run**. (This sets the bucket policies — public read, authenticated write.)

### 4. Create the admin user

- Dashboard → **Authentication** → **Users** → **Add user → Create new user**.
- Enter the email and password the friend will use.
- Tick **Auto Confirm User** so they can log in immediately without an email round-trip.

### 5. Pull the API keys

- Dashboard → **Project Settings** → **API**.
- You'll see three things you need:
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **service_role key** (under "Reveal") → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 6. Wire it up locally

```bash
cp .env.example .env.local
# fill in the three keys from step 5
npm install
```

### 7. Migrate existing data (one-time)

Imports the legacy `data/*.json` files into Supabase:

```bash
npm run migrate
```

You can verify in Dashboard → Table Editor.

> Note: any image/video URLs in the legacy JSON still point at the old `/images/...` paths. The CMS pages tolerate this (they'll render broken thumbs); to fix, re-upload the asset on the relevant edit page. New uploads go straight to Supabase Storage.

### 8. Run

```bash
npm run dev   # http://localhost:3001
```

Visit [http://localhost:3001](http://localhost:3001), sign in with the credentials from step 4.

## Deployment (Vercel)

1. **Push the repo to GitHub.**
2. **Vercel → Add new project → Import.** Select this repo.
3. **Environment variables** — add all four from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_STOREFRONT_URL` (your deployed storefront URL, optional)
4. **Deploy.** Once live, point a subdomain like `cms.onai.in` at it (Vercel → Settings → Domains).
5. The friend logs in at `https://cms.onai.in/login`.

## Storefront integration

The storefront (`onai-next`) used to import the JSON files directly. After this migration, point it at the public CMS API instead — for example:

```ts
// onai-next/lib/api.ts
const CMS = process.env.NEXT_PUBLIC_CMS_URL!; // https://cms.onai.in

export async function fetchProducts() {
  const res = await fetch(`${CMS}/api/products`, { next: { revalidate: 60 } });
  return res.json();
}
// …same pattern for /api/artisans, /api/reels, /api/love, /api/featured, /api/settings
```

Public GETs on `/api/products`, `/api/artisans`, `/api/reels`, `/api/love`, `/api/featured`, `/api/settings` are open and CORS-friendly. Every other route requires an admin session.

## What's in the admin

| Tab | What it does |
| --- | --- |
| **Products** | Full CRUD: name, slug, price, story, long description, craft tag, collection, multiple hero photos, **per-colour photo + name + hex + stock count + low-stock threshold**, artisan dropdown, featured/archived toggles. |
| **Featured Bags** | Pick exactly 5 products to appear in the home page orbit animation. |
| **Reels** | CRUD for the Instagram-style deck: video upload, caption, handle, hashtag, linked product, scene fallback, gradient background, like/comment counts, deck order. |
| **Customer Love** | UGC + reviews block: photos, screenshots, videos, star reviews. |
| **Artisans** | Crafter directory: name, location, years of craft, bio, headshot. Linked from products. |
| **Inventory** | Read-only roll-up of every colourway sorted by stock — quickly spot low / OOS. |
| **Settings** | WhatsApp number, support email, Instagram handle, shipping fee, free-shipping threshold, order ID prefix. |

All edits hit `/api/*` → write to Supabase → audit log entry.

## File layout

```
app/                       # Next.js app router
├── login/                 # Login page (public)
├── api/auth/{login,logout}/  # Sign-in/out handlers
├── api/{products,artisans,reels,love,featured,settings}/   # Public GET, admin write
├── api/upload/            # Supabase Storage upload (admin only)
└── (admin pages)
components/                # Forms + UI primitives
lib/
├── db.ts                  # Supabase-backed data layer (replaces JSON-on-disk)
├── supabase/{server,middleware,admin}.ts  # Supabase clients
├── types.ts               # Shared types (used by storefront too)
└── utils.ts
middleware.ts              # Route gate: public GETs + login, everything else needs auth
supabase/
├── schema.sql             # Tables + RLS policies
└── storage.sql            # Storage bucket policies
scripts/
└── migrate-to-supabase.ts # One-shot JSON → Supabase importer
data/                      # Legacy JSON snapshots (kept for migration; ignore after)
```

## Adding a second admin

You probably won't need this, but: Dashboard → Authentication → Users → Add user. Anyone with a confirmed account can log in.

## Resetting the password

Dashboard → Authentication → Users → click the user → "Send password recovery" or "Update password" inline.
