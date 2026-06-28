-- Niños de Pie (busca.nexosignal.co): directorio de niños rescatados sin familia
INSERT INTO allied_platforms (domain, url, description_es, description_en, color, sort_order)
SELECT
  'busca.nexosignal.co',
  'https://busca.nexosignal.co',
  'Niños de Pie: busca y reporta niños rescatados sin familia. Directorio con foto, hospital y estado de salud para reunirlos con sus familias.',
  'Niños de Pie: search and report rescued children without family. Directory with photo, hospital and health status to reunite them with their families.',
  'red'::allied_platform_color,
  6
WHERE NOT EXISTS (
  SELECT 1 FROM allied_platforms WHERE lower(domain) = lower('busca.nexosignal.co')
);
