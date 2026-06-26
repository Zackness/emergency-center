-- Redes sociales alternativas cuando sitios web están caídos
ALTER TABLE agencies
  ADD COLUMN IF NOT EXISTS social_links JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE hospitals
  ADD COLUMN IF NOT EXISTS social_links JSONB NOT NULL DEFAULT '[]'::jsonb;
