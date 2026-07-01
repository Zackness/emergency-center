-- Yummy SOS: reportes de daños, sismos USGS y recursos de emergencia
INSERT INTO allied_platforms (domain, url, description_es, description_en, color, sort_order)
SELECT
  'sos.yummyrides.com',
  'https://sos.yummyrides.com',
  'Yummy SOS: reporta daños estructurales, consulta sismos en vivo (USGS), refugios y recursos de emergencia. Traslados y entregas gratuitas vía la red Yummy.',
  'Yummy SOS: report structural damage, view live earthquakes (USGS), shelters and emergency resources. Free transport and deliveries via the Yummy network.',
  'red'::allied_platform_color,
  23
WHERE NOT EXISTS (
  SELECT 1 FROM allied_platforms WHERE lower(domain) = lower('sos.yummyrides.com')
);

-- DonarSeguro (por si la migración anterior no se aplicó en producción)
INSERT INTO allied_platforms (domain, url, description_es, description_en, color, sort_order)
SELECT
  'donarseguro.com',
  'https://donarseguro.com',
  'Directorio que reúne organizaciones legítimas donde donar de forma segura al terremoto en Venezuela, con enlaces verificados.',
  'Directory that gathers legitimate organizations where you can donate safely to the Venezuela earthquake response, with verified links.',
  'yellow'::allied_platform_color,
  22
WHERE NOT EXISTS (
  SELECT 1 FROM allied_platforms WHERE lower(domain) = lower('donarseguro.com')
);
