-- C.C. Las Trinitarias — Centro de acopio en tarima central
INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, schedule, accepts, is_verified, is_active
)
SELECT
  'C.C. Las Trinitarias — Tarima central',
  'Centro de acopio en Las Trinitarias, habilitado para ayudar a quienes lo necesitan. Reciben alimentos no perecederos, ropa en buen estado, cobijas y sábanas, medicinas, artículos de higiene personal, pañales y agua potable. El afiche indica que se puede solicitar gratis el servicio de encomienda de Vamos App para entregar el donativo.',
  'community',
  'Lara',
  'Barquisimeto',
  'Centro Comercial Las Trinitarias, Tarima central, Barquisimeto',
  10.0635,
  -69.2859,
  NULL,
  'Por confirmar',
  ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
  false,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers
  WHERE name = 'C.C. Las Trinitarias — Tarima central'
    AND city = 'Barquisimeto'
);
