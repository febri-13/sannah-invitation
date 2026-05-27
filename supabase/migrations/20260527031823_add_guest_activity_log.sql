-- Migration: add_guest_activity_log
-- Tracks guest interactions with the invitation

CREATE TABLE guest_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tamu_id UUID NOT NULL REFERENCES tamu(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_activity_tamu ON guest_activity_log(tamu_id);
CREATE INDEX idx_activity_event ON guest_activity_log(event_id);
CREATE INDEX idx_activity_type ON guest_activity_log(activity_type);
CREATE INDEX idx_activity_created ON guest_activity_log(created_at DESC);

ALTER TABLE guest_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_select_activity ON guest_activity_log
  FOR SELECT
  TO authenticated
  USING (
    event_id IN (
      SELECT id FROM events WHERE sekolah_id = get_user_sekolah_id()
    )
  );

CREATE POLICY admin_insert_activity ON guest_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    event_id IN (
      SELECT id FROM events WHERE sekolah_id = get_user_sekolah_id()
    )
  );
