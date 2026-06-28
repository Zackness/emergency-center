#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
DIRECT_URL=$(grep '^DIRECT_URL=' .env | cut -d= -f2- | tr -d $'\r"')

npx prisma db execute --stdin --url "$DIRECT_URL" <<'SQL'
SELECT 'donarseguro' AS check, domain AS value FROM allied_platforms WHERE lower(domain) LIKE '%donarseguro%' LIMIT 1;
SELECT 'zanapronto' AS check, domain AS value FROM allied_platforms WHERE lower(domain) LIKE '%zanapronto%' LIMIT 1;
SELECT 'ayudaencamino' AS check, domain AS value FROM allied_platforms WHERE lower(domain) LIKE '%ayudaencamino%' LIMIT 1;
SELECT 'gem' AS check, name AS value FROM help_centers WHERE name LIKE '%GEM & We Love%' LIMIT 1;
SELECT 'carora' AS check, name AS value FROM help_centers WHERE city ILIKE 'Carora' LIMIT 1;
SELECT 'verified_centers' AS check, COUNT(*)::text AS value FROM help_centers WHERE is_verified AND is_active;
SQL
