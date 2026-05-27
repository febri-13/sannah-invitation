-- Konten undangan: one row per sekolah
-- All invitation text/dates/agenda made editable by admin

CREATE TABLE undangan.konten_undangan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sekolah_id UUID REFERENCES undangan.sekolah(id) UNIQUE NOT NULL,
  judul TEXT NOT NULL DEFAULT 'Akhirusannah',
  subtitle TEXT NOT NULL DEFAULT 'Perpisahan Sekolah',
  bismillah TEXT NOT NULL DEFAULT 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم',
  hero_desc TEXT NOT NULL DEFAULT '',
  tanggal TEXT NOT NULL DEFAULT 'Sabtu, 21 Juni 2025',
  waktu TEXT NOT NULL DEFAULT 'Pukul 08.00 - 12.00 WIB',
  lokasi_nama TEXT NOT NULL DEFAULT 'MTsN 1 Kota',
  lokasi_alamat TEXT NOT NULL DEFAULT 'Jl. Pendidikan No. 123',
  link_youtube TEXT NOT NULL DEFAULT '',
  agenda JSONB NOT NULL DEFAULT '[]'::jsonb,
  header_arabic TEXT NOT NULL DEFAULT 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم',
  footer TEXT NOT NULL DEFAULT 'Akhirusannah. Semua hak dilindungi.',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_konten_undangan_sekolah_id ON undangan.konten_undangan(sekolah_id);

ALTER TABLE undangan.konten_undangan ENABLE ROW LEVEL SECURITY;

-- Public read (invitation page — no auth needed)
CREATE POLICY "Public read konten_undangan"
  ON undangan.konten_undangan FOR SELECT
  USING (true);

-- Seed default konten for every existing sekolah
INSERT INTO undangan.konten_undangan (sekolah_id, judul, subtitle, tanggal, waktu, lokasi_nama, lokasi_alamat, agenda)
SELECT
  id,
  'Akhirusannah',
  'Perpisahan Sekolah',
  'Sabtu, 21 Juni 2025',
  'Pukul 08.00 - 12.00 WIB',
  'MTsN 1 Kota',
  'Jl. Pendidikan No. 123',
  '[
    {"waktu": "08.00 - 08.30", "icon": "BookOpen", "judul": "Pembukaan & Doa"},
    {"waktu": "08.30 - 09.30", "icon": "Mic", "judul": "Laporan & Pidato"},
    {"waktu": "09.30 - 10.30", "icon": "Video", "judul": "Pemutaran Video Kenangan"},
    {"waktu": "10.30 - 11.30", "icon": "Camera", "judul": "Salam & Foto Bersama"},
    {"waktu": "11.30 - 12.00", "icon": "Star", "judul": "Penutupan"}
  ]'::jsonb
FROM undangan.sekolah
ON CONFLICT (sekolah_id) DO NOTHING;
