-- Migration: add_guest_memories
-- Key-value store untuk preferensi dan data persist per tamu

CREATE TABLE undangan.guest_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tamu_id UUID NOT NULL REFERENCES undangan.tamu(id) ON DELETE CASCADE,
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tamu_id, key)
);

CREATE INDEX idx_memories_tamu ON undangan.guest_memories(tamu_id);

ALTER TABLE undangan.guest_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_select_memories ON undangan.guest_memories
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM undangan.tamu t
      JOIN undangan.events e ON e.id = t.event_id
      WHERE t.id = tamu_id
      AND e.sekolah_id = undangan.get_user_sekolah_id()
    )
  );

CREATE POLICY admin_insert_memories ON undangan.guest_memories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM undangan.tamu t
      JOIN undangan.events e ON e.id = t.event_id
      WHERE t.id = tamu_id
      AND e.sekolah_id = undangan.get_user_sekolah_id()
    )
  );

CREATE POLICY admin_update_memories ON undangan.guest_memories
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM undangan.tamu t
      JOIN undangan.events e ON e.id = t.event_id
      WHERE t.id = tamu_id
      AND e.sekolah_id = undangan.get_user_sekolah_id()
    )
  );
