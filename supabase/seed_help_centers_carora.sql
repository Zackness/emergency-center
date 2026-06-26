-- Centros de acopio en Carora (2 puntos del afiche oficial)
INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, schedule, accepts, image_url, image_urls, is_verified, is_active
)
SELECT
  'Centro de acopio Carora — Av. Francisco de Miranda',
  'Centro de acopio en Carora habilitado tras el terremoto. Reciben: agua potable, gasas, alcohol, algodón, jeringas, ropa y comida no perecedera. Horario desde las 10:00 a.m.',
  'community', 'Lara', 'Carora',
  'Av. Francisco de Miranda, esquina calle Riera Silva, Carora',
  10.1755, -70.0578, NULL, 'Desde las 10:00 a.m.',
  ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing'],
  '/images/help-centers/centros-acopio-carora.png',
  ARRAY['/images/help-centers/centros-acopio-carora.png'],
  false, true
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers
  WHERE name = 'Centro de acopio Carora — Av. Francisco de Miranda'
    AND city = 'Carora'
);

INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, schedule, accepts, image_url, image_urls, is_verified, is_active
)
SELECT
  'Centro de acopio Carora — G.E. Ramón Pompilio Oropeza',
  'Centro de acopio en Carora habilitado tras el terremoto. Reciben: agua potable, gasas, alcohol, algodón, jeringas, ropa y comida no perecedera. Horario desde las 10:00 a.m.',
  'community', 'Lara', 'Carora',
  'Frente al grupo escolar Ramón Pompilio Oropeza, Carora',
  10.1725, -70.0605, NULL, 'Desde las 10:00 a.m.',
  ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing'],
  '/images/help-centers/centros-acopio-carora.png',
  ARRAY['/images/help-centers/centros-acopio-carora.png'],
  false, true
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers
  WHERE name = 'Centro de acopio Carora — G.E. Ramón Pompilio Oropeza'
    AND city = 'Carora'
);
