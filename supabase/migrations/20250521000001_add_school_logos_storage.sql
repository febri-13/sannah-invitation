-- Create storage bucket for school logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('school-logos', 'school-logos', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Public read access for logos
CREATE POLICY "Public read access for school-logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'school-logos');
