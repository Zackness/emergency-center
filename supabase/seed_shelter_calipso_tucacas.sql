-- Club de Playa Calipso — Hospedaje gratuito para voluntarios (Tucacas, Falcón)
INSERT INTO shelters (
  name, state, city, address, latitude, longitude,
  phone, capacity, current_occupancy, services, schedule, is_verified, is_active
)
SELECT
  'Club de Playa Calipso — Hospedaje gratuito',
  'Falcón',
  'Tucacas',
  'Club de Playa Calipso, Tucacas, Falcón. Hospedaje gratuito para personas que vienen a ayudar. Instagram: @calipsoparadise',
  10.7895,
  -68.3208,
  '0412-8614663',
  NULL,
  NULL,
  ARRAY['hospedaje gratuito', 'voluntarios', 'alojamiento'],
  'Contactar para coordinar',
  false,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM shelters
  WHERE name = 'Club de Playa Calipso — Hospedaje gratuito'
    AND city = 'Tucacas'
);
