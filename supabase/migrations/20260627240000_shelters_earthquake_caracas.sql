-- Refugios oficiales y comunitarios tras el terremoto del 24 jun 2026 (Caracas, Gran Caracas, Falcón)

INSERT INTO shelters (
  name, state, city, address, latitude, longitude,
  phone, capacity, current_occupancy, services, schedule, is_verified, is_active
)
SELECT
  v.name, v.state, v.city, v.address, v.latitude, v.longitude,
  NULL, NULL, NULL, v.services, v.schedule, v.is_verified, true
FROM (VALUES
  (
    'Complejo Cultural y Deportivo Guayana Esequiba',
    'Distrito Capital', 'Caracas',
    'Parroquia San Bernardino, Caracas. Puesto de comando de la Alcaldía Libertador. Fuente: Alcaldía de Caracas / Carmen Meléndez (24–25 jun 2026).',
    10.5068::double precision, -66.8912::double precision,
    ARRAY['refugio', 'alojamiento', 'agua', 'primeros auxilios', 'baños']::text[],
    '24 horas', true
  ),
  (
    'Estadio Chato Candela',
    'Distrito Capital', 'Caracas',
    'Parroquia 23 de Enero, Caracas. Centro de resguardo temporal habilitado por la Alcaldía Libertador. Fuente: Alcaldía de Caracas (24–25 jun 2026).',
    10.5056::double precision, -66.9598::double precision,
    ARRAY['refugio', 'alojamiento', 'agua', 'primeros auxilios']::text[],
    '24 horas', true
  ),
  (
    'Sede del Instituto Nacional de Deportes (IND)',
    'Distrito Capital', 'Caracas',
    'Parroquia El Paraíso, Caracas. Centro de resguardo temporal habilitado por la Alcaldía Libertador. Fuente: Alcaldía de Caracas (24–25 jun 2026).',
    10.487::double precision, -66.96::double precision,
    ARRAY['refugio', 'alojamiento', 'agua', 'primeros auxilios']::text[],
    '24 horas', true
  ),
  (
    'Ipostel — Centro Postal de Caracas',
    'Distrito Capital', 'Caracas',
    'Parroquia San Juan, Caracas. Sede de Ipostel habilitada como refugio de emergencia. Fuente: Alcaldía de Caracas (24–25 jun 2026).',
    10.4935::double precision, -66.8505::double precision,
    ARRAY['refugio', 'alojamiento', 'agua', 'primeros auxilios']::text[],
    '24 horas', true
  ),
  (
    'Parque Alí Primera',
    'Distrito Capital', 'Caracas',
    'Catia / Oeste, Caracas. Recepción de personas, atención médica primaria y coordinación de traslados desde La Guaira. Fuente: Cecodap — monitoreo en redes (24 jun 2026).',
    10.5086::double precision, -66.9486::double precision,
    ARRAY['refugio', 'atención médica', 'traslados', 'coordinación']::text[],
    'Activo', false
  ),
  (
    'Parque Generalísimo Francisco de Miranda (Parque del Este)',
    'Miranda', 'Caracas',
    'Municipio Sucre, Caracas (Los Palos Grandes, Sebucán). Resguardo para vecinos con daños en estructuras residenciales. Fuente: Cecodap (24 jun 2026).',
    10.4892::double precision, -66.8248::double precision,
    ARRAY['refugio', 'alojamiento', 'espacio abierto']::text[],
    'Activo', false
  ),
  (
    'Plaza Altamira',
    'Miranda', 'Chacao',
    'Municipio Chacao, Caracas. Resguardo de vecinos y clínica móvil. Fuente: Cecodap (24 jun 2026).',
    10.4969::double precision, -66.8534::double precision,
    ARRAY['refugio', 'clínica móvil', 'atención médica']::text[],
    'Activo', false
  ),
  (
    'Plaza Bolívar de Chacao',
    'Miranda', 'Chacao',
    'Municipio Chacao, Caracas. Carpas, insumos y centro de acopio para residentes de zonas aledañas. Fuente: Cecodap (24 jun 2026).',
    10.4961::double precision, -66.8539::double precision,
    ARRAY['refugio', 'carpas', 'acopio', 'insumos']::text[],
    'Activo', false
  ),
  (
    'Refugios temporales — Costa Oriental de Falcón (Tucacas)',
    'Falcón', 'Tucacas',
    'Refugios temporales de emergencia habilitados por la Gobernación de Falcón para personas con viviendas afectadas. Coordinación médica en Hospital Dr. Lino Arévalo, Tucacas. Colapso reportado en La Mar Suites. Fuente: Gobernador Víctor Clark (24 jun 2026).',
    10.8042::double precision, -68.3256::double precision,
    ARRAY['refugio', 'alojamiento', 'coordinación médica']::text[],
    'Activo', true
  )
) AS v(name, state, city, address, latitude, longitude, services, schedule, is_verified)
WHERE NOT EXISTS (
  SELECT 1 FROM shelters s WHERE s.name = v.name AND s.city = v.city
);

-- Actualizar Estadio García Carneiro con info verificada (BBC, Infobae, 24–26 jun 2026)
UPDATE shelters
SET
  address = 'Estadio de béisbol Jorge Luis García Carneiro, La Guaira (ex Estadio Fórum). Refugio temporal y centro de atención médica habilitado por autoridades regionales. Internet gratuito para comunicación — La Guaira con señal móvil limitada. Fuente: BBC Mundo, Infobae (24–26 jun 2026).',
  services = ARRAY['refugio', 'alojamiento', 'atención médica', 'internet gratuito', 'comunicación'],
  schedule = '24 horas',
  is_verified = true,
  updated_at = now()
WHERE name = 'Estadio Jorge Luis García Carneiro'
  AND city = 'La Guaira';
