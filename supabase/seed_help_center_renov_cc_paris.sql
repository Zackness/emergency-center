-- RENOV — Centro de acopio C.C. París (donaciones para Tucacas y Puerto Cabello)
INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, schedule, accepts, image_url, image_urls, is_verified, is_active
)
SELECT
  'RENOV — C.C. París',
  'Centro de acopio para donaciones destinadas a Tucacas y Puerto Cabello. Se acepta todo: insumos médicos, comida, ropa, sábanas y demás donativos. «Juntos podemos llevar esperanza».',
  'community',
  'Lara',
  'Barquisimeto',
  'C.C. París, por la entrada de la panadería, Barquisimeto',
  10.0647,
  -69.3158,
  NULL,
  'Por confirmar',
  ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
  '/images/help-centers/renov-cc-paris-acopio.png',
  ARRAY['/images/help-centers/renov-cc-paris-acopio.png'],
  false,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers
  WHERE name = 'RENOV — C.C. París'
    AND city = 'Barquisimeto'
);
