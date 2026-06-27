-- Plataformas aliadas gestionables desde el panel admin

CREATE TYPE allied_platform_color AS ENUM ('blue', 'yellow', 'red');

CREATE TABLE allied_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  url TEXT NOT NULL,
  description_es TEXT NOT NULL,
  description_en TEXT NOT NULL,
  color allied_platform_color NOT NULL DEFAULT 'blue',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_allied_platforms_domain ON allied_platforms (lower(domain));
CREATE INDEX idx_allied_platforms_active_sort ON allied_platforms (is_active, sort_order);

ALTER TABLE allied_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active allied_platforms" ON allied_platforms
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin manage allied_platforms" ON allied_platforms
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

INSERT INTO allied_platforms (domain, url, description_es, description_en, color, sort_order) VALUES
  ('hospitalesenvenezuela.com', 'https://hospitalesenvenezuela.com', 'Busca por nombre o cédula si un familiar está ingresado en un hospital.', 'Search by name or ID if a relative is admitted to a hospital.', 'blue', 10),
  ('centroacopio.site', 'https://centroacopio.site/', 'Red nacional de centros de acopio y voluntarios de delivery gratuito.', 'National network of collection centers and free delivery volunteers.', 'yellow', 20),
  ('vzlayuda.com', 'https://vzlayuda.com', 'Encuentra o brinda ayuda cerca de ti. Sin cuentas, al instante.', 'Find or offer help near you. No accounts needed, instantly.', 'yellow', 25),
  ('terremotovenezuela.com', 'https://terremotovenezuela.com', 'Mapa de daños: edificios afectados reportados por la comunidad.', 'Damage map: community-reported affected buildings.', 'red', 30),
  ('habitable.lovable.app', 'https://habitable.lovable.app/', 'Ingenieros por Venezuela: registro de ingenieros voluntarios e inspección de edificios dañados.', 'Ingenieros por Venezuela: volunteer engineer registration and damaged building inspections.', 'blue', 40),
  ('interp-aid.lovable.app', 'https://interp-aid.lovable.app/', 'Red de intérpretes voluntarios: conecta traductores con brigadas de rescate internacionales.', 'Volunteer interpreter network: connects translators with international rescue brigades.', 'blue', 50),
  ('primeros-auxilios-psicologicos-ve.netlify.app', 'https://primeros-auxilios-psicologicos-ve.netlify.app/', 'Protocolo de Primeros Auxilios Psicológicos (PAP): guía clínica para acompañar en crisis tras el terremoto.', 'Psychological First Aid (PFA) protocol: clinical guide for crisis support after the earthquake.', 'blue', 60),
  ('terremotovenezuela.app', 'https://terremotovenezuela.app', 'Reportes, desaparecidos y mapa de emergencia.', 'Reports, missing persons and emergency map.', 'blue', 70),
  ('venezuelatebusca.com', 'https://venezuelatebusca.com', 'Busca familiares o amigos desaparecidos.', 'Search for missing family or friends.', 'yellow', 80),
  ('huellascan.com', 'https://www.huellascan.com/terremoto', 'Mascotas perdidas y encontradas tras el terremoto.', 'Lost and found pets after the earthquake.', 'yellow', 90),
  ('sismovenezuela.com', 'https://sismovenezuela.com', 'Mapa de calor consolidando múltiples fuentes.', 'Heat map consolidating multiple sources.', 'red', 100),
  ('venezuelareporta.org', 'https://venezuelareporta.org', 'Registro y consulta de personas desaparecidas.', 'Registry and lookup of missing persons.', 'red', 110),
  ('desaparecidosterremotovenezuela.com', 'https://desaparecidosterremotovenezuela.com', 'Directorio de desaparecidos tras el terremoto.', 'Directory of missing persons after the earthquake.', 'blue', 120),
  ('ayudavenezuela.app', 'https://ayudavenezuela.app', 'Coordinación de ayuda y emergencias.', 'Aid and emergency coordination.', 'yellow', 130),
  ('ayudasismo.org', 'https://ayudasismo.org', 'Ayuda y coordinación ante sismos.', 'Earthquake aid and coordination.', 'red', 140);
