-- G3 Logística (centros de acopio) + actualización Cáritas Montalbán (@rdelbufalo)

INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, email, schedule, accepts, image_url, image_urls, is_verified, is_active
)
SELECT
  v.name, v.description, v.type::help_center_type, v.state, v.city, v.address,
  v.latitude, v.longitude, NULL, NULL, v.schedule, v.accepts,
  NULL, ARRAY[]::text[], true, true
FROM (VALUES
  (
    'G3 Logística Caracas — Centro de acopio',
    'Centro de acopio G3 Logística para insumos, materiales y donaciones (@rdelbufalo).',
    'community', 'Distrito Capital', 'Caracas',
    'Av. Principal de Los Cortijos de Lourdes, Edificio Maploca, Los Cortijos de Lourdes',
    10.488, -66.868, 'Lun–Vie 9:00–12:00 y 14:00–15:30',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'G3 Logística Valencia — Centro de acopio',
    'Centro de acopio G3 Logística para insumos, materiales y donaciones (@rdelbufalo).',
    'community', 'Carabobo', 'Valencia',
    'Calle La Pedrera, Fundo Los Marines, Lote S/N, Zona Industrial San Diego',
    10.209, -67.964, 'Lun–Vie 9:00–12:00 y 14:00–15:30',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'G3 Logística Barquisimeto — Centro de acopio',
    'Centro de acopio G3 Logística para insumos, materiales y donaciones (@rdelbufalo).',
    'community', 'Lara', 'Barquisimeto',
    'Zona Industrial II, Av. Principal con Calle 6, Locales 110-111-112, Municipio Iribarren',
    10.065, -69.332, 'Lun–Vie 9:00–12:00 y 14:00–15:30',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  )
) AS v(name, description, type, state, city, address, latitude, longitude, schedule, accepts)
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers h WHERE h.name = v.name AND h.is_active = true
);

UPDATE help_centers
SET
  name = 'Cáritas Venezuela — Sede Montalbán',
  description = 'Centro de acopio de la Conferencia Episcopal Venezolana y Cáritas de Venezuela. Recibe insumos, materiales y donaciones. Actualizaciones: @caritasdevzla. Referenciado por @rdelbufalo.',
  address = 'Av. Teherán, a 200 m de la UCAB, frente a Urb. Juan Pablo II. Sede CEV, Montalbán, Caracas',
  latitude = 10.4961,
  longitude = -66.8983,
  is_verified = true,
  updated_at = now()
WHERE name ILIKE '%Cáritas%Montalbán%'
   OR name ILIKE '%Caritas%Montalban%'
   OR name = 'Cáritas Nacional — Montalbán';
