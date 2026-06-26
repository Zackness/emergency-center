-- Operación Todos con VZLA — Sambil Barquisimeto
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
  'Operación Todos con VZLA — Sambil Barquisimeto',
  'Centro de acopio de Operación Todos con VZLA en Lara, municipio Iribarren. Ubicado en Av. Venezuela al lado del Sambil, canal lento desde Av. Morán hasta el Sambil, al lado de Seguros Altamira.',
  'community',
  'Lara',
  'Barquisimeto',
  'Av. Venezuela al lado del Sambil, canal lento desde Av. Morán hasta el Sambil, al lado de Seguros Altamira, Barquisimeto',
  10.0657,
  -69.2915,
  'Por confirmar',
  ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
  '/images/help-centers/operacion-todos-con-vzla-sambil-barquisimeto.png',
  ARRAY['/images/help-centers/operacion-todos-con-vzla-sambil-barquisimeto.png'],
  false,
  true
)
ON CONFLICT DO NOTHING;
