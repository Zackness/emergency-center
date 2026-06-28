-- Centro de acopio CDMX — Anzures (ayuda a Venezuela, terremoto 24 jun 2026)

INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, email, schedule, accepts, image_url, image_urls, is_verified, is_active
)
SELECT
  'Centro de acopio CDMX — Anzures (ayuda a Venezuela)',
  'Centro de acopio en Ciudad de México para enviar ayuda a Venezuela tras los terremotos del 24 de junio de 2026. Difundido en redes para recibir insumos humanitarios y equipo de apoyo a rescatistas (cascos, guantes, herramientas, linternas, material médico y artículos de primera necesidad). Confirma horario y necesidades al llegar.',
  'community'::help_center_type,
  'México',
  'Ciudad de México',
  'Calle Buffon 38, colonia Anzures, alcaldía Miguel Hidalgo, Ciudad de México',
  19.4243,
  -99.1778,
  NULL,
  NULL,
  'Confirmar horario en el punto de acopio',
  ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[],
  NULL,
  ARRAY[]::text[],
  false,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers
  WHERE name = 'Centro de acopio CDMX — Anzures (ayuda a Venezuela)'
    AND city = 'Ciudad de México'
);
