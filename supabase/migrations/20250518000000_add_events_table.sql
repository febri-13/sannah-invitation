-- Multi-event support: events table + event_id on konten_undangan & tamu & rsvp

-- 1. Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sekolah_id UUID REFERENCES sekolah(id) NOT NULL,
  nama TEXT NOT NULL,
  slug TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (sekolah_id, slug)
);

-- 2. Seed default "Akhirusannah" event for every existing sekolah
INSERT INTO events (sekolah_id, nama, slug, is_active)
SELECT id, 'Akhirusannah', 'akhirusannah', true
FROM sekolah
ON CONFLICT (sekolah_id, slug) DO NOTHING;

-- 3. Add event_id to konten_undangan, backfill, make NOT NULL
ALTER TABLE konten_undangan ADD COLUMN event_id UUID REFERENCES events(id);

UPDATE konten_undangan SET event_id = e.id
FROM events e
WHERE e.sekolah_id = konten_undangan.sekolah_id AND e.slug = 'akhirusannah';

ALTER TABLE konten_undangan ALTER COLUMN event_id SET NOT NULL;

-- 4. Drop old sekolah_id constraints/indexes, add UNIQUE on event_id
DROP INDEX IF EXISTS idx_konten_undangan_sekolah_id;
ALTER TABLE konten_undangan DROP CONSTRAINT IF EXISTS konten_undangan_sekolah_id_key;
ALTER TABLE konten_undangan ADD UNIQUE (event_id);

-- 5. Add event_id to tamu (nullable — old orphan records may lack sekolah_id)
ALTER TABLE tamu ADD COLUMN event_id UUID REFERENCES events(id);

UPDATE tamu SET event_id = e.id
FROM events e
WHERE e.sekolah_id = tamu.sekolah_id AND e.slug = 'akhirusannah';

CREATE INDEX IF NOT EXISTS idx_tamu_event_id ON tamu(event_id);

-- 6. Add event_id to rsvp (nullable — may reference orphan tamu)
ALTER TABLE rsvp ADD COLUMN event_id UUID REFERENCES events(id);

UPDATE rsvp SET event_id = t.event_id
FROM tamu t
WHERE t.id = rsvp.tamu_id;

CREATE INDEX IF NOT EXISTS idx_rsvp_event_id ON rsvp(event_id);

-- 7. RLS for events table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read events"
  ON events FOR SELECT
  USING (true);
