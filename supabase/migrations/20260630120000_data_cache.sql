-- Caché genérica para datos scrapeados (mascotas, niños, vzlayuda, redayuda, etc.)
CREATE TABLE IF NOT EXISTS data_cache (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       TEXT NOT NULL UNIQUE,
  payload    JSONB NOT NULL DEFAULT '{}',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS data_cache_slug_idx ON data_cache (slug);

ALTER TABLE data_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read data_cache"
  ON data_cache FOR SELECT
  USING (true);

-- Escritura solo vía service role / Prisma (sin política INSERT pública)
