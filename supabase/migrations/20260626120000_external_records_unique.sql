-- Evita duplicar el mismo registro externo al re-sincronizar
CREATE UNIQUE INDEX IF NOT EXISTS idx_external_records_source_ref
  ON external_records (source_id, external_reference)
  WHERE external_reference IS NOT NULL;
