-- Publicaciones locales de ayuda (oferta / solicitud), complemento a vzlayuda.com
CREATE TYPE community_help_kind AS ENUM ('offer', 'request');

CREATE TABLE community_help_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind community_help_kind NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  zone TEXT,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'emergency-center',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_help_posts_kind ON community_help_posts (kind);
CREATE INDEX idx_community_help_posts_state ON community_help_posts (state);

ALTER TABLE community_help_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active community_help_posts" ON community_help_posts
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin manage community_help_posts" ON community_help_posts
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
