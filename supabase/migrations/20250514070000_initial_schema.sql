-- Initial schema for sannah-invitation
-- Tables: tamu, rsvp, checkin

-- Table tamu
CREATE TABLE IF NOT EXISTS tamu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  nama_ortu TEXT NOT NULL,
  nama_siswa TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table rsvp
CREATE TABLE IF NOT EXISTS rsvp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tamu_id UUID REFERENCES tamu(id) ON DELETE CASCADE,
  kehadiran TEXT NOT NULL CHECK (kehadiran IN ('Hadir', 'Tidak Hadir')),
  jumlah SMALLINT NOT NULL DEFAULT 1 CHECK (jumlah BETWEEN 1 AND 10),
  pesan TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table checkin
CREATE TABLE IF NOT EXISTS checkin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tamu_id UUID REFERENCES tamu(id) ON DELETE CASCADE,
  waktu TIMESTAMPTZ DEFAULT now(),
  scanned_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE tamu ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tamu
DROP POLICY IF EXISTS "Public read tamu" ON tamu;
CREATE POLICY "Public read tamu" ON tamu FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service insert tamu" ON tamu;
CREATE POLICY "Service insert tamu" ON tamu FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service update tamu" ON tamu;
CREATE POLICY "Service update tamu" ON tamu FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Service delete tamu" ON tamu;
CREATE POLICY "Service delete tamu" ON tamu FOR DELETE USING (true);

-- RLS Policies for rsvp
DROP POLICY IF EXISTS "Public read rsvp" ON rsvp;
CREATE POLICY "Public read rsvp" ON rsvp FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert rsvp" ON rsvp;
CREATE POLICY "Public insert rsvp" ON rsvp FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service update rsvp" ON rsvp;
CREATE POLICY "Service update rsvp" ON rsvp FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Service delete rsvp" ON rsvp;
CREATE POLICY "Service delete rsvp" ON rsvp FOR DELETE USING (true);

-- RLS Policies for checkin
DROP POLICY IF EXISTS "Service read checkin" ON checkin;
CREATE POLICY "Service read checkin" ON checkin FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service insert checkin" ON checkin;
CREATE POLICY "Service insert checkin" ON checkin FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service delete checkin" ON checkin;
CREATE POLICY "Service delete checkin" ON checkin FOR DELETE USING (true);