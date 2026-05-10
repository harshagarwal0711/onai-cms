-- ONAI CMS — Storage bucket
--
-- Run AFTER creating the `uploads` bucket in Dashboard → Storage → New bucket
-- (mark it as **public** so the storefront can hot-link images).
--
-- This file just sets the access policies. The bucket itself is created via
-- the dashboard because Supabase doesn't allow create-bucket from SQL on the
-- free tier without `storage.create_bucket()` privileges.

-- Public read for everyone (so the storefront's <img>/<video> can load).
do $$ begin
  create policy "public read uploads"
    on storage.objects for select
    using (bucket_id = 'uploads');
exception when duplicate_object then null; end $$;

-- Only authenticated users (i.e. the admin) can upload / overwrite / delete.
do $$ begin
  create policy "auth write uploads"
    on storage.objects for insert to authenticated
    with check (bucket_id = 'uploads');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "auth update uploads"
    on storage.objects for update to authenticated
    using (bucket_id = 'uploads')
    with check (bucket_id = 'uploads');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "auth delete uploads"
    on storage.objects for delete to authenticated
    using (bucket_id = 'uploads');
exception when duplicate_object then null; end $$;
