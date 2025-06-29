-- Test Storage Setup
-- Run this in your Supabase SQL Editor to verify everything is working

-- 1. Check if the bucket exists
SELECT 
  id, 
  name, 
  public,
  created_at
FROM storage.buckets 
WHERE id = 'meal-images';

-- 2. Check storage policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
AND policyname LIKE '%meal images%';

-- 3. Test that you can query the storage objects table (should return empty result)
SELECT * FROM storage.objects WHERE bucket_id = 'meal-images' LIMIT 5;