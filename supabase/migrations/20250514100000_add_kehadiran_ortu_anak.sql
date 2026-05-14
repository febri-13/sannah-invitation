-- Add nullable kehadiran_ortu and kehadiran_anak columns to rsvp table
-- These columns store separate attendance status for parents and child
-- Existing rows will have NULL values, triggering legacy RSVP display in UI
ALTER TABLE rsvp
ADD COLUMN kehadiran_ortu VARCHAR(20) CHECK (kehadiran_ortu IN ('Offline', 'Online', 'Tidak Hadir')) DEFAULT NULL,
ADD COLUMN kehadiran_anak VARCHAR(20) CHECK (kehadiran_anak IN ('Offline', 'Online', 'Tidak Hadir')) DEFAULT NULL;

-- Relax jumlah constraint to allow 0 (when both choose Tidak Hadir)
ALTER TABLE rsvp DROP CONSTRAINT IF EXISTS rsvp_jumlah_check;
ALTER TABLE rsvp ADD CONSTRAINT rsvp_jumlah_check CHECK (jumlah >= 0 AND jumlah <= 10);

-- Add column comments for documentation
COMMENT ON COLUMN rsvp.kehadiran_ortu IS 'Kehadiran orang tua: Offline, Online, atau Tidak Hadir';
COMMENT ON COLUMN rsvp.kehadiran_anak IS 'Kehadiran anak: Offline, Online, atau Tidak Hadir';
