#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
DIRECT_URL=$(grep '^DIRECT_URL=' .env | cut -d= -f2- | tr -d $'\r"')
npx supabase migration list --db-url "$DIRECT_URL"
