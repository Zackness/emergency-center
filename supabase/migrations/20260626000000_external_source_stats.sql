-- Desglose de cifras por plataforma (reportados / por localizar / localizados)
ALTER TABLE external_sources
  ADD COLUMN IF NOT EXISTS count_pending INTEGER,
  ADD COLUMN IF NOT EXISTS count_located INTEGER;
