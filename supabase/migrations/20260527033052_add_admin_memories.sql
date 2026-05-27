-- Migration: add_admin_memories
-- Key-value store untuk preferensi admin lintas sesi

CREATE TABLE undangan.admin_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sekolah_id UUID NOT NULL REFERENCES undangan.sekolah(id) ON DELETE CASCADE,
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (admin_id, sekolah_id, key)
);

CREATE INDEX idx_admin_memories_admin ON undangan.admin_memories(admin_id);
CREATE INDEX idx_admin_memories_sekolah ON undangan.admin_memories(sekolah_id);

ALTER TABLE undangan.admin_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_select_own_memories ON undangan.admin_memories
  FOR SELECT
  TO authenticated
  USING (admin_id = auth.uid() AND sekolah_id = undangan.get_user_sekolah_id());

CREATE POLICY admin_insert_own_memories ON undangan.admin_memories
  FOR INSERT
  TO authenticated
  WITH CHECK (admin_id = auth.uid() AND sekolah_id = undangan.get_user_sekolah_id());

CREATE POLICY admin_update_own_memories ON undangan.admin_memories
  FOR UPDATE
  TO authenticated
  USING (admin_id = auth.uid() AND sekolah_id = undangan.get_user_sekolah_id())
  WITH CHECK (admin_id = auth.uid() AND sekolah_id = undangan.get_user_sekolah_id());

CREATE POLICY admin_delete_own_memories ON undangan.admin_memories
  FOR DELETE
  TO authenticated
  USING (admin_id = auth.uid() AND sekolah_id = undangan.get_user_sekolah_id());
