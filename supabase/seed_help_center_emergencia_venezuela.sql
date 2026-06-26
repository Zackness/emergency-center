-- Galería de fotos y centros Emergencia Venezuela
ALTER TABLE help_centers ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE help_centers ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}';

-- Actualizar Sambil si ya existe el registro anterior
UPDATE help_centers
SET
  name = 'Centro de Acopio Emergencia Venezuela — Sambil',
  description = '¡Ayuda a tu país, Venezuela! Punto de recepción en el C.C. Sambil. Reciben: alimentos no perecederos, agua, higiene, primeros auxilios, ropa y colchonetas.',
  address = 'Centro Comercial Sambil — Calle Los Apamates, salida hacia la Panadería del Este, Chacao',
  accepts = ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
  image_url = '/images/help-centers/centro-acopio-emergencia-venezuela.png',
  image_urls = ARRAY[
    '/images/help-centers/centro-acopio-emergencia-venezuela.png',
    '/images/help-centers/centro-acopio-sambil.png'
  ],
  is_verified = true
WHERE name ILIKE '%Sambil%' AND city = 'Chacao';

-- Barquisimeto — Cancha Aquiles Machado
INSERT INTO help_centers (
  name,
  description,
  type,
  state,
  city,
  address,
  latitude,
  longitude,
  schedule,
  accepts,
  image_url,
  image_urls,
  is_verified,
  is_active
)
VALUES (
  'Centro de Acopio Emergencia Venezuela — Cancha Aquiles Machado',
  '¡Ayuda a tu país, Venezuela! Punto de recepción en Barquisimeto. Reciben: alimentos no perecederos, agua, higiene, primeros auxilios, ropa y colchonetas.',
  'community',
  'Lara',
  'Barquisimeto',
  'Urb. Sucre, Cancha Aquiles Machado, Barquisimeto',
  10.064686,
  -69.320389,
  'Por confirmar',
  ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
  '/images/help-centers/centro-acopio-emergencia-venezuela.png',
  ARRAY['/images/help-centers/centro-acopio-emergencia-venezuela.png'],
  true,
  true
)
ON CONFLICT DO NOTHING;
