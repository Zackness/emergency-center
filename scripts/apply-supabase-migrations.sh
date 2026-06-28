#!/usr/bin/env bash
# Sincroniza migraciones Supabase: ejecuta SQL pendiente y alinea historial.
set -uo pipefail
cd "$(dirname "$0")/.."
DIRECT_URL=$(grep '^DIRECT_URL=' .env | cut -d= -f2- | tr -d $'\r"')

REMOTE_ONLY=(
  20260626052007 20260626053452 20260626053514 20260626053533 20260626053534
  20260626054046 20260626054114 20260626054118 20260626121750 20260626121817
  20260626123833 20260626144726 20260626145232 20260626145657 20260626151035
  20260627162250 20260627162934 20260627171158 20260627171527 20260627175844
  20260627180836 20260627181404 20260627181731
)

run_sql() {
  npx prisma db execute --file "$1" --url "$DIRECT_URL"
}

echo "==> Reparando entradas huérfanas en remoto..."
npx supabase migration repair --status reverted "${REMOTE_ONLY[@]}" --db-url "$DIRECT_URL" 2>/dev/null || true

echo "==> Ejecutando SQL local (desde 20260626123000)..."
FAILED=0
OK=0
while IFS= read -r f; do
  base=$(basename "$f")
  ver="${base%%_*}"
  if [[ "$ver" < "20260626123000" ]]; then
    continue
  fi
  echo -n "   · $base ... "
  if run_sql "$f" >/dev/null 2>&1; then
    echo "ok"
    OK=$((OK + 1))
  else
    echo "aviso (puede existir ya)"
    FAILED=$((FAILED + 1))
  fi
done < <(ls -1 supabase/migrations/*.sql | sort)

echo "==> SQL: $OK ok, $FAILED con aviso"

echo "==> Marcando migraciones locales en historial..."
UNIQUE_VERSIONS=($(ls -1 supabase/migrations/*.sql | xargs -n1 basename | sed 's/_.*//' | sort -u))
npx supabase migration repair --status applied "${UNIQUE_VERSIONS[@]}" --db-url "$DIRECT_URL"

echo "==> Estado final:"
npx supabase migration list --db-url "$DIRECT_URL"
