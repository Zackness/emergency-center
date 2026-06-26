-- Hospitales en Venezuela — búsqueda de familiares ingresados en hospitales
INSERT INTO external_links (title, description, url, category, locale, is_verified, is_active, sort_order)
SELECT
  'Hospitales en Venezuela',
  'Plataforma comunitaria que digitaliza listas de personas ingresadas en hospitales y centros de salud. Busca por nombre completo o cédula.',
  'https://hospitalesenvenezuela.com',
  'official',
  'both',
  false,
  true,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM external_links WHERE url = 'https://hospitalesenvenezuela.com' AND is_active = true
);
