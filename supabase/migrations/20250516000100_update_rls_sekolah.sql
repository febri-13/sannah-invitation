-- RLS policies: enforce sekolah-scoped access for tamu, rsvp, and pengaturan
-- Service role (key) bypasses RLS automatically — no policy changes needed there.

-- ── tamu ───────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Service read tamu" ON tamu;
CREATE POLICY "Admin read own sekolah tamu"
  ON tamu FOR SELECT
  USING (
    get_user_sekolah_id() IS NULL
    OR sekolah_id = get_user_sekolah_id()
  );

DROP POLICY IF EXISTS "Service insert tamu" ON tamu;
CREATE POLICY "Admin insert own sekolah tamu"
  ON tamu FOR INSERT
  WITH CHECK (
    sekolah_id = get_user_sekolah_id()
  );

DROP POLICY IF EXISTS "Service update tamu" ON tamu;
CREATE POLICY "Admin update own sekolah tamu"
  ON tamu FOR UPDATE
  USING (
    sekolah_id = get_user_sekolah_id()
  );

DROP POLICY IF EXISTS "Service delete tamu" ON tamu;
CREATE POLICY "Admin delete own sekolah tamu"
  ON tamu FOR DELETE
  USING (
    sekolah_id = get_user_sekolah_id()
  );

-- ── rsvp ───────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read rsvp" ON rsvp;
CREATE POLICY "Admin read own sekolah rsvp"
  ON rsvp FOR SELECT
  USING (
    get_user_sekolah_id() IS NULL
    OR sekolah_id = get_user_sekolah_id()
  );

DROP POLICY IF EXISTS "Public insert rsvp" ON rsvp;
CREATE POLICY "Public insert rsvp" ON rsvp FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service update rsvp" ON rsvp;
CREATE POLICY "Admin update own sekolah rsvp"
  ON rsvp FOR UPDATE
  USING (
    sekolah_id = get_user_sekolah_id()
  );

DROP POLICY IF EXISTS "Service delete rsvp" ON rsvp;
CREATE POLICY "Admin delete own sekolah rsvp"
  ON rsvp FOR DELETE
  USING (
    sekolah_id = get_user_sekolah_id()
  );

-- ── pengaturan ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read pengaturan" ON pengaturan;
CREATE POLICY "Public read own sekolah pengaturan"
  ON pengaturan FOR SELECT
  USING (
    get_user_sekolah_id() IS NULL
    OR sekolah_id = get_user_sekolah_id()
  );

-- Service role still has full INSERT/UPDATE/DELETE via RLS bypass — no policy needed.
