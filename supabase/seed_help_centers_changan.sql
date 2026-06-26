-- Changan Venezuela: red nacional de concesionarios como centros de acopio
-- Campaña «Unidos en solidaridad por Venezuela» (@changanvenezuela)
-- Flyer: /images/help-centers/changan-solidaridad-venezuela.png

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
  '/images/help-centers/changan-solidaridad-venezuela.png',
  ARRAY['/images/help-centers/changan-solidaridad-venezuela.png'],
  true,
  true
FROM (VALUES
  (
    'Changan Caracas — Centro de acopio',
    'Campaña «Unidos en solidaridad por Venezuela» de Changan Venezuela. Concesionario en Los Palos Grandes. Herramientas de rescate, EPP, linternas, agua, alimentos, insumos médicos y ropa. @changanvenezuela',
    'Miranda', 'Caracas', 'Av. Francisco de Miranda, Los Palos Grandes (Chacao), local PB',
    10.4965::float8, -66.8485::float8, '+58 412-6028930', 'informacion@changanvzla.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'Changan Valencia — Centro de acopio',
    'Campaña «Unidos en solidaridad por Venezuela» de Changan Venezuela. Concesionario en San Diego. @changanvalencia',
    'Carabobo', 'Valencia', 'Av. 71, Parque Comercio Industrial Castillito, parcela CMV-35, San Diego',
    10.2092, -67.9641, '+58 414-5177023', 'informacion@changanvzla.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'Changan Barquisimeto — Centro de acopio',
    'Campaña «Unidos en solidaridad por Venezuela» de Changan Venezuela. @changanbarquisimeto',
    'Lara', 'Barquisimeto', 'Av. Bracamonte entre Av. Libertador y Av. Venezuela, zona este',
    10.0652, -69.3054, '+58 424-5918648', 'informacion@changanvzla.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'Changan Maracaibo — Centro de acopio',
    'Campaña «Unidos en solidaridad por Venezuela» de Changan Venezuela. @changanmaracaibo',
    'Zulia', 'Maracaibo', 'Calle 20 entre Av. 15 y 15A-1, local Millennium, sector Canchancha',
    10.6643, -71.6264, '+58 414-7429822', 'informacion@changanvzla.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'Changan Maracay — Centro de acopio',
    'Campaña «Unidos en solidaridad por Venezuela» de Changan Venezuela. @changanmaracay',
    'Aragua', 'Maracay', 'Av. Bolívar c/c Av. Primera Norte Sur, Urb. San Jacinto',
    10.2468, -67.5951, '+58 424-3776994', 'informacion@changanvzla.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'Changan Acarigua — Centro de acopio',
    'Campaña «Unidos en solidaridad por Venezuela» de Changan Venezuela. @changanacarigua',
    'Portuguesa', 'Acarigua', 'Av. Trino Melean, galpones Sumarca Nº 34, Araure',
    9.5642, -69.2081, '+58 412-2011745', 'informacion@changanvzla.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'Changan Barinas — Centro de acopio',
    'Campaña «Unidos en solidaridad por Venezuela» de Changan Venezuela. @changanbarinas',
    'Barinas', 'Barinas', 'Av. Los Andes, Edif. Hobby Piso 1, Urb. Alto Barinas',
    8.6224, -70.2071, '+58 414-3734343', 'informacion@changanvzla.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'Changan San Cristóbal — Centro de acopio',
    'Campaña «Unidos en solidaridad por Venezuela» de Changan Venezuela. @changansancristobal',
    'Táchira', 'San Cristóbal', 'Av. 8 con Calle 8, Edif. Alconsa PB, sector La Concordia',
    7.7694, -72.2252, '+58 412-9136819', 'informacion@changanvzla.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'Changan Coro — Centro de acopio',
    'Campaña «Unidos en solidaridad por Venezuela» de Changan Venezuela. @changanfalcon',
    'Falcón', 'Coro', 'Av. Prolongación Manaure esq. Av. Tirso Salavarria, sector San Antonio',
    11.4052, -69.6814, '+58 414-3972319', 'informacion@changanvzla.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'Changan El Vigía — Centro de acopio',
    'Campaña «Unidos en solidaridad por Venezuela» de Changan Venezuela. @changanelvigia',
    'Mérida', 'El Vigía', 'Av. Bolívar, sector Sur América',
    8.6131, -71.6573, '+58 424-7578733', 'informacion@changanvzla.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'Changan El Tigre — Centro de acopio',
    'Campaña «Unidos en solidaridad por Venezuela» de Changan Venezuela. @changaneltigrito',
    'Anzoátegui', 'El Tigre', 'Av. Intercomunal, Edif. Elite PB, San José de Guanipa',
    8.8893, -64.2451, '+58 414-8177199', 'informacion@changanvzla.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'Changan Puerto La Cruz — Centro de acopio',
    'Campaña «Unidos en solidaridad por Venezuela» de Changan Venezuela. @changanptolacruz',
    'Anzoátegui', 'Puerto La Cruz', 'Av. Alberto Ravell, local Fuerza Trucks, sector Paseo Colón',
    10.2105, -64.6322, '+58 424-5510580', 'informacion@changanvzla.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'Changan Maturín — Centro de acopio',
    'Campaña «Unidos en solidaridad por Venezuela» de Changan Venezuela. @changanmaturin',
    'Monagas', 'Maturín', 'Av. Alirio Ugarte Pelayo, Edif. Changan PB local 2, sector Tipuro',
    9.7451, -63.1832, NULL, 'informacion@changanvzla.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'Changan Puerto Ordaz — Centro de acopio',
    'Campaña «Unidos en solidaridad por Venezuela» de Changan Venezuela. @changanpuertoordaz',
    'Bolívar', 'Puerto Ordaz', 'Calle Tucupita, Edif. Tomasi Hermanos PB, sector Castillito',
    8.2895, -62.7371, NULL, 'informacion@changanvzla.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  ),
  (
    'Changan San Juan de los Morros — Centro de acopio',
    'Campaña «Unidos en solidaridad por Venezuela» de Changan Venezuela. @changanguarico',
    'Guárico', 'San Juan de los Morros', 'Estacionamiento Traki, San Juan de los Morros',
    9.9112, -67.3543, NULL, 'informacion@changanvzla.com',
    'Horario del concesionario — confirmar en sitio',
    ARRAY['water','food','medicine','clothing','hygiene','blankets']::text[]
  )
) AS v(name, description, state, city, address, latitude, longitude, phone, email, schedule, accepts)
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers h
  WHERE h.name = v.name AND h.is_active = true
);
