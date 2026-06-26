-- Sugerencias de features desde la comunidad

CREATE TYPE feature_suggestion_status AS ENUM ('pending', 'reviewed', 'accepted', 'rejected');

CREATE TABLE feature_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  contact_name TEXT,
  contact_email TEXT,
  status feature_suggestion_status NOT NULL DEFAULT 'pending',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_feature_suggestions_status ON feature_suggestions(status);
CREATE INDEX idx_feature_suggestions_created ON feature_suggestions(created_at DESC);

ALTER TABLE feature_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can suggest feature" ON feature_suggestions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin read feature suggestions" ON feature_suggestions
  FOR SELECT USING (is_admin());

CREATE POLICY "Admin manage feature suggestions" ON feature_suggestions
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
