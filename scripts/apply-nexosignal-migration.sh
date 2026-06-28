#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
DIRECT_URL=$(grep '^DIRECT_URL=' .env | cut -d= -f2- | tr -d $'\r"')
npx prisma db execute --file supabase/migrations/20260628130000_allied_nexosignal_ninos.sql --url "$DIRECT_URL"
npx supabase migration repair --status applied 20260628130000 --db-url "$DIRECT_URL"
echo "OK: busca.nexosignal.co"
