-- Initial schema for sannah-invitation
-- Schema: undangan, Tables: tamu, rsvp, checkin

CREATE SCHEMA IF NOT EXISTS undangan;

-- Table tamu
CREATE TABLE IF NOT EXISTS undangan.tamu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  nama_ortu TEXT NOT NULL,
  nama_siswa TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table rsvp
CREATE TABLE IF NOT EXISTS undangan.rsvp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tamu_id UUID REFERENCES undangan.tamu(id) ON DELETE CASCADE,
  kehadiran TEXT NOT NULL CHECK (kehadiran IN ('Hadir', 'Tidak Hadir')),
  jumlah SMALLINT NOT NULL DEFAULT 1 CHECK (jumlah BETWEEN 1 AND 10),
  pesan TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table checkin
CREATE TABLE IF NOT EXISTS undangan.checkin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tamu_id UUID REFERENCES undangan.tamu(id) ON DELETE CASCADE,
  waktu TIMESTAMPTZ DEFAULT now(),
  scanned_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE undangan.tamu ENABLE ROW LEVEL SECURITY;
ALTER TABLE undangan.rsvp ENABLE ROW LEVEL SECURITY;
ALTER TABLE undangan.checkin ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tamu
DROP POLICY IF EXISTS "Public read tamu" ON undangan.tamu;
CREATE POLICY "Public read tamu" ON undangan.tamu FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service insert tamu" ON undangan.tamu;
CREATE POLICY "Service insert tamu" ON undangan.tamu FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service update tamu" ON undangan.tamu;
CREATE POLICY "Service update tamu" ON undangan.tamu FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Service delete tamu" ON undangan.tamu;
CREATE POLICY "Service delete tamu" ON undangan.tamu FOR DELETE USING (true);

-- RLS Policies for rsvp
DROP POLICY IF EXISTS "Public read rsvp" ON undangan.rsvp;
CREATE POLICY "Public read rsvp" ON undangan.rsvp FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert rsvp" ON undangan.rsvp;
CREATE POLICY "Public insert rsvp" ON undangan.rsvp FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service update rsvp" ON undangan.rsvp;
CREATE POLICY "Service update rsvp" ON undangan.rsvp FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Service delete rsvp" ON undangan.rsvp;
CREATE POLICY "Service delete rsvp" ON undangan.rsvp FOR DELETE USING (true);

-- RLS Policies for checkin
DROP POLICY IF EXISTS "Service read checkin" ON undangan.checkin;
CREATE POLICY "Service read checkin" ON undangan.checkin FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service insert checkin" ON undangan.checkin;
CREATE POLICY "Service insert checkin" ON undangan.checkin FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service delete checkin" ON undangan.checkin;
CREATE POLICY "Service delete checkin" ON undangan.checkin FOR DELETE USING (true);