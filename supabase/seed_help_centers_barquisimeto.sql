-- Centros de acopio en Barquisimeto (flyer «Centros de acopio en Barquisimeto»)
-- Imagen compartida: /images/help-centers/centros-acopio-barquisimeto.jpg

UPDATE help_centers
SET
  name = 'Hospitour',
  image_url = '/images/help-centers/centros-acopio-barquisimeto.jpg',
  image_urls = ARRAY['/images/help-centers/centros-acopio-barquisimeto.jpg']
WHERE city = 'Barquisimeto' AND address ILIKE '%Carrera 25%calles 14 y 15%';

INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  schedule, accepts, image_url, image_urls, is_verified, is_active
)
VALUES
  (
    'Fundación Redes Tejiendo',
    'Punto de acopio en Barquisimeto (Lara). Listado «Centros de acopio en Barquisimeto».',
    'ngo', 'Lara', 'Barquisimeto',
    'Calle 41, entre carreras 13 y 14, casa 13-50 (fachada azul), Barquisimeto',
    10.0735, -69.31, 'Por confirmar',
    ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
    '/images/help-centers/centros-acopio-barquisimeto.jpg',
    ARRAY['/images/help-centers/centros-acopio-barquisimeto.jpg'],
    false, true
  ),
  (
    'Farma Bien',
    'Punto de acopio en Barquisimeto (Lara). Listado «Centros de acopio en Barquisimeto».',
    'community', 'Lara', 'Barquisimeto',
    'Av. Vargas, entre carreras 22 y 23, Edif. Gustavo PB, Barquisimeto',
    10.071, -69.312, 'Por confirmar',
    ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
    '/images/help-centers/centros-acopio-barquisimeto.jpg',
    ARRAY['/images/help-centers/centros-acopio-barquisimeto.jpg'],
    false, true
  ),
  (
    'JAC Express Barquisimeto',
    'Punto de acopio en Barquisimeto (Lara). Listado «Centros de acopio en Barquisimeto».',
    'community', 'Lara', 'Barquisimeto',
    'Av. 20 con calle 15, Barquisimeto',
    10.0678, -69.3136, 'Por confirmar',
    ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
    '/images/help-centers/centros-acopio-barquisimeto.jpg',
    ARRAY['/images/help-centers/centros-acopio-barquisimeto.jpg'],
    false, true
  ),
  (
    'Voz Segura',
    'Punto de acopio en Barquisimeto (Lara). Listado «Centros de acopio en Barquisimeto».',
    'community', 'Lara', 'Barquisimeto',
    'Edif. Villas del Parque (detrás del Impulso), Barquisimeto',
    10.075, -69.308, 'Por confirmar',
    ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
    '/images/help-centers/centros-acopio-barquisimeto.jpg',
    ARRAY['/images/help-centers/centros-acopio-barquisimeto.jpg'],
    false, true
  ),
  (
    'Fitness Factory',
    'Punto de acopio en Barquisimeto (Lara). Listado «Centros de acopio en Barquisimeto».',
    'community', 'Lara', 'Barquisimeto',
    'Galpón: Calle Urdaneta con Av. Venezuela, Barquisimeto',
    10.0724, -69.2898, 'Por confirmar',
    ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
    '/images/help-centers/centros-acopio-barquisimeto.jpg',
    ARRAY['/images/help-centers/centros-acopio-barquisimeto.jpg'],
    false, true
  ),
  (
    'Virtux Box',
    'Punto de acopio en Barquisimeto (Lara). Listado «Centros de acopio en Barquisimeto».',
    'community', 'Lara', 'Barquisimeto',
    'Carrera 4S, entre calles 18 y 19, Barquisimeto',
    10.068, -69.318, 'Por confirmar',
    ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
    '/images/help-centers/centros-acopio-barquisimeto.jpg',
    ARRAY['/images/help-centers/centros-acopio-barquisimeto.jpg'],
    false, true
  ),
  (
    'Sonrisas Sanadoras',
    'Punto de acopio en Barquisimeto (Lara). Listado «Centros de acopio en Barquisimeto».',
    'ngo', 'Lara', 'Barquisimeto',
    'Calle 25 con carreras 17 y 18, Edif. Caribe, Piso 1, Oficina 1-5, Barquisimeto',
    10.0715, -69.3135, 'Por confirmar',
    ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
    '/images/help-centers/centros-acopio-barquisimeto.jpg',
    ARRAY['/images/help-centers/centros-acopio-barquisimeto.jpg'],
    false, true
  ),
  (
    'Un Nuevo Tiempo Lara',
    'Punto de acopio en Barquisimeto (Lara). Listado «Centros de acopio en Barquisimeto».',
    'church', 'Lara', 'Barquisimeto',
    'Carrera 15 esquina calle 40, Barquisimeto',
    10.074, -69.311, 'Por confirmar',
    ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
    '/images/help-centers/centros-acopio-barquisimeto.jpg',
    ARRAY['/images/help-centers/centros-acopio-barquisimeto.jpg'],
    false, true
  );
