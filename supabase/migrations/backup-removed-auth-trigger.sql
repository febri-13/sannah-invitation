-- ═══════════════════════════════════════════════════════════════════
-- BACKUP: Trigger/Fungsi yang dihapus (27 Mei 2026)
-- Trigger ini dihapus karena mengacu ke tabel profiles (tidak ada)
-- dan menyebabkan error "Database error creating new user"
-- ═══════════════════════════════════════════════════════════════════

-- ── Fungsi yang dihapus ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'siswa');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Trigger yang dihapus ──────────────────────────────────────────
-- CREATE TRIGGER trg_on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION public.handle_new_user();
-- ═══════════════════════════════════════════════════════════════════
