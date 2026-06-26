-- «Ayuda a los que no tienen voz» — acopio para animales en Barquisimeto
INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, schedule, accepts, image_url, image_urls, is_verified, is_active
)
VALUES
  (
    'Ayuda a los que no tienen voz — Microdosis Chicha',
    'Campaña «Ayuda a los que no tienen voz». Centro de acopio de insumos para animales (perros y gatos): gatarina, perrarina, transportadoras, correas, mantas, cajas de cartón, agua y primeros auxilios. Iniciativa de Microdosis Chicha y Cachapas del Este.',
    'community', 'Lara', 'Barquisimeto',
    'Sede Microdosis Chicha, Carrera 21 entre calles 22 y 23, Barquisimeto',
    10.0678, -69.3136, '0424-5199404', 'Por confirmar',
    ARRAY['water', 'food', 'medicine', 'blankets'],
    '/images/help-centers/ayuda-animales-barquisimeto.png',
    ARRAY['/images/help-centers/ayuda-animales-barquisimeto.png'],
    false, true
  ),
  (
    'Ayuda a los que no tienen voz — Cachapas del Este',
    'Campaña «Ayuda a los que no tienen voz». Centro de acopio de insumos para animales (perros y gatos): gatarina, perrarina, transportadoras, correas, mantas, cajas de cartón, agua y primeros auxilios. Iniciativa de Microdosis Chicha y Cachapas del Este.',
    'community', 'Lara', 'Barquisimeto',
    'Sede Cachapas del Este, Río Lama, Barquisimeto',
    10.0555, -69.2945, '0424-5199404', 'Por confirmar',
    ARRAY['water', 'food', 'medicine', 'blankets'],
    '/images/help-centers/ayuda-animales-barquisimeto.png',
    ARRAY['/images/help-centers/ayuda-animales-barquisimeto.png'],
    false, true
  )
ON CONFLICT DO NOTHING;
