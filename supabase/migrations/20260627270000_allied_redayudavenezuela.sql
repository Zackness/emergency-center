-- Red Ayuda Venezuela: plataforma ciudadana de emergencia (desaparecidos, puntos de ayuda, asistente)
INSERT INTO allied_platforms (domain, url, description_es, description_en, color, sort_order)
SELECT
  'redayudavenezuela.com',
  'https://redayudavenezuela.com',
  'Red de emergencia ciudadana: buscar personas por nombre o foto, puntos de ayuda, hospitales, réplicas USGS y guía comunitaria.',
  'Citizen emergency network: search people by name or photo, help points, hospitals, USGS aftershocks and community guide.',
  'red'::allied_platform_color,
  5
WHERE NOT EXISTS (
  SELECT 1 FROM allied_platforms WHERE lower(domain) = lower('redayudavenezuela.com')
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
  'red-ayuda-venezuela',
  'Red Ayuda Venezuela',
  'Plataforma ciudadana integral: desaparecidos, personas a salvo, en hospitales, puntos de ayuda, voluntarios y asistente de búsqueda por nombre o foto.',
  'https://redayudavenezuela.com',
  'community'::source_registration_type,
  110364,
  110364,
  9940,
  '2026-06-28T00:56:10Z'::timestamptz,
  'active'::external_source_status,
  false,
  true,
  7
WHERE NOT EXISTS (
  SELECT 1 FROM external_sources WHERE lower(slug) = lower('red-ayuda-venezuela')
);
