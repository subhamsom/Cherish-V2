-- Partner profile photo: ensure column, storage bucket (public, 5MB, image types), and RLS

ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS photo_url TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profiles',
  'profiles',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read for public bucket objects
DROP POLICY IF EXISTS "profiles_public_read" ON storage.objects;
CREATE POLICY "profiles_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'profiles');

DROP POLICY IF EXISTS "profiles_insert_own_folder" ON storage.objects;
CREATE POLICY "profiles_insert_own_folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profiles'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "profiles_update_own_folder" ON storage.objects;
CREATE POLICY "profiles_update_own_folder" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profiles'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'profiles'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "profiles_delete_own_folder" ON storage.objects;
CREATE POLICY "profiles_delete_own_folder" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profiles'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
