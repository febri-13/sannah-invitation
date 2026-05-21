-- Add logo_url to sekolah for school logo display in invitation
ALTER TABLE sekolah ADD COLUMN IF NOT EXISTS logo_url TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_sekolah_logo_url ON sekolah(logo_url) WHERE logo_url != '';
