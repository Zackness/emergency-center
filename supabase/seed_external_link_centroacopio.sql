-- Enlace externo: Centros de Acopio Venezuela (centroacopio.site)
INSERT INTO external_links (
  id,
  title,
  description,
  url,
  category,
  locale,
  is_verified,
  is_active,
  sort_order,
  created_at
)
VALUES (
  '8',
  'Centros de Acopio Venezuela',
  'Plataforma ciudadana para registrar y consultar centros de acopio, puntos de ayuda y voluntarios de delivery gratuito en zonas afectadas.',
  'https://centroacopio.site/',
  'official',
  'both',
  false,
  true,
  2,
  '2026-06-26T16:00:00Z'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  url = EXCLUDED.url,
  category = EXCLUDED.category,
  locale = EXCLUDED.locale,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;
