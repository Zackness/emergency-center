-- Campo opcional para foto de centros de acopio
ALTER TABLE help_centers ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE help_centers ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}';

-- Centro de acopio frente al Sambil, Chacao (ver seed_help_center_emergencia_venezuela.sql para datos actualizados)
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
  'Centro de Acopio Emergencia Venezuela — Sambil',
  '¡Ayuda a tu país, Venezuela! Punto de recepción en el C.C. Sambil.',
  'community',
  'Miranda',
  'Chacao',
  'Centro Comercial Sambil — Calle Los Apamates, salida hacia la Panadería del Este, Chacao',
  10.4953,
  -66.8536,
  'Por confirmar',
  ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
  '/images/help-centers/centro-acopio-emergencia-venezuela.png',
  ARRAY[
    '/images/help-centers/centro-acopio-emergencia-venezuela.png',
    '/images/help-centers/centro-acopio-sambil.png'
  ],
  true,
  true
);
