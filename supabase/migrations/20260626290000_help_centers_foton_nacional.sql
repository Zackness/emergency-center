-- FOTON Venezuela: red nacional de concesionarios y showrooms como centros de acopio
-- Fuente oficial: https://fotonvzla.com/concesionarios/ — @fotonvzla

INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, email, schedule, accepts, image_url, image_urls, is_verified, is_active
)
SELECT
  v.name,
  v.description,
  'community'::help_center_type,
  v.state,
  v.city,
  v.address,
  v.latitude,
  v.longitude,
  v.phone,
  v.email,
  v.schedule,
  v.accepts,
  NULL,
  ARRAY[]::text[],
  true,
  true
FROM (VALUES
  (
    'FOTON Acarigua — Centro de acopio',
    'Concesionario y showroom oficial FOTON Venezuela habilitado como centro de acopio. Operador: Llano Camiones, C.A. Recibe agua, alimentos, medicinas, ropa, higiene y material de rescate. fotonvzla.com/concesionarios — @fotonvzla',
    'Portuguesa', 'Acarigua', 'Av. Trino Melean, galpones Sumarca Nº 34, zona centro, Araure',
    9.5642, -69.2081, '+58 414-5021736', 'ventasllanocamiones@gmail.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'FOTON Cagua — Centro de acopio',
    'Concesionario oficial FOTON Venezuela habilitado como centro de acopio. Operador: Tracto Camiones Maracay, C.A. Instagram: @fotonmaracay. fotonvzla.com/concesionarios',
    'Aragua', 'Cagua', 'Carretera Nacional Cagua–La Villa, al lado del INTT, Cagua',
    10.1856, -67.4597, '+58 424-3433958', 'gteventascagua@tractocamionesmaracay.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'FOTON El Tigrito — Centro de acopio',
    'Concesionario oficial FOTON Venezuela habilitado como centro de acopio. Operador: Elite Truck, C.A. fotonvzla.com/concesionarios',
    'Anzoátegui', 'El Tigrito', 'Av. Intercomunal Tigre–El Tigrito, Edif. Elite Trucks, sector centro, San José de Guanipa',
    8.8893, -64.2451, '+58 424-1200447', 'ventas1@elitetrucksca.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'FOTON San Cristóbal — Centro de acopio',
    'Concesionario oficial FOTON Venezuela habilitado como centro de acopio. Operador: Foton Táchira C.A. fotonvzla.com/concesionarios',
    'Táchira', 'San Cristóbal', 'Av. 8 con Calle 8, Edif. Alconsa PB, Oficina 1, sector La Concordia',
    7.7694, -72.2252, '+58 412-9136819', 'gerenciafotontachira@gmail.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'FOTON Barquisimeto — Centro de acopio',
    'Showroom oficial FOTON Venezuela habilitado como centro de acopio. Operador: Inversiones Inter Mundial 2020, C.A. fotonvzla.com/concesionarios',
    'Lara', 'Barquisimeto', 'Final de la Av. Lara, al lado de Pollos Arturo (Showroom Bqto)',
    10.062, -69.318, '+58 424-5970007', 'ventas2@fotonyaritagua.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'FOTON Valencia — Centro de acopio',
    'Concesionario oficial FOTON Venezuela habilitado como centro de acopio. Operador: Jinhua Motors, C.A. fotonvzla.com/concesionarios',
    'Carabobo', 'Valencia', 'Final Prolongación Av. Lisandro Alvarado, vía de Servicio, sector La Guacamaya',
    10.2186, -68.0065, '+58 414-0424177', NULL,
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'FOTON Puerto La Cruz — Centro de acopio',
    'Concesionario oficial FOTON Venezuela habilitado como centro de acopio. Operador: Metrocamión, C.A. fotonvzla.com/concesionarios',
    'Anzoátegui', 'Puerto La Cruz', 'Av. Alberto Ravell, local Fuerza Trucks, sector Paseo Colón',
    10.2105, -64.6322, '+58 424-5852367', 'ventas@metrocamion.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'FOTON Porlamar — Centro de acopio',
    'Taller autorizado FOTON Venezuela habilitado como centro de acopio. Operador: Automotriz Vázquez, C.A. fotonvzla.com/concesionarios',
    'Nueva Esparta', 'Porlamar', 'Av. Juan Bautista Arismendi, sector Macho Muerto, Porlamar',
    10.9577, -63.8697, '+58 412-3530137', NULL,
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'FOTON Guarenas — Centro de acopio',
    'Concesionario oficial FOTON Venezuela habilitado como centro de acopio. Operador: Metrocamión, C.A. fotonvzla.com/concesionarios',
    'Miranda', 'Guarenas', 'Av. Intercomunal Guarenas–Guatire, frente a la Villa Panamericana, Guarenas',
    10.4686, -66.5427, '+58 424-5852367', 'ventas@fotoncaracas.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'FOTON El Vigía — Centro de acopio',
    'Concesionario oficial FOTON Venezuela habilitado como centro de acopio. Operador: Autocamiones Chama, C.A. fotonvzla.com/concesionarios',
    'Mérida', 'El Vigía', 'Ctra. vía Mérida, Edif. Industrial Vigía PB, sector Buenos Aires',
    8.6131, -71.6573, '+58 424-7458389', 'emolinafotonelvigia@gmail.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'FOTON Maracaibo — Centro de acopio',
    'Concesionario oficial FOTON Venezuela habilitado como centro de acopio. Operador: Auto Total, C.A. fotonvzla.com/concesionarios',
    'Zulia', 'Maracaibo', 'Av. 68 con calle 148, Zona Industrial de Maracaibo',
    10.65, -71.63, '+58 424-6256361', 'asesor.comercial@autototalca.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'FOTON Maracay — Centro de acopio',
    'Concesionario oficial FOTON Venezuela habilitado como centro de acopio. Operador: Tracto Camiones Maracay, C.A. Instagram: @fotonmaracay. fotonvzla.com/concesionarios',
    'Aragua', 'Maracay', 'Urb. San Jacinto, Av. Bolívar Nro. A-1 y A-2, frente al Parque de Ferias',
    10.2468, -67.5951, '+58 424-3433958', 'gteventasmaracay@tractocamionesmaracay.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'FOTON Maturín — Centro de acopio',
    'Concesionario oficial FOTON Venezuela habilitado como centro de acopio. Operador: Monagas Trucks C.A. fotonvzla.com/concesionarios',
    'Monagas', 'Maturín', 'Av. Alirio Ugarte Pelayo, Edif. Changan PB local 2, sector Tipuro',
    9.7451, -63.1832, '+58 424-8764969', 'ventas1@monagastrucks.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'FOTON Caracas — Centro de acopio',
    'Showroom oficial FOTON Venezuela habilitado como centro de acopio. Operador: Metrocamión, C.A. Urb. Santa Mónica. fotonvzla.com/concesionarios',
    'Distrito Capital', 'Caracas', 'Av. Teresa de la Parra, local C PB, Urb. Santa Mónica (Showroom)',
    10.4892, -66.8578, '+58 414-3520283', NULL,
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'FOTON Yaritagua — Centro de acopio',
    'Concesionario oficial FOTON Venezuela habilitado como centro de acopio. Operador: Inversiones Inter Mundial 2020, C.A. fotonvzla.com/concesionarios',
    'Yaracuy', 'Yaritagua', 'Av. Cimarrón Andresote, Parque Industrial del Este parcela 53, sector Pueblo Nuevo',
    10.0746, -68.6974, '+58 424-5970007', 'info@fotonyaritagua.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  )
) AS v(name, description, state, city, address, latitude, longitude, phone, email, schedule, accepts)
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers h
  WHERE h.name = v.name AND h.is_active = true
);
