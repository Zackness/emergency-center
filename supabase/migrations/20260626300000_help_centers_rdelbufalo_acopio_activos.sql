-- Centros de acopio activos (@rdelbufalo — 25 jun 2026)
-- Fuente: https://www.instagram.com/rdelbufalo/

INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, email, schedule, accepts, image_url, image_urls, is_verified, is_active
)
SELECT
  v.name, v.description, v.type::help_center_type, v.state, v.city, v.address,
  v.latitude, v.longitude, v.phone, v.email, v.schedule, v.accepts,
  NULL, ARRAY[]::text[], true, true
FROM (VALUES
  ('Centro Mormón — Acopio y refugio', 'Centro de acopio activo reportado el 25 de junio de 2026 (@rdelbufalo). Funciona también como refugio.', 'community', 'Distrito Capital', 'Caracas', 'Caracas (coord. 10.611, -66.886)', 10.611, -66.886, NULL, NULL, 'Confirmar horario en sitio', ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]),
  ('Quinta Bejucal', 'Centro de acopio activo reportado el 25 de junio de 2026 (@rdelbufalo). Plus Code G46W+7R5, Caracas.', 'community', 'Miranda', 'Caracas', 'Quinta Bejucal, Plus Code G46W+7R5, Caracas', 10.4847, -66.9583, NULL, NULL, 'Confirmar horario en sitio', ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]),
  ('Tinta Violeta — Atención psicológica', 'Servicio gratuito de atención psicológica virtual (@rdelbufalo). Sin sede física de acopio.', 'ngo', 'Distrito Capital', 'Caracas', 'Atención virtual — sin sede física de acopio', 10.49, -66.88, NULL, NULL, 'Virtual', ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]),
  ('Centro Comercial La Capilla — Maracay', 'Centro de acopio activo en Maracay (@rdelbufalo).', 'community', 'Aragua', 'Maracay', 'Av. 19 de Abril, piso 1, local 21, Centro Comercial La Capilla', 10.2028, -67.6185, NULL, NULL, 'Horario del centro comercial — confirmar en sitio', ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]),
  ('Redoma Gran Mariscal Corinsa — Cagua', 'Punto vial de acopio en Cagua (@rdelbufalo).', 'community', 'Aragua', 'Cagua', 'Redoma Gran Mariscal Corinsa, Cagua', 10.1851, -67.4523, NULL, NULL, 'Confirmar en sitio', ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]),
  ('Edificio Talislandia — Naguanagua', 'Punto de acopio en El Viñedo, Naguanagua (@rdelbufalo).', 'community', 'Carabobo', 'Naguanagua', 'Av. Monseñor Adams, El Viñedo, mezzanina, Edificio Talislandia', 10.2445, -68.0055, NULL, NULL, 'Confirmar horario en sitio', ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]),
  ('Universidad de Los Andes — Núcleo Táchira', 'ULA Táchira: alimentos no perecederos, agua y ropa (@rdelbufalo).', 'university', 'Táchira', 'San Cristóbal', 'Núcleo Táchira, Universidad de Los Andes (ULA)', 7.786, -72.2263, NULL, NULL, 'Confirmar horario institucional', ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]),
  ('Centro Vente — Barinas', 'Punto de acopio y ayuda humanitaria en Barinas (@rdelbufalo).', 'community', 'Barinas', 'Barinas', 'Centro Vente, Barinas', 8.6305, -70.253, NULL, NULL, 'Confirmar en sitio', ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]),
  ('Colegio Miguel Otero Silva — CB4 Anzoátegui', 'Centro de acopio CB4 Anzoátegui (@rdelbufalo).', 'community', 'Anzoátegui', 'Puerto La Cruz', 'Colegio Miguel Otero Silva', 10.257, -64.621, NULL, NULL, 'Confirmar en sitio', ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]),
  ('Plaza Puerto Príncipe y Plaza Bolívar', 'Puntos de acopio comunitarios en Lechería y Barcelona (@rdelbufalo).', 'community', 'Anzoátegui', 'Lechería / Barcelona', 'Plaza Puerto Príncipe (Lechería) y Plaza Bolívar (Barcelona)', 10.5845, -64.6129, NULL, NULL, 'Confirmar en sitio', ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]),
  ('Casa del Abuelo', 'Punto vecinal habilitado en Anzoátegui (@rdelbufalo).', 'community', 'Anzoátegui', 'Barcelona', 'Casa del Abuelo, municipio Simón Bolívar', 10.14, -64.69, NULL, NULL, 'Confirmar en sitio', ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]),
  ('Alcaldía del Municipio Simón Bolívar', 'Punto institucional de acopio en Barcelona (@rdelbufalo).', 'government', 'Anzoátegui', 'Barcelona', 'Alcaldía del Municipio Simón Bolívar, Barcelona', 10.136, -64.682, NULL, NULL, 'Horario de la alcaldía — confirmar en sitio', ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]),
  ('UCAB Guayana — Casa del Estudiante', 'UCAB Guayana, piso alto Casa del Estudiante (@rdelbufalo).', 'university', 'Bolívar', 'Ciudad Guayana', 'UCAB Guayana, piso alto Casa del Estudiante', 8.3065, -62.7175, NULL, NULL, 'Confirmar horario universitario', ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]),
  ('Red Cecosesola — Barquisimeto', 'Ferias de acopio en puntos comunitarios Cecosesola (@rdelbufalo).', 'community', 'Lara', 'Barquisimeto', 'Red Cecosesola, puntos comunitarios, Barquisimeto', 10.0638, -69.3208, NULL, NULL, 'Consultar fechas de ferias en redes de Cecosesola', ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[])
) AS v(name, description, type, state, city, address, latitude, longitude, phone, email, schedule, accepts)
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers h WHERE h.name = v.name AND h.is_active = true
);
