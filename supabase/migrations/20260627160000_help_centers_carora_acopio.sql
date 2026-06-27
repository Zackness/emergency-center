-- Centros de acopio adicionales en Carora, Lara (listado comunitario junio 2026)

INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, schedule, accepts, image_url, image_urls, is_verified, is_active
)
SELECT
  'Centro de acopio Carora — IPASME',
  'Centro de acopio en Carora (Lara) habilitado tras el terremoto. Reciben: agua potable, gasas, alcohol, algodón, jeringas, ropa y comida no perecedera. Horario desde las 10:00 a.m.',
  'government', 'Lara', 'Carora', 'IPASME, Carora, Lara',
  10.1742, -70.0648, NULL, 'Desde las 10:00 a.m.',
  ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing'],
  '/images/help-centers/centros-acopio-carora.png',
  ARRAY['/images/help-centers/centros-acopio-carora.png'],
  true, true
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers WHERE name = 'Centro de acopio Carora — IPASME' AND city = 'Carora'
);

INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, schedule, accepts, image_url, image_urls, is_verified, is_active
)
SELECT
  'Centro de acopio Carora — Av. Francisco de Miranda (Prolicor)',
  'Centro de acopio en Carora (Lara) habilitado tras el terremoto. Reciben: agua potable, gasas, alcohol, algodón, jeringas, ropa y comida no perecedera. Horario desde las 10:00 a.m.',
  'community', 'Lara', 'Carora', 'Av. Francisco de Miranda, frente a Prolicor, Carora',
  10.1749, -70.0546, NULL, 'Desde las 10:00 a.m.',
  ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing'],
  '/images/help-centers/centros-acopio-carora.png',
  ARRAY['/images/help-centers/centros-acopio-carora.png'],
  true, true
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers
  WHERE name = 'Centro de acopio Carora — Av. Francisco de Miranda (Prolicor)' AND city = 'Carora'
);

INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, schedule, accepts, image_url, image_urls, is_verified, is_active
)
SELECT
  'Centro de acopio Carora — Iglesia Sagrada Familia',
  'Centro de acopio en Carora (Lara) habilitado tras el terremoto. Reciben: agua potable, gasas, alcohol, algodón, jeringas, ropa y comida no perecedera. Horario desde las 10:00 a.m.',
  'church', 'Lara', 'Carora', 'Iglesia Sagrada Familia, Carora, Lara',
  10.1761, -70.0795, NULL, 'Desde las 10:00 a.m.',
  ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
  '/images/help-centers/centros-acopio-carora.png',
  ARRAY['/images/help-centers/centros-acopio-carora.png'],
  true, true
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers
  WHERE name = 'Centro de acopio Carora — Iglesia Sagrada Familia' AND city = 'Carora'
);

INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, schedule, accepts, image_url, image_urls, is_verified, is_active
)
SELECT
  'Centro de acopio Carora — Iglesia Inmaculada Concepción de María',
  'Centro de acopio en Carora (Lara) habilitado tras el terremoto. Reciben: agua potable, gasas, alcohol, algodón, jeringas, ropa y comida no perecedera. Horario desde las 10:00 a.m.',
  'church', 'Lara', 'Carora', 'Iglesia Inmaculada Concepción de María, Carora, Lara',
  10.1734, -70.0821, NULL, 'Desde las 10:00 a.m.',
  ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
  '/images/help-centers/centros-acopio-carora.png',
  ARRAY['/images/help-centers/centros-acopio-carora.png'],
  true, true
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers
  WHERE name = 'Centro de acopio Carora — Iglesia Inmaculada Concepción de María' AND city = 'Carora'
);

INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, schedule, accepts, image_url, image_urls, is_verified, is_active
)
SELECT
  'Centro de acopio Carora — Cooperativa 109',
  'Centro de acopio en Carora (Lara) habilitado tras el terremoto. Reciben: agua potable, gasas, alcohol, algodón, jeringas, ropa y comida no perecedera. Horario desde las 10:00 a.m.',
  'community', 'Lara', 'Carora', 'Cooperativa 109, Carora, Lara',
  10.1758, -70.0762, NULL, 'Desde las 10:00 a.m.',
  ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing'],
  '/images/help-centers/centros-acopio-carora.png',
  ARRAY['/images/help-centers/centros-acopio-carora.png'],
  true, true
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers WHERE name = 'Centro de acopio Carora — Cooperativa 109' AND city = 'Carora'
);

INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, schedule, accepts, image_url, image_urls, is_verified, is_active
)
SELECT
  'Centro de acopio Carora — Parque Ferial / Cáritas Diocesana',
  'Centro de acopio en Carora (Lara) habilitado tras el terremoto. Reciben: agua potable, gasas, alcohol, algodón, jeringas, ropa y comida no perecedera. Horario desde las 10:00 a.m.',
  'church', 'Lara', 'Carora', 'Parque Ferial, Cáritas Diocesana, Carora, Lara',
  10.1772, -70.0843, NULL, 'Desde las 10:00 a.m.',
  ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
  '/images/help-centers/centros-acopio-carora.png',
  ARRAY['/images/help-centers/centros-acopio-carora.png'],
  true, true
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers
  WHERE name = 'Centro de acopio Carora — Parque Ferial / Cáritas Diocesana' AND city = 'Carora'
);

INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, schedule, accepts, image_url, image_urls, is_verified, is_active
)
SELECT
  'Centro de acopio Carora — SORGO',
  'Centro de acopio en Carora (Lara) habilitado tras el terremoto. Reciben: agua potable, gasas, alcohol, algodón, jeringas, ropa y comida no perecedera. Horario desde las 10:00 a.m.',
  'community', 'Lara', 'Carora', 'SORGO, Carora, Lara',
  10.1728, -70.0589, NULL, 'Desde las 10:00 a.m.',
  ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing'],
  '/images/help-centers/centros-acopio-carora.png',
  ARRAY['/images/help-centers/centros-acopio-carora.png'],
  true, true
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers WHERE name = 'Centro de acopio Carora — SORGO' AND city = 'Carora'
);

UPDATE help_centers
SET
  is_verified = true,
  is_active = true,
  address = 'Av. Francisco de Miranda, esquina calle Riera Silva, Carora'
WHERE city = 'Carora'
  AND name = 'Centro de acopio Carora — Av. Francisco de Miranda';

UPDATE help_centers
SET
  is_verified = true,
  is_active = true,
  address = 'Av. Francisco de Miranda, frente al grupo escolar Ramón Pompilio Oropeza, Carora'
WHERE city = 'Carora'
  AND name = 'Centro de acopio Carora — G.E. Ramón Pompilio Oropeza';
