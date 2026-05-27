-- Add sekolah support: sekolah table, sekolah_id columns, indexes, RLS helper function

-- ── sekolah table ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS undangan.sekolah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  alamat TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── sekolah_id on tamu ─────────────────────────────────────────────────────
ALTER TABLE undangan.tamu
  ADD COLUMN IF NOT EXISTS sekolah_id UUID REFERENCES undangan.sekolah(id);
CREATE INDEX IF NOT EXISTS idx_tamu_sekolah_id ON undangan.tamu(sekolah_id);

-- ── sekolah_id on pengaturan ───────────────────────────────────────────────
ALTER TABLE undangan.pengaturan
  ADD COLUMN IF NOT EXISTS sekolah_id UUID REFERENCES undangan.sekolah(id);
CREATE INDEX IF NOT EXISTS idx_pengaturan_sekolah_id ON undangan.pengaturan(sekolah_id);

-- ── sekolah_id on rsvp ─────────────────────────────────────────────────────
ALTER TABLE undangan.rsvp
  ADD COLUMN IF NOT EXISTS sekolah_id UUID REFERENCES undangan.sekolah(id);
CREATE INDEX IF NOT EXISTS idx_rsvp_sekolah_id ON undangan.rsvp(sekolah_id);

-- ── RLS helper: read sekolah_id from the JWT token ─────────────────────────
CREATE OR REPLACE FUNCTION undangan.get_user_sekolah_id()
RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    auth.jwt() ->> 'sekolah_id',
    NULL
  )::UUID;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
