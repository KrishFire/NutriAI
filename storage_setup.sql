-- Storage Setup for NutriAI
-- Run this in your Supabase SQL Editor

-- Create the meal-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('meal-images', 'meal-images', true)
ON CONFLICT (id) DO NOTHING;

-- Clear any existing policies for this bucket
DROP POLICY IF EXISTS "Authenticated users can upload meal images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view meal images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own meal images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own meal images" ON storage.objects;

-- Policy 1: Allow authenticated users to upload images
-- Images will be stored in user-specific folders: user_id/filename
CREATE POLICY "Authenticated users can upload meal images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'meal-images' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow users to view their own meal images and publicly shared ones
CREATE POLICY "Users can view meal images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'meal-images' AND (
    auth.role() = 'authenticated' OR
    (storage.foldername(name))[1] = auth.uid()::text
  )
);

-- Policy 3: Allow users to update their own meal images
CREATE POLICY "Users can update their own meal images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'meal-images' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Allow users to delete their own meal images
CREATE POLICY "Users can delete their own meal images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'meal-images' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Verify the bucket was created
SELECT * FROM storage.buckets WHERE id = 'meal-images';