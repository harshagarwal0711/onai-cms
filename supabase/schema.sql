-- ONAI CMS — Supabase schema
--
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Idempotent: safe to re-run.

-- ============================================================================
-- Tables
-- ============================================================================

create table if not exists products (
  slug text primary key,
  name text not null,
  price integer not null default 0,
  mrp integer,
  story text not null default '',
  description text not null default '',
  craft text not null default '',
  collection text not null default 'everyday',
  colors jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  artisan_id text,
  featured boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists artisans (
  id text primary key,
  name text not null,
  bio text not null default '',
  location text not null default '',
  photo text,
  craft_years integer,
  created_at timestamptz not null default now()
);

create table if not exists reels (
  id text primary key,
  title text not null,
  caption text not null default '',
  handle text not null default '',
  hashtag text,
  product_slug text,
  bag_color text,
  scene text not null default 'bag',
  video text,
  likes text not null default '0',
  comments text not null default '0',
  bg text not null default '',
  "order" integer not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists love_posts (
  id text primary key,
  type text not null,
  caption text not null default '',
  media text,
  customer_name text,
  location text,
  product_slug text,
  rating integer,
  featured boolean not null default false,
  archived boolean not null default false,
  "order" integer not null default 0,
  created_at timestamptz not null default now()
);

-- Singleton tables: one row, key = 'default'
create table if not exists featured (
  key text primary key default 'default',
  orbit_slugs jsonb not null default '[]'::jsonb
);

create table if not exists settings (
  key text primary key default 'default',
  whatsapp_number text not null default '919564732995',
  support_email text not null default 'hello@onai.in',
  instagram_handle text not null default 'onai.craft',
  shipping_fee integer not null default 150,
  free_shipping_above integer not null default 8000,
  order_id_prefix text not null default 'ONAI',
  newsletter_form_url text not null default ''
);

-- For databases created before the newsletter_form_url column was added.
alter table settings add column if not exists newsletter_form_url text not null default '';

create table if not exists audit_log (
  id bigserial primary key,
  ts timestamptz not null default now(),
  action text not null,
  entity text not null,
  entity_id text not null
);

create index if not exists audit_log_ts_idx on audit_log (ts desc);

-- Seed singleton rows so reads always succeed.
insert into featured (key) values ('default') on conflict (key) do nothing;
insert into settings (key) values ('default') on conflict (key) do nothing;

-- ============================================================================
-- Row Level Security
--
-- Reads (anon + authenticated): products, artisans, reels, love_posts,
--   featured, settings — these power the storefront.
-- Writes (authenticated only): everything.
-- audit_log: authenticated only for both read and write.
-- ============================================================================

alter table products     enable row level security;
alter table artisans     enable row level security;
alter table reels        enable row level security;
alter table love_posts   enable row level security;
alter table featured     enable row level security;
alter table settings     enable row level security;
alter table audit_log    enable row level security;

-- Public read on the storefront-facing tables.
do $$ begin
  create policy "public read products"   on products   for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read artisans"   on artisans   for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read reels"      on reels      for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read love_posts" on love_posts for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read featured"   on featured   for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read settings"   on settings   for select using (true);
exception when duplicate_object then null; end $$;

-- Authenticated full access on every table.
do $$ begin
  create policy "auth crud products"   on products   for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "auth crud artisans"   on artisans   for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "auth crud reels"      on reels      for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "auth crud love_posts" on love_posts for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "auth crud featured"   on featured   for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "auth crud settings"   on settings   for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "auth crud audit_log"  on audit_log  for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;
