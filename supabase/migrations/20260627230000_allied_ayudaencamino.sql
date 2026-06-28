-- Ayuda en Camino: coordinación de donaciones y necesidades en tiempo real
INSERT INTO allied_platforms (domain, url, description_es, description_en, color, sort_order)
SELECT
  'ayudaencamino.com',
  'https://ayudaencamino.com',
  'Coordinación de ayuda: ONGs y acopios publican necesidades en tiempo real; tú eliges qué llevar y dónde entregar.',
  'Aid coordination: NGOs and collection points publish real-time needs; you choose what to bring and where to deliver.',
  'yellow'::allied_platform_color,
  18
WHERE NOT EXISTS (
  SELECT 1 FROM allied_platforms WHERE lower(domain) = lower('ayudaencamino.com')
);
