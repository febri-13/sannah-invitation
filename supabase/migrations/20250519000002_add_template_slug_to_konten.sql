ALTER TABLE konten_undangan
  ADD COLUMN IF NOT EXISTS template_slug VARCHAR(50) NOT NULL DEFAULT 'glass-premium';

CREATE INDEX IF NOT EXISTS idx_konten_template_slug ON konten_undangan(template_slug);
