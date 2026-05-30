-- Add editable footer label columns to konten_undangan
ALTER TABLE undangan.konten_undangan
  ADD COLUMN footer_hormat_label TEXT NOT NULL DEFAULT 'HORMAT KAMI,',
  ADD COLUMN footer_keluarga_label TEXT NOT NULL DEFAULT 'Keluarga Besar';
