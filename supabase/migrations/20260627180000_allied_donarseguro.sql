-- DonarSeguro: directorio de organizaciones legítimas para donar al terremoto
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
