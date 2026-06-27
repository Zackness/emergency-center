-- Encuéntralos en plataformas aliadas (registro de desaparecidos)
INSERT INTO allied_platforms (domain, url, description_es, description_en, color, sort_order)
SELECT
  'encuentralos.tecnosoft.dev',
  'https://encuentralos.tecnosoft.dev/',
  'Reporta y busca personas desaparecidas tras el terremoto.',
  'Report and search for missing persons after the earthquake.',
  'yellow'::allied_platform_color,
  85
WHERE NOT EXISTS (
  SELECT 1 FROM allied_platforms WHERE lower(domain) = lower('encuentralos.tecnosoft.dev')
);
