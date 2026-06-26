-- Hub híbrido de personas desaparecidas: fuentes externas, agregador y registro propio

CREATE TYPE source_registration_type AS ENUM ('official', 'community', 'ngo', 'social_media', 'form');
CREATE TYPE external_source_status AS ENUM ('active', 'down', 'unverified');
CREATE TYPE missing_person_verification_status AS ENUM (
  'unverified',
  'family_verified',
  'org_verified',
  'found',
  'deceased'
);
CREATE TYPE duplicate_match_status AS ENUM ('pending', 'confirmed', 'rejected');

CREATE TABLE external_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  registration_type source_registration_type NOT NULL DEFAULT 'community',
  approximate_count INTEGER,
  last_updated_at TIMESTAMPTZ,
  status external_source_status NOT NULL DEFAULT 'unverified',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE missing_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  last_seen_location TEXT,
  last_seen_at TIMESTAMPTZ,
  description TEXT,
  photo_url TEXT,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  verification_status missing_person_verification_status NOT NULL DEFAULT 'unverified',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE external_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  missing_person_id UUID REFERENCES missing_persons(id) ON DELETE SET NULL,
  source_id UUID NOT NULL REFERENCES external_sources(id),
  external_url TEXT,
  external_reference TEXT,
  display_name TEXT NOT NULL,
  notes TEXT,
  last_verified_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE duplicate_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_person_id UUID NOT NULL REFERENCES missing_persons(id) ON DELETE CASCADE,
  matched_person_id UUID REFERENCES missing_persons(id) ON DELETE SET NULL,
  matched_external_record_id UUID REFERENCES external_records(id) ON DELETE SET NULL,
  confidence DOUBLE PRECISION,
  status duplicate_match_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_external_sources_status ON external_sources(status);
CREATE INDEX idx_missing_persons_verification ON missing_persons(verification_status);
CREATE INDEX idx_missing_persons_state ON missing_persons(state);
CREATE INDEX idx_external_records_person ON external_records(missing_person_id);
CREATE INDEX idx_external_records_source ON external_records(source_id);
CREATE INDEX idx_duplicate_matches_primary ON duplicate_matches(primary_person_id);
CREATE INDEX idx_duplicate_matches_status ON duplicate_matches(status);

ALTER TABLE external_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE missing_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplicate_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active external_sources" ON external_sources
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read active missing_persons" ON missing_persons
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read active external_records" ON external_records
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can register missing person" ON missing_persons
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can link external record" ON external_records
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin manage external_sources" ON external_sources
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admin manage missing_persons" ON missing_persons
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admin manage external_records" ON external_records
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admin manage duplicate_matches" ON duplicate_matches
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

ALTER PUBLICATION supabase_realtime ADD TABLE missing_persons;
