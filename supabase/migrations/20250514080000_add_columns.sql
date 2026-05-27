-- Add new columns to tamu table
ALTER TABLE undangan.tamu 
ADD COLUMN IF NOT EXISTS nama_ayah TEXT,
ADD COLUMN IF NOT EXISTS nama_ibu TEXT,
ADD COLUMN IF NOT EXISTS no_wa_ayah TEXT,
ADD COLUMN IF NOT EXISTS no_wa_ibu TEXT,
ADD COLUMN IF NOT EXISTS jenis_kelamin TEXT CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan'));