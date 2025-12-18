-- Create storage bucket for alert images
INSERT INTO storage.buckets (id, name, public)
VALUES ('alert-images', 'alert-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to read images
CREATE POLICY "Anyone can view alert images"
ON storage.objects FOR SELECT
USING (bucket_id = 'alert-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload alert images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'alert-images');

-- Allow users to update their own images
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'alert-images');
