#!/usr/bin/env bash
# Ejecuta el scraping y sync completo de fuentes externas.
# Requiere Node 20+ (fnm/nvm) y .env configurado.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if command -v fnm >/dev/null 2>&1; then
  eval "$(fnm env --shell bash)"
  fnm use 20 >/dev/null 2>&1 || true
elif [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck source=/dev/null
  . "$HOME/.nvm/nvm.sh"
  nvm use 20 >/dev/null 2>&1 || true
fi

echo "Node: $(node -v 2>/dev/null || echo 'no encontrado')"
exec npx tsx --tsconfig tsconfig.json scripts/sync-all.ts "$@"
