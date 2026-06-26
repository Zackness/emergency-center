-- Estadio Jorge Luis García Carneiro — Internet gratis y refugios (La Guaira)
INSERT INTO shelters (
  name, state, city, address, latitude, longitude,
  phone, capacity, current_occupancy, services, schedule, is_verified, is_active
)
SELECT
  'Estadio Jorge Luis García Carneiro',
  'La Guaira',
  'La Guaira',
  'Estadio de béisbol Jorge Luis García Carneiro, La Guaira (ex Estadio Fórum). Internet totalmente gratis para quienes necesiten comunicarse. Se están montando refugios. La Guaira sigue sin señal móvil — difundir.',
  10.5986,
  -66.9344,
  NULL,
  NULL,
  NULL,
  ARRAY['internet gratuito', 'comunicación', 'refugio', 'alojamiento'],
  'Activo',
  false,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM shelters
  WHERE name = 'Estadio Jorge Luis García Carneiro'
    AND city = 'La Guaira'
);
