-- Ferretotal La Trinidad — centro de acopio (terremoto 24 jun 2026; venezuelareporta.org)

INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, email, schedule, accepts, image_url, image_urls, is_verified, is_active
)
SELECT
  'Ferretotal La Trinidad — Centro de acopio',
  'Ferretotal (@ferretotaloficial) habilitó la sede La Trinidad como centro de acopio tras el terremoto del 24 de junio de 2026. Recibe donaciones para canalizar ayuda a zonas afectadas — prioridad en herramientas de rescate, linternas, pilas, guantes y material ferretero, además de agua, alimentos no perecederos e insumos médicos. Listado en venezuelareporta.org; difundido en compilaciones de recursos de emergencia en redes (incl. @thefaria). Confirmar horarios y logística en Instagram @ferretotaloficial.',
  'community'::help_center_type,
  'Miranda',
  'La Trinidad',
  'Av. Intercomunal La Trinidad–El Hatillo, Granjerías de la Trinidad, etapa Pie de Monte, sector H (200 m después del Centro Médico Docente, mano derecha), Baruta',
  10.4275,
  -66.8645,
  '0212-9422888',
  NULL,
  'Lun–Sáb 8:30 a.m.–7:00 p.m. (confirmar en @ferretotaloficial)',
  ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[],
  NULL,
  ARRAY[]::text[],
  false,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers
  WHERE name = 'Ferretotal La Trinidad — Centro de acopio'
    AND city = 'La Trinidad'
);
