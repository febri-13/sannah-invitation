-- Add event_id column to pengaturan for per-event settings (e.g., WA template)
ALTER TABLE undangan.pengaturan ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES undangan.events(id);

CREATE INDEX IF NOT EXISTS idx_pengaturan_event_id ON undangan.pengaturan(event_id);

-- Drop the single-column PK on (key) since the same key can exist per sekolah+event
ALTER TABLE undangan.pengaturan DROP CONSTRAINT IF EXISTS pengaturan_pkey CASCADE;

-- Backfill existing rows: associate with sekolah's first event (best effort)
UPDATE undangan.pengaturan p
SET event_id = (
  SELECT e.id FROM undangan.events e
  WHERE e.sekolah_id = p.sekolah_id
  ORDER BY e.created_at ASC
  LIMIT 1
)
WHERE p.event_id IS NULL AND p.sekolah_id IS NOT NULL;

-- Remove orphaned rows without sekolah_id (e.g., seed data from before sekolah table)
DELETE FROM undangan.pengaturan WHERE sekolah_id IS NULL;

-- Create a composite PK covering sekolah, key, and event for data integrity
ALTER TABLE undangan.pengaturan ADD PRIMARY KEY (sekolah_id, key, event_id);

-- Drop redundant index (now covered by PK)
DROP INDEX IF EXISTS idx_pengaturan_sekolah_id;
