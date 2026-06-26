-- Fundación BEL — Torre BEL (Barquisimeto Este)
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
VALUES (
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
  '/images/help-centers/fundacion-bel-torre-bel.jpg',
  ARRAY['/images/help-centers/fundacion-bel-torre-bel.jpg'],
  true,
  true
)
ON CONFLICT DO NOTHING;
