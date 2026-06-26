-- Patitas de Amor — «Solidarias con La Guaira» (3 puntos en Barquisimeto)
INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, schedule, accepts, image_url, image_urls, is_verified, is_active
)
VALUES
  (
    'Patitas de Amor — Zona Este (Indio Manaure)',
    'Campaña «Solidarias con La Guaira» de Patitas de Amor. Recaudan insumos para damnificados del doble terremoto en la zona capitalina, con destino a La Guaira. Prioridad: alimento para animales. También: ropa en buen estado, alimentos no perecederos, enlatados, pañales, agua potable, medicinas, herramientas de seguridad, sábanas, linternas y pilas, juguetes.',
    'ngo', 'Lara', 'Barquisimeto',
    'Indio Manaure, frente a Bodeguita Mayu, Barquisimeto Este',
    10.0618, -69.2865, '0424-5378100', 'Por confirmar',
    ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
    '/images/help-centers/patitas-de-amor-solidarias-guaira.png',
    ARRAY['/images/help-centers/patitas-de-amor-solidarias-guaira.png'],
    false, true
  ),
  (
    'Patitas de Amor — Zona Oeste (Sede Fundación)',
    'Campaña «Solidarias con La Guaira» de Patitas de Amor. Recaudan insumos para damnificados del doble terremoto en la zona capitalina, con destino a La Guaira. Prioridad: alimento para animales. También: ropa en buen estado, alimentos no perecederos, enlatados, pañales, agua potable, medicinas, herramientas de seguridad, sábanas, linternas y pilas, juguetes.',
    'ngo', 'Lara', 'Barquisimeto',
    'Sede de la Fundación Patitas de Amor, Calle 51 entre carreras 16 y 17, Barquisimeto Oeste',
    10.0655, -69.328, '0422-1031997', 'Por confirmar',
    ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
    '/images/help-centers/patitas-de-amor-solidarias-guaira.png',
    ARRAY['/images/help-centers/patitas-de-amor-solidarias-guaira.png'],
    false, true
  ),
  (
    'Patitas de Amor — Zona Centro (Urb. Sucre)',
    'Campaña «Solidarias con La Guaira» de Patitas de Amor. Recaudan insumos para damnificados del doble terremoto en la zona capitalina, con destino a La Guaira. Prioridad: alimento para animales. También: ropa en buen estado, alimentos no perecederos, enlatados, pañales, agua potable, medicinas, herramientas de seguridad, sábanas, linternas y pilas, juguetes.',
    'ngo', 'Lara', 'Barquisimeto',
    'Urbanización Sucre, Sede de Microdosis, Barquisimeto',
    10.0647, -69.3204, '0424-5411709', 'Por confirmar',
    ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
    '/images/help-centers/patitas-de-amor-solidarias-guaira.png',
    ARRAY['/images/help-centers/patitas-de-amor-solidarias-guaira.png'],
    false, true
  )
ON CONFLICT DO NOTHING;
