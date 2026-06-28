-- Zana (App Zana): apoyo médico gratuito vía zanapronto.com durante la emergencia
INSERT INTO allied_platforms (domain, url, description_es, description_en, color, sort_order)
SELECT
  'zanapronto.com',
  'https://zanapronto.com/rescate',
  'App gratuita: mapa de ayuda, buscar medicinas y coordinar apoyo médico tras el terremoto.',
  'Free app: help map, find medicines and coordinate medical support after the earthquake.',
  'blue'::allied_platform_color,
  12
WHERE NOT EXISTS (
  SELECT 1 FROM allied_platforms WHERE lower(domain) = lower('zanapronto.com')
);
