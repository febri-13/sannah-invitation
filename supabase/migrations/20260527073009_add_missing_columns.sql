-- Add columns that were added manually in the old database
-- but never captured in migration files

ALTER TABLE undangan.tamu
  ADD COLUMN IF NOT EXISTS kelas VARCHAR(50);

ALTER TABLE undangan.konten_undangan
  ADD COLUMN IF NOT EXISTS lokasi_maps TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS music_auto_play BOOLEAN NOT NULL DEFAULT false;