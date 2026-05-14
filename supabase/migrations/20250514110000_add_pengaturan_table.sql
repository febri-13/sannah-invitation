-- Settings table for global application configuration
-- Allows admin to customize templates and app-wide settings

CREATE TABLE IF NOT EXISTS pengaturan (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT NOT NULL,
  label VARCHAR(100) NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Index for fast lookup by key
CREATE INDEX IF NOT EXISTS idx_pengaturan_key ON pengaturan(key);

-- Row Level Security (RLS)
ALTER TABLE pengaturan ENABLE ROW LEVEL SECURITY;

-- Allow public read (anyone can read settings)
DROP POLICY IF EXISTS "Public read pengaturan" ON pengaturan;
CREATE POLICY "Public read pengaturan" ON pengaturan FOR SELECT USING (true);

-- Allow service role to insert/update/delete (admin only via service role key)
-- No RLS policy needed for service role — bypasses RLS automatically

-- Seed default WhatsApp invitation template
INSERT INTO pengaturan (key, value, label, description) VALUES
(
  'wa_template_invitation',
  'Assalamu''alaikum Wr. Wb.\n\nBapak/Ibu {namaOrtu},\n\nDengan hormat, kami mengundang Anda untuk menghadiri acara perpisahan sekolah Akhirusannah untuk Ananda {namaSiswa}.\n\n📅 Tanggal: {tanggalAcara}\n🕐 Waktu: {waktuAcara}\n📍 Lokasi: {lokasiAcara}\n\nSilakan klik link berikut untuk melihat undangan lengkap:\n{link}\n\nKami tunggu kehadiran Anda.\n\nWassalamu''alaikum Wr. Wb.',
  'Template Pesan Undangan WhatsApp',
  'Pesan default untuk undangan WhatsApp. Placeholders: {namaOrtu}, {namaSiswa}, {tanggalAcara}, {waktuAcara}, {lokasiAcara}, {link}'
) ON CONFLICT (key) DO NOTHING;
