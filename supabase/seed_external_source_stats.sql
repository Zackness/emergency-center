-- Actualizar cifras por plataforma (extraídas de cada sitio, 25-26 jun 2026)
-- Ejecutar tras 20260626000000_external_source_stats.sql

UPDATE external_sources SET
  approximate_count = NULL,
  count_pending = NULL,
  count_located = NULL,
  last_updated_at = '2026-06-25T12:00:00Z'
WHERE slug = 'venapp';

UPDATE external_sources SET
  approximate_count = 40511,
  count_pending = 37371,
  count_located = 3140,
  last_updated_at = '2026-06-25T18:00:00Z'
WHERE slug = 'desaparecidos-terremoto';

UPDATE external_sources SET
  approximate_count = 27249,
  count_pending = 22553,
  count_located = 4696,
  last_updated_at = '2026-06-26T03:53:00Z'
WHERE slug = 'venezuela-te-busca';

UPDATE external_sources SET
  approximate_count = 0,
  count_pending = 0,
  count_located = 0,
  last_updated_at = '2026-06-26T04:21:00Z'
WHERE slug = 'encuentralos';

-- HuellasCAN es para mascotas, no personas
DELETE FROM external_sources WHERE slug = 'huellascan';

-- Mover enlace de HuellasCAN a categoría mascotas
UPDATE external_links SET
  category = 'pets',
  description = 'Plataforma comunitaria de registro y búsqueda de mascotas perdidas tras el terremoto',
  sort_order = 1
WHERE url = 'https://www.huellascan.com/terremoto';
