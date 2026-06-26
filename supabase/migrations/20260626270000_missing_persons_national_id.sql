-- Cédula de identidad para deduplicación del registro unificado de desaparecidos

ALTER TABLE missing_persons
  ADD COLUMN IF NOT EXISTS national_id TEXT;

CREATE INDEX IF NOT EXISTS idx_missing_persons_national_id
  ON missing_persons (national_id)
  WHERE national_id IS NOT NULL;
