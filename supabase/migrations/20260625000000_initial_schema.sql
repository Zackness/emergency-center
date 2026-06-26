-- Emergency Center — Schema inicial con RLS
-- Ejecutar en Supabase SQL Editor. El ORM de la app usa Prisma (prisma/schema.prisma).
-- Roles: admin, editor, volunteer (en profiles, via app_metadata recomendado en producción)

CREATE TYPE user_role AS ENUM ('admin', 'editor', 'volunteer');
CREATE TYPE operational_status AS ENUM ('operational', 'limited', 'closed', 'unknown');
CREATE TYPE help_center_type AS ENUM ('church', 'community', 'university', 'government', 'ngo');
CREATE TYPE agency_category AS ENUM ('civil_protection', 'firefighters', 'red_cross', 'police', 'government', 'mayor');
CREATE TYPE link_category AS ENUM ('missing', 'pets', 'news', 'official');
CREATE TYPE content_locale AS ENUM ('es', 'en', 'both');
CREATE TYPE guide_phase AS ENUM ('before', 'during', 'after');

-- Perfiles de usuario (vinculados a auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'volunteer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Centros de ayuda
CREATE TABLE help_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type help_center_type NOT NULL DEFAULT 'community',
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  phone TEXT,
  email TEXT,
  schedule TEXT,
  accepts TEXT[] NOT NULL DEFAULT '{}',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  phone TEXT,
  status operational_status NOT NULL DEFAULT 'unknown',
  services TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE shelters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  phone TEXT,
  capacity INTEGER,
  current_occupancy INTEGER,
  services TEXT[] NOT NULL DEFAULT '{}',
  schedule TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category agency_category NOT NULL,
  state TEXT,
  description TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE external_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  category link_category NOT NULL,
  locale content_locale NOT NULL DEFAULT 'both',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE news_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  locale content_locale NOT NULL DEFAULT 'both',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE emergency_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_es TEXT NOT NULL,
  label_en TEXT NOT NULL,
  number TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE volunteer_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  profession TEXT NOT NULL,
  specialty TEXT,
  vehicle TEXT,
  availability TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE company_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  resources TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE resource_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_es TEXT NOT NULL,
  title_en TEXT NOT NULL,
  content_es TEXT NOT NULL,
  content_en TEXT NOT NULL,
  phase guide_phase NOT NULL,
  file_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Funciones de autorización (usan profiles, no user_metadata)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION is_editor_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  );
$$;

-- Trigger para crear perfil al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'volunteer'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_guides ENABLE ROW LEVEL SECURITY;

-- Lectura pública de contenido activo
CREATE POLICY "Public read active help_centers" ON help_centers FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active hospitals" ON hospitals FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active shelters" ON shelters FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active agencies" ON agencies FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active external_links" ON external_links FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active news_items" ON news_items FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active emergency_numbers" ON emergency_numbers FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active resource_guides" ON resource_guides FOR SELECT USING (is_active = true);

-- Registros públicos (insert)
CREATE POLICY "Anyone can register as volunteer" ON volunteer_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can register company" ON company_registrations FOR INSERT WITH CHECK (true);

-- Solo admin puede publicar/modificar contenido
CREATE POLICY "Admin manage help_centers" ON help_centers FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin manage hospitals" ON hospitals FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin manage shelters" ON shelters FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin manage agencies" ON agencies FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin manage external_links" ON external_links FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin manage news_items" ON news_items FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin manage emergency_numbers" ON emergency_numbers FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin manage resource_guides" ON resource_guides FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Perfiles: usuarios ven su perfil, admin ve todos
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin manage profiles" ON profiles FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Admin lee registros
CREATE POLICY "Admin read volunteers" ON volunteer_registrations FOR SELECT USING (is_admin());
CREATE POLICY "Admin read companies" ON company_registrations FOR SELECT USING (is_admin());

-- Índices
CREATE INDEX idx_help_centers_state ON help_centers(state);
CREATE INDEX idx_hospitals_status ON hospitals(status);
CREATE INDEX idx_shelters_state ON shelters(state);
CREATE INDEX idx_external_links_category ON external_links(category);
CREATE INDEX idx_news_published ON news_items(published_at DESC);

-- Realtime para contenido público
ALTER PUBLICATION supabase_realtime ADD TABLE help_centers;
ALTER PUBLICATION supabase_realtime ADD TABLE hospitals;
ALTER PUBLICATION supabase_realtime ADD TABLE shelters;
