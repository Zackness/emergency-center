-- Fuentes externas para el hub de desaparecidos (ejecutar tras 20260625220000_missing_persons_hub.sql)
INSERT INTO external_sources (
  slug, name, description, url, registration_type, status, is_verified, is_active, sort_order, last_updated_at
)
VALUES
  (
    'venapp',
    'VenApp',
    'Plataforma oficial del gobierno para reportar desaparecidos y daños en viviendas.',
    'https://venapp.com',
    'official',
    'active',
    true,
    true,
    1,
    '2026-06-25T12:00:00Z'
  ),
  (
    'desaparecidos-terremoto',
    'Desaparecidos Terremoto Venezuela',
    'Herramienta ciudadana voluntaria para reportar y buscar personas tras el sismo del 24 de junio.',
    'https://desaparecidosterremotovenezuela.com/',
    'community',
    'active',
    false,
    true,
    2,
    '2026-06-25T18:00:00Z'
  ),
  (
    'venezuela-te-busca',
    'Venezuela Te Busca',
    'Iniciativa ciudadana para reconectar familias y facilitar la búsqueda de personas desaparecidas.',
    'https://venezuelatebusca.com/',
    'community',
    'active',
    false,
    true,
    3,
    '2026-06-26T03:53:00Z'
  ),
  (
    'encuentralos',
    'Encuéntralos',
    'Herramienta ciudadana, gratuita y sin fines de lucro para reportar y ayudar a localizar personas desaparecidas tras el sismo. Permite reportar sin registro y también lista refugios, donaciones, puntos de entrega, zonas afectadas y mascotas.',
    'https://encuentralos.tecnosoft.dev/',
    'community',
    'active',
    false,
    true,
    4,
    '2026-06-26T04:21:00Z'
  ),
  (
    'startupven',
    'StartupVen Responde',
    'Registro de respaldo y centralización cuando otras plataformas no cubren un caso.',
    'https://startupven.com',
    'form',
    'active',
    true,
    true,
    99,
    NULL
  )
ON CONFLICT (slug) DO NOTHING;
