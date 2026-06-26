-- Mapa de daños: reportes ciudadanos de estructuras afectadas por el sismo
-- Inspirado en terremotovenezuela.com (se cita como fuente en la app)

CREATE TYPE damage_severity AS ENUM ('collapsed', 'damaged', 'evacuated');

CREATE TABLE damage_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  severity damage_severity NOT NULL DEFAULT 'damaged',
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  description TEXT,
  reporter_name TEXT,
  reporter_contact TEXT,
  source_name TEXT,
  source_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_damage_reports_severity ON damage_reports(severity);
CREATE INDEX idx_damage_reports_state ON damage_reports(state);

ALTER TABLE damage_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active damage_reports" ON damage_reports
  FOR SELECT USING (is_active = true);

-- Escrituras públicas deshabilitadas en REST; usar APIs del servidor.

CREATE POLICY "Admin manage damage_reports" ON damage_reports
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

ALTER PUBLICATION supabase_realtime ADD TABLE damage_reports;
