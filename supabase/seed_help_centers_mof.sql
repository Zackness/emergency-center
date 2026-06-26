-- Mi Odontólogo Favorito (MOF) — 10 sedes como centros de acopio → Tucacas, Falcón
INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  schedule, accepts, image_url, image_urls, is_verified, is_active
)
VALUES
  (
    'Mi Odontólogo Favorito — BQTO Principal',
    'Mi Odontólogo Favorito (MOF) — centro de acopio en esta sede. Necesitan insumos médicos o lo que puedas aportar. La recolección será destinada a Tucacas, estado Falcón.',
    'community', 'Lara', 'Barquisimeto', 'Sede principal, Barquisimeto',
    10.0712, -69.3135, 'Por confirmar',
    ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
    '/images/help-centers/mi-odontologo-favorito-acopio.png',
    ARRAY['/images/help-centers/mi-odontologo-favorito-acopio.png'], false, true
  ),
  (
    'Mi Odontólogo Favorito — Centro',
    'Mi Odontólogo Favorito (MOF) — centro de acopio en esta sede. Necesitan insumos médicos o lo que puedas aportar. La recolección será destinada a Tucacas, estado Falcón.',
    'community', 'Lara', 'Barquisimeto', 'Sede Centro, Barquisimeto',
    10.0705, -69.3142, 'Por confirmar',
    ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
    '/images/help-centers/mi-odontologo-favorito-acopio.png',
    ARRAY['/images/help-centers/mi-odontologo-favorito-acopio.png'], false, true
  ),
  (
    'Mi Odontólogo Favorito — C.C. Metropolis',
    'Mi Odontólogo Favorito (MOF) — centro de acopio en esta sede. Necesitan insumos médicos o lo que puedas aportar. La recolección será destinada a Tucacas, estado Falcón.',
    'community', 'Lara', 'Barquisimeto', 'Centro Comercial Metropolis, Barquisimeto',
    10.0682, -69.2988, 'Por confirmar',
    ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
    '/images/help-centers/mi-odontologo-favorito-acopio.png',
    ARRAY['/images/help-centers/mi-odontologo-favorito-acopio.png'], false, true
  ),
  (
    'Mi Odontólogo Favorito — C.C. Trinitarias',
    'Mi Odontólogo Favorito (MOF) — centro de acopio en esta sede. Necesitan insumos médicos o lo que puedas aportar. La recolección será destinada a Tucacas, estado Falcón.',
    'community', 'Lara', 'Barquisimeto', 'Centro Comercial Las Trinitarias, Barquisimeto',
    10.0635, -69.2859, 'Por confirmar',
    ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
    '/images/help-centers/mi-odontologo-favorito-acopio.png',
    ARRAY['/images/help-centers/mi-odontologo-favorito-acopio.png'], false, true
  ),
  (
    'Mi Odontólogo Favorito — Oeste',
    'Mi Odontólogo Favorito (MOF) — centro de acopio en esta sede. Necesitan insumos médicos o lo que puedas aportar. La recolección será destinada a Tucacas, estado Falcón.',
    'community', 'Lara', 'Barquisimeto', 'Sede Oeste, Barquisimeto',
    10.0655, -69.328, 'Por confirmar',
    ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
    '/images/help-centers/mi-odontologo-favorito-acopio.png',
    ARRAY['/images/help-centers/mi-odontologo-favorito-acopio.png'], false, true
  ),
  (
    'Mi Odontólogo Favorito — BQTO Norte',
    'Mi Odontólogo Favorito (MOF) — centro de acopio en esta sede. Necesitan insumos médicos o lo que puedas aportar. La recolección será destinada a Tucacas, estado Falcón.',
    'community', 'Lara', 'Barquisimeto', 'Sede Norte, Barquisimeto',
    10.0782, -69.3055, 'Por confirmar',
    ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
    '/images/help-centers/mi-odontologo-favorito-acopio.png',
    ARRAY['/images/help-centers/mi-odontologo-favorito-acopio.png'], false, true
  ),
  (
    'Mi Odontólogo Favorito — Quíbor',
    'Mi Odontólogo Favorito (MOF) — centro de acopio en esta sede. Necesitan insumos médicos o lo que puedas aportar. La recolección será destinada a Tucacas, estado Falcón.',
    'community', 'Lara', 'Quíbor', 'Sede Quíbor, Quíbor',
    9.9261, -69.6208, 'Por confirmar',
    ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
    '/images/help-centers/mi-odontologo-favorito-acopio.png',
    ARRAY['/images/help-centers/mi-odontologo-favorito-acopio.png'], false, true
  ),
  (
    'Mi Odontólogo Favorito — El Tocuyo',
    'Mi Odontólogo Favorito (MOF) — centro de acopio en esta sede. Necesitan insumos médicos o lo que puedas aportar. La recolección será destinada a Tucacas, estado Falcón.',
    'community', 'Lara', 'El Tocuyo', 'Sede El Tocuyo, El Tocuyo',
    9.7872, -69.7934, 'Por confirmar',
    ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
    '/images/help-centers/mi-odontologo-favorito-acopio.png',
    ARRAY['/images/help-centers/mi-odontologo-favorito-acopio.png'], false, true
  ),
  (
    'Mi Odontólogo Favorito — Cabudare',
    'Mi Odontólogo Favorito (MOF) — centro de acopio en esta sede. Necesitan insumos médicos o lo que puedas aportar. La recolección será destinada a Tucacas, estado Falcón.',
    'community', 'Lara', 'Cabudare', 'Sede Cabudare, Cabudare',
    10.0264, -69.2562, 'Por confirmar',
    ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
    '/images/help-centers/mi-odontologo-favorito-acopio.png',
    ARRAY['/images/help-centers/mi-odontologo-favorito-acopio.png'], false, true
  ),
  (
    'Mi Odontólogo Favorito — Acarigua',
    'Mi Odontólogo Favorito (MOF) — centro de acopio en esta sede. Necesitan insumos médicos o lo que puedas aportar. La recolección será destinada a Tucacas, estado Falcón.',
    'community', 'Portuguesa', 'Acarigua', 'Sede Acarigua, Acarigua',
    9.5512, -69.2015, 'Por confirmar',
    ARRAY['water', 'food', 'medicine', 'hygiene', 'clothing', 'blankets'],
    '/images/help-centers/mi-odontologo-favorito-acopio.png',
    ARRAY['/images/help-centers/mi-odontologo-favorito-acopio.png'], false, true
  )
ON CONFLICT DO NOTHING;
