-- Fundación Daniel Dhers — centro de donativos en Parque Naciones Unidas, El Paraíso (Caracas)

INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, schedule, accepts, image_url, image_urls, is_verified, is_active
)
SELECT
  'Fundación Daniel Dhers — Centro de donativos',
  'Centro de acopio habilitado por la Fundación Daniel Dhers en el Parque Naciones Unidas (Naciones Park), parroquia El Paraíso. Reciben insumos y donaciones para familias damnificadas por el terremoto del 24 de junio; canalizan ayuda hacia La Guaira y zonas más afectadas. El parque también permanece abierto como espacio de apoyo y recreación para niños mientras se coordina la labor solidaria.',
  'ngo',
  'Distrito Capital',
  'Caracas',
  'Parque Naciones Unidas, Avenida José Antonio Páez, El Paraíso, Municipio Libertador, Caracas',
  10.49211,
  -66.92922,
  NULL,
  'Por confirmar',
  ARRAY['water', 'food', 'medicine', 'clothing', 'hygiene', 'bathroom_supplies', 'blankets'],
  NULL,
  ARRAY[]::text[],
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers WHERE name = 'Fundación Daniel Dhers — Centro de donativos'
);

UPDATE help_centers SET
  description = 'Centro de acopio habilitado por la Fundación Daniel Dhers en el Parque Naciones Unidas (Naciones Park), parroquia El Paraíso. Reciben insumos y donaciones para familias damnificadas por el terremoto del 24 de junio; canalizan ayuda hacia La Guaira y zonas más afectadas. El parque también permanece abierto como espacio de apoyo y recreación para niños mientras se coordina la labor solidaria.',
  type = 'ngo',
  state = 'Distrito Capital',
  city = 'Caracas',
  address = 'Parque Naciones Unidas, Avenida José Antonio Páez, El Paraíso, Municipio Libertador, Caracas',
  latitude = 10.49211,
  longitude = -66.92922,
  schedule = 'Por confirmar',
  accepts = ARRAY['water', 'food', 'medicine', 'clothing', 'hygiene', 'bathroom_supplies', 'blankets'],
  is_verified = true,
  is_active = true,
  updated_at = now()
WHERE name = 'Fundación Daniel Dhers — Centro de donativos';
