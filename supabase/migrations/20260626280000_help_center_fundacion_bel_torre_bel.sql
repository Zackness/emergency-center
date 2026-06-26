-- Fundación BEL — Torre BEL (Barquisimeto Este): asegurar registro completo y activo
INSERT INTO help_centers (
  name,
  description,
  type,
  state,
  city,
  address,
  latitude,
  longitude,
  phone,
  schedule,
  accepts,
  image_url,
  image_urls,
  is_verified,
  is_active
)
SELECT
  'Fundación BEL — Torre BEL',
  'Centro de acopio en Barquisimeto para familias afectadas por el terremoto en la Capital (Caracas) y el estado La Guaira. Para familias: agua potable, fórmulas infantiles, alimentos no perecederos, medicinas e insumos médicos, productos de higiene personal, pañales (niños y adultos), sábanas, almohadas y cobijas, ropa y calzado en buen estado. Para animalitos: alimentos para perros y gatos, medicamentos veterinarios básicos, comederos y bebederos, correas, collares y transportadoras en buen estado. Contacto adicional: 0412-5567761.',
  'ngo',
  'Lara',
  'Barquisimeto',
  'Torre BEL, Prolongación Av. Los Leones esquina Av. Terepaima, Piso 7 — Oficina 7, Barquisimeto Este',
  10.0621114,
  -69.2852143,
  '0424-5839025',
  'Por confirmar',
  ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
  NULL,
  ARRAY[]::text[],
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers WHERE name = 'Fundación BEL — Torre BEL'
);

UPDATE help_centers
SET
  description = 'Centro de acopio en Barquisimeto para familias afectadas por el terremoto en la Capital (Caracas) y el estado La Guaira. Para familias: agua potable, fórmulas infantiles, alimentos no perecederos, medicinas e insumos médicos, productos de higiene personal, pañales (niños y adultos), sábanas, almohadas y cobijas, ropa y calzado en buen estado. Para animalitos: alimentos para perros y gatos, medicamentos veterinarios básicos, comederos y bebederos, correas, collares y transportadoras en buen estado. Contacto adicional: 0412-5567761.',
  type = 'ngo',
  state = 'Lara',
  city = 'Barquisimeto',
  address = 'Torre BEL, Prolongación Av. Los Leones esquina Av. Terepaima, Piso 7 — Oficina 7, Barquisimeto Este',
  latitude = 10.0621114,
  longitude = -69.2852143,
  phone = '0424-5839025',
  schedule = 'Por confirmar',
  accepts = ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
  image_url = NULL,
  image_urls = ARRAY[]::text[],
  is_verified = true,
  is_active = true,
  updated_at = now()
WHERE name = 'Fundación BEL — Torre BEL';
