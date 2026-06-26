-- Enlaces a plataformas de desaparecidos (ejecutar en Supabase SQL Editor si ya tienes las tablas)
INSERT INTO external_links (title, description, url, category, locale, is_verified, is_active, sort_order)
VALUES
  (
    'VenApp',
    'Plataforma oficial para reportar desaparecidos y daños',
    'https://venapp.com',
    'missing',
    'both',
    true,
    true,
    1
  ),
  (
    'Desaparecidos Terremoto Venezuela',
    'Herramienta ciudadana para reportar y buscar personas desaparecidas tras el sismo del 24 de junio',
    'https://desaparecidosterremotovenezuela.com/',
    'missing',
    'both',
    false,
    true,
    2
  ),
  (
    'Venezuela Te Busca',
    'Iniciativa ciudadana para reconectar familias tras el terremoto',
    'https://venezuelatebusca.com/',
    'missing',
    'both',
    false,
    true,
    4
  );
