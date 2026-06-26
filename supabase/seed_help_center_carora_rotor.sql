-- Centro de acopio y punto logístico: Plaza El Rotor, Carora
INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, schedule, accepts, image_url, image_urls, is_verified, is_active
)
SELECT
  'Centro de acopio Carora — Plaza El Rotor',
  'Centro de acopio y punto logístico en Plaza El Rotor, Carora. Hay más carros disponibles para trasladar donaciones hacia Caracas.',
  'community',
  'Lara',
  'Carora',
  'Plaza El Rotor, Carora',
  10.1764,
  -70.0817,
  NULL,
  'Por confirmar',
  ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
  '/images/help-centers/carora-plaza-el-rotor-caracas.png',
  ARRAY['/images/help-centers/carora-plaza-el-rotor-caracas.png'],
  false,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers
  WHERE name = 'Centro de acopio Carora — Plaza El Rotor'
    AND city = 'Carora'
);
