-- Bomberos de Valencia — centro de acopio en sede principal (Estación Central)

INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, email, schedule, accepts, image_url, image_urls, is_verified, is_active
)
SELECT
  'Bomberos de Valencia — Centro de acopio (sede principal)',
  'Centro de acopio habilitado en la Estación Central del Instituto Autónomo Municipal Cuerpo de Bomberos de Valencia (IAMCBV), sede principal en Zona Industrial Municipal Norte. Recibe donaciones de insumos para emergencia y terremoto: agua, alimentos no perecederos, medicinas, material médico, linternas, pilas, guantes, herramientas y artículos de higiene. Coordinación oficial de bomberos municipales. Emergencias: 911. Fuente: bomberosvalencia.gob.ve.

[[seed:104]]',
  'government'::help_center_type,
  'Carabobo',
  'Valencia',
  'Estación Central Tcnel. (B) Rafael Anselmo Mújica Muñoz, Zona Industrial Municipal Norte, Av. Ernesto L. Branger (Av. 61), Parroquia Rafael Urdaneta, Valencia',
  10.1958,
  -67.9514,
  '0241-8324615',
  NULL,
  'Confirmar horario de recepción de donaciones en sitio · Emergencias 911',
  ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[],
  NULL,
  ARRAY[]::text[],
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers
  WHERE name = 'Bomberos de Valencia — Centro de acopio (sede principal)'
    AND city = 'Valencia'
);
