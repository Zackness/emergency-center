-- Salón de eventos Villa Europa — centro de acopio (viernes y sábado), Acarigua, Portuguesa

INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, schedule, accepts, image_url, image_urls, is_verified, is_active
)
SELECT
  'Salón de eventos Villa Europa',
  'Centro de acopio en el salón Festejos Europa (Villa Europa), Acarigua. Recibe donaciones para familias afectadas por el terremoto. Activo viernes y sábado; confirma horario y prioridades antes de acudir.',
  'community',
  'Portuguesa',
  'Acarigua',
  'Avenida 13 de Junio, Acarigua 3303, Portuguesa, Venezuela (Festejos Europa — Salón Villa Europa)',
  9.5538,
  -69.2089,
  NULL,
  'Viernes y sábado',
  ARRAY['water', 'food', 'medicine', 'clothing', 'hygiene', 'bathroom_supplies', 'blankets'],
  NULL,
  ARRAY[]::text[],
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers WHERE name = 'Salón de eventos Villa Europa'
);

UPDATE help_centers SET
  description = 'Centro de acopio en el salón Festejos Europa (Villa Europa), Acarigua. Recibe donaciones para familias afectadas por el terremoto. Activo viernes y sábado; confirma horario y prioridades antes de acudir.',
  type = 'community',
  state = 'Portuguesa',
  city = 'Acarigua',
  address = 'Avenida 13 de Junio, Acarigua 3303, Portuguesa, Venezuela (Festejos Europa — Salón Villa Europa)',
  latitude = 9.5538,
  longitude = -69.2089,
  schedule = 'Viernes y sábado',
  accepts = ARRAY['water', 'food', 'medicine', 'clothing', 'hygiene', 'bathroom_supplies', 'blankets'],
  is_verified = true,
  is_active = true,
  updated_at = now()
WHERE name = 'Salón de eventos Villa Europa';
