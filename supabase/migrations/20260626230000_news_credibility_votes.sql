-- Votación comunitaria de credibilidad en noticias

CREATE TYPE news_vote_verdict AS ENUM ('credible', 'false');

CREATE TABLE news_credibility_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_item_id UUID NOT NULL REFERENCES news_items(id) ON DELETE CASCADE,
  verdict news_vote_verdict NOT NULL,
  voter_token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (news_item_id, voter_token)
);

CREATE INDEX idx_news_credibility_votes_item ON news_credibility_votes(news_item_id);

ALTER TABLE news_credibility_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read news votes" ON news_credibility_votes
  FOR SELECT USING (true);

-- Escrituras públicas deshabilitadas en REST; usar APIs del servidor.
