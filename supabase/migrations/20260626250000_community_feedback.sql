-- Votación y comentarios comunitarios en todo el contenido de la plataforma

CREATE TYPE community_content_type AS ENUM (
  'help_center',
  'hospital',
  'shelter',
  'agency',
  'damage_report',
  'missing_person',
  'news',
  'solidarity_company',
  'external_link'
);

CREATE TYPE community_vote_verdict AS ENUM ('credible', 'false');

CREATE TABLE community_credibility_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type community_content_type NOT NULL,
  content_id TEXT NOT NULL,
  verdict community_vote_verdict NOT NULL,
  voter_token TEXT NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (content_type, content_id, voter_token)
);

CREATE INDEX idx_community_votes_content
  ON community_credibility_votes (content_type, content_id);

CREATE TABLE community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type community_content_type NOT NULL,
  content_id TEXT NOT NULL,
  body TEXT NOT NULL,
  author_name TEXT,
  voter_token TEXT,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_comments_content
  ON community_comments (content_type, content_id, created_at DESC);

ALTER TABLE community_credibility_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read community votes" ON community_credibility_votes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read active comments" ON community_comments
  FOR SELECT USING (is_active = true);

-- Escrituras públicas deshabilitadas en REST; usar APIs del servidor.

-- Migrar votos de noticias existentes al sistema unificado
INSERT INTO community_credibility_votes (content_type, content_id, verdict, voter_token, created_at, updated_at)
SELECT
  'news'::community_content_type,
  news_item_id::text,
  verdict::text::community_vote_verdict,
  voter_token,
  created_at,
  updated_at
FROM news_credibility_votes
ON CONFLICT (content_type, content_id, voter_token) DO NOTHING;
