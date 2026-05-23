-- Create storage bucket for school music
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('school-music', 'school-music', true, 10485760, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac'])
ON CONFLICT (id) DO NOTHING;

-- Public read access for music
CREATE POLICY "Public read access for school-music"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'school-music');
