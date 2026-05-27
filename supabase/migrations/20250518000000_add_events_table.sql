-- Multi-event support: events table + event_id on konten_undangan & tamu & rsvp

-- 1. Create events table
CREATE TABLE undangan.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sekolah_id UUID REFERENCES undangan.sekolah(id) NOT NULL,
  nama TEXT NOT NULL,
  slug TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (sekolah_id, slug)
);

-- 2. Seed default "Akhirusannah" event for every existing sekolah
INSERT INTO undangan.events (sekolah_id, nama, slug, is_active)
SELECT id, 'Akhirusannah', 'akhirusannah', true
FROM undangan.sekolah
ON CONFLICT (sekolah_id, slug) DO NOTHING;

-- 3. Add event_id to konten_undangan, backfill, make NOT NULL
ALTER TABLE undangan.konten_undangan ADD COLUMN event_id UUID REFERENCES undangan.events(id);

UPDATE undangan.konten_undangan SET event_id = e.id
FROM undangan.events e
WHERE e.sekolah_id = konten_undangan.sekolah_id AND e.slug = 'akhirusannah';

ALTER TABLE undangan.konten_undangan ALTER COLUMN event_id SET NOT NULL;

-- 4. Drop old sekolah_id constraints/indexes, add UNIQUE on event_id
DROP INDEX IF EXISTS idx_konten_undangan_sekolah_id;
ALTER TABLE undangan.konten_undangan DROP CONSTRAINT IF EXISTS konten_undangan_sekolah_id_key;
ALTER TABLE undangan.konten_undangan ADD UNIQUE (event_id);

-- 5. Add event_id to tamu (nullable — old orphan records may lack sekolah_id)
ALTER TABLE undangan.tamu ADD COLUMN event_id UUID REFERENCES undangan.events(id);

UPDATE undangan.tamu SET event_id = e.id
FROM undangan.events e
WHERE e.sekolah_id = tamu.sekolah_id AND e.slug = 'akhirusannah';

CREATE INDEX IF NOT EXISTS idx_tamu_event_id ON undangan.tamu(event_id);

-- 6. Add event_id to rsvp (nullable — may reference orphan tamu)
ALTER TABLE undangan.rsvp ADD COLUMN event_id UUID REFERENCES undangan.events(id);

UPDATE undangan.rsvp SET event_id = t.event_id
FROM undangan.tamu t
WHERE t.id = rsvp.tamu_id;

CREATE INDEX IF NOT EXISTS idx_rsvp_event_id ON undangan.rsvp(event_id);

-- 7. RLS for events table
ALTER TABLE undangan.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read events"
  ON undangan.events FOR SELECT
  USING (true);
