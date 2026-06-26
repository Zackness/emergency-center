-- Will Store y Studio Gizah Rodríguez — Barrio Unión (Barquisimeto)
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
  'Will Store y Studio Gizah Rodríguez — Barrio Unión',
  '«¡No están solos!» Centro de acopio solidario de Will Store y Studio Gizah Rodríguez ante la emergencia nacional. Reciben: alimentos no perecederos, ropa y abrigo en buen estado, equipos y artículos de apoyo (linternas y lámparas), insumos médicos y artículos de aseo personal.',
  'community',
  'Lara',
  'Barquisimeto',
  'Carrera 3 con calles 11 y 12, Barrio Unión, Barquisimeto',
  10.083,
  -69.354,
  'Por confirmar',
  ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
  '/images/help-centers/will-store-gizah-rodriguez-barrio-union.png',
  ARRAY['/images/help-centers/will-store-gizah-rodriguez-barrio-union.png'],
  false,
  true
)
ON CONFLICT DO NOTHING;
