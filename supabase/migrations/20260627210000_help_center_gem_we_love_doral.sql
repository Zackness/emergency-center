-- GEM & We Love Foundation — centro de acopio verificado en Doral, Florida (ayuda a Venezuela)

INSERT INTO help_centers (
  name, description, type, state, city, address, latitude, longitude,
  phone, schedule, accepts, image_url, image_urls, is_verified, is_active
)
SELECT
  'GEM & We Love Foundation — Doral',
  'Centro de acopio verificado en Doral, Florida. Alianza entre Global Empowerment Mission (GEM) y We Love Foundation para recolectar donaciones en especie destinadas a familias afectadas por el terremoto en Venezuela. Reciben alimentos no perecederos, agua embotellada, kits de higiene, insumos médicos, artículos para mascotas y suministros de emergencia. Los envíos se coordinan hacia Venezuela con equipos en terreno. Voluntarios bienvenidos en horario de atención.',
  'ngo',
  'Florida',
  'Doral',
  '1850 NW 84th Ave #100, Doral, FL 33126, Estados Unidos',
  25.79124,
  -80.33316,
  NULL,
  'Lun–Vie 9:00 a.m.–4:00 p.m.',
  ARRAY['water', 'food', 'medicine', 'clothing', 'hygiene', 'bathroom_supplies', 'blankets'],
  NULL,
  ARRAY[]::text[],
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM help_centers WHERE name = 'GEM & We Love Foundation — Doral'
);

UPDATE help_centers SET
  description = 'Centro de acopio verificado en Doral, Florida. Alianza entre Global Empowerment Mission (GEM) y We Love Foundation para recolectar donaciones en especie destinadas a familias afectadas por el terremoto en Venezuela. Reciben alimentos no perecederos, agua embotellada, kits de higiene, insumos médicos, artículos para mascotas y suministros de emergencia. Los envíos se coordinan hacia Venezuela con equipos en terreno. Voluntarios bienvenidos en horario de atención.',
  type = 'ngo',
  state = 'Florida',
  city = 'Doral',
  address = '1850 NW 84th Ave #100, Doral, FL 33126, Estados Unidos',
  latitude = 25.79124,
  longitude = -80.33316,
  schedule = 'Lun–Vie 9:00 a.m.–4:00 p.m.',
  accepts = ARRAY['water', 'food', 'medicine', 'clothing', 'hygiene', 'bathroom_supplies', 'blankets'],
  is_verified = true,
  is_active = true,
  updated_at = now()
WHERE name = 'GEM & We Love Foundation — Doral';
