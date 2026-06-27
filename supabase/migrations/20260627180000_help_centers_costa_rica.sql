-- Centros de acopio en Costa Rica para ayuda a Venezuela (junio 2026)

INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, schedule, accepts, image_url, image_urls, is_verified, is_active
)
SELECT
  'Empanadas Doña Bárbara — Santa Ana',
  'Centro de acopio verificado en Santa Ana, Costa Rica, para recolectar donaciones destinadas a familias afectadas por el terremoto en Venezuela. Confirmar horario y necesidades antes de acudir.',
  'community',
  'San José',
  'Santa Ana',
  'Calle 1, 75 m al noreste de la Iglesia Católica de Santa Ana, Santa Ana, San José, Costa Rica',
  9.932611,
  -84.182778,
  NULL,
  'Por confirmar',
  ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
  NULL,
  ARRAY[]::text[],
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers WHERE name = 'Empanadas Doña Bárbara — Santa Ana'
);

INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, schedule, accepts, image_url, image_urls, is_verified, is_active
)
SELECT
  'Totoro Sushi — San Antonio de Belén',
  'Centro de acopio verificado en San Antonio de Belén (Heredia), Costa Rica. Reciben mantas, cobijas, agua embotellada, productos de higiene y otros insumos para familias afectadas en Venezuela.',
  'community',
  'Heredia',
  'San Antonio de Belén',
  'Costado sur de la Plaza de Deportes de La Ribera, San Antonio de Belén, Heredia, Costa Rica',
  9.9972,
  -84.1875,
  NULL,
  'Por confirmar',
  ARRAY['water', 'food', 'hygiene', 'blankets', 'clothing'],
  NULL,
  ARRAY[]::text[],
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers WHERE name = 'Totoro Sushi — San Antonio de Belén'
);

INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, schedule, accepts, image_url, image_urls, is_verified, is_active
)
SELECT
  'Universidad San Marcos — Sede Central',
  'Sede central de la Universidad San Marcos en San José, Costa Rica, habilitada como punto de acopio verificado para donaciones humanitarias hacia Venezuela.',
  'university',
  'San José',
  'San José',
  '100 m este del Parque Morazán, Avenida 3, Calle 11, San José, Costa Rica',
  9.9358,
  -84.0712,
  '+506 4000-8726',
  'Por confirmar',
  ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
  NULL,
  ARRAY[]::text[],
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers WHERE name = 'Universidad San Marcos — Sede Central'
);

UPDATE help_centers SET
  description = 'Centro de acopio verificado en Santa Ana, Costa Rica, para recolectar donaciones destinadas a familias afectadas por el terremoto en Venezuela. Confirmar horario y necesidades antes de acudir.',
  type = 'community', state = 'San José', city = 'Santa Ana',
  address = 'Calle 1, 75 m al noreste de la Iglesia Católica de Santa Ana, Santa Ana, San José, Costa Rica',
  latitude = 9.932611, longitude = -84.182778,
  schedule = 'Por confirmar',
  accepts = ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
  is_verified = true, is_active = true, updated_at = now()
WHERE name = 'Empanadas Doña Bárbara — Santa Ana';

UPDATE help_centers SET
  description = 'Centro de acopio verificado en San Antonio de Belén (Heredia), Costa Rica. Reciben mantas, cobijas, agua embotellada, productos de higiene y otros insumos para familias afectadas en Venezuela.',
  type = 'community', state = 'Heredia', city = 'San Antonio de Belén',
  address = 'Costado sur de la Plaza de Deportes de La Ribera, San Antonio de Belén, Heredia, Costa Rica',
  latitude = 9.9972, longitude = -84.1875,
  schedule = 'Por confirmar',
  accepts = ARRAY['water', 'food', 'hygiene', 'blankets', 'clothing'],
  is_verified = true, is_active = true, updated_at = now()
WHERE name = 'Totoro Sushi — San Antonio de Belén';

UPDATE help_centers SET
  description = 'Sede central de la Universidad San Marcos en San José, Costa Rica, habilitada como punto de acopio verificado para donaciones humanitarias hacia Venezuela.',
  type = 'university', state = 'San José', city = 'San José',
  address = '100 m este del Parque Morazán, Avenida 3, Calle 11, San José, Costa Rica',
  latitude = 9.9358, longitude = -84.0712,
  phone = '+506 4000-8726',
  schedule = 'Por confirmar',
  accepts = ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
  is_verified = true, is_active = true, updated_at = now()
WHERE name = 'Universidad San Marcos — Sede Central';
