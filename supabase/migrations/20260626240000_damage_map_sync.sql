-- Campos para sincronizar edificios desde fuentes externas (terremotovenezuela.com)

ALTER TABLE damage_reports
  ADD COLUMN IF NOT EXISTS external_reference TEXT,
  ADD COLUMN IF NOT EXISTS external_source TEXT,
  ADD COLUMN IF NOT EXISTS zone TEXT,
  ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS source_synced_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_damage_reports_external_ref
  ON damage_reports (external_source, external_reference)
  WHERE external_reference IS NOT NULL;
