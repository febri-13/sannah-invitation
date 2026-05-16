-- Add sekolah support: sekolah table, sekolah_id columns, indexes, RLS helper function

-- ── sekolah table ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sekolah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  alamat TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── sekolah_id on tamu ─────────────────────────────────────────────────────
ALTER TABLE tamu
  ADD COLUMN IF NOT EXISTS sekolah_id UUID REFERENCES sekolah(id);
CREATE INDEX IF NOT EXISTS idx_tamu_sekolah_id ON tamu(sekolah_id);

-- ── sekolah_id on pengaturan ───────────────────────────────────────────────
ALTER TABLE pengaturan
  ADD COLUMN IF NOT EXISTS sekolah_id UUID REFERENCES sekolah(id);
CREATE INDEX IF NOT EXISTS idx_pengaturan_sekolah_id ON pengaturan(sekolah_id);

-- ── sekolah_id on rsvp ─────────────────────────────────────────────────────
ALTER TABLE rsvp
  ADD COLUMN IF NOT EXISTS sekolah_id UUID REFERENCES sekolah(id);
CREATE INDEX IF NOT EXISTS idx_rsvp_sekolah_id ON rsvp(sekolah_id);

-- ── RLS helper: read sekolah_id from the JWT token ─────────────────────────
CREATE OR REPLACE FUNCTION get_user_sekolah_id()
RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    auth.jwt() ->> 'sekolah_id',
    NULL
  )::UUID;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
