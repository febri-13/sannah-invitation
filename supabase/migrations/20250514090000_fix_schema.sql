-- Make nama_ortu nullable and keep new columns
ALTER TABLE tamu 
ALTER COLUMN nama_ortu DROP NOT NULL,
ALTER COLUMN nama_ortu SET DEFAULT NULL;