-- Centro de acopio: Academia Cecilio Acosta, Carora, Lara
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
  is_verified,
  is_active
)
VALUES (
  'Academia Cecilio Acosta',
  'Centro de acopio habilitado tras el terremoto del 24 de junio. Recibe donaciones para familias afectadas en Lara y zonas vecinas.',
  'university',
  'Lara',
  'Carora',
  'Av. Dr. Pastor Oropeza, entre calles 6 y 7, Urb. Antonio José de Sucre (a una cuadra de Monpet, detrás del aeropuerto de Carora)',
  10.1738,
  -70.0615,
  '0412-9099254',
  'Lun-Dom 8:00-18:00',
  ARRAY['water', 'food', 'medicine', 'clothing', 'hygiene', 'blankets'],
  true,
  true
);
