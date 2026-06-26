-- Centro de acopio: Plaza El Rotor, Carora (estudiantes UNEXPO Carora / Politécnico)
INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, schedule, accepts, image_url, image_urls, is_verified, is_active
)
SELECT
  'Centro de acopio Carora — Plaza El Rotor',
  'Centro de acopio en Plaza El Rotor, Carora, organizado por estudiantes UNEXPO Carora (Politécnico). Colecta de suministros médicos y medicinas: alcohol, gasas, vendas, suturas, jeringas, guantes, catéteres, soluciones y analgésicos básicos. Punto logístico con carros disponibles para trasladar donaciones hacia Caracas.',
  'community',
  'Lara',
  'Carora',
  'Plaza El Rotor, Carora',
  10.1764,
  -70.0817,
  NULL,
  'Por confirmar',
  ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
  '/images/help-centers/carora-plaza-rotor-unexpo-colecta.png',
  ARRAY['/images/help-centers/carora-plaza-rotor-unexpo-colecta.png'],
  false,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers
  WHERE name = 'Centro de acopio Carora — Plaza El Rotor'
    AND city = 'Carora'
);

-- Si ya existe, actualizar foto y descripción
UPDATE help_centers
SET
  description = 'Centro de acopio en Plaza El Rotor, Carora, organizado por estudiantes UNEXPO Carora (Politécnico). Colecta de suministros médicos y medicinas: alcohol, gasas, vendas, suturas, jeringas, guantes, catéteres, soluciones y analgésicos básicos. Punto logístico con carros disponibles para trasladar donaciones hacia Caracas.',
  image_url = '/images/help-centers/carora-plaza-rotor-unexpo-colecta.png',
  image_urls = ARRAY['/images/help-centers/carora-plaza-rotor-unexpo-colecta.png'],
  updated_at = NOW()
WHERE name = 'Centro de acopio Carora — Plaza El Rotor'
  AND city = 'Carora';
