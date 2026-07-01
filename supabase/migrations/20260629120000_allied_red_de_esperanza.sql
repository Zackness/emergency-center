-- Red de Esperanza: plataforma ciudadana (mapa de emergencias, desaparecidos, acopios, SOS)
INSERT INTO allied_platforms (domain, url, description_es, description_en, color, sort_order)
SELECT
  'red-de-esperanza-lime.vercel.app',
  'https://red-de-esperanza-lime.vercel.app/',
  'Red ciudadana: mapa de emergencias, reportar necesidades, SOS/rescate, centros de acopio y capa de personas desaparecidas con búsqueda por nombre.',
  'Citizen network: emergency map, report needs, SOS/rescue, collection centers and missing persons layer with name search.',
  'blue'::allied_platform_color,
  87
WHERE NOT EXISTS (
  SELECT 1 FROM allied_platforms WHERE lower(domain) = lower('red-de-esperanza-lime.vercel.app')
);

INSERT INTO external_sources (
  id,
  slug,
  name,
  description,
  url,
  registration_type,
  approximate_count,
  count_pending,
  count_located,
  last_updated_at,
  status,
  is_verified,
  is_active,
  sort_order
)
SELECT
  gen_random_uuid(),
  'red-de-esperanza',
  'Red de Esperanza',
  'Red ciudadana: mapa de emergencias, reportar necesidades, SOS/rescate, centros de acopio y capa de personas desaparecidas con búsqueda por nombre.',
  'https://red-de-esperanza-lime.vercel.app/',
  'community'::source_registration_type,
  NULL,
  NULL,
  NULL,
  now(),
  'active'::external_source_status,
  false,
  true,
  8
WHERE NOT EXISTS (
  SELECT 1 FROM external_sources WHERE lower(slug) = lower('red-de-esperanza')
);
