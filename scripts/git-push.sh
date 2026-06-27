#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

git add -A
git reset HEAD .env 2>/dev/null || true

git commit -F - <<'EOF'
Publicar inventario de centros verificados, acopios Carora y portal coordinador.

Los centros verificados muestran inventario y necesidades en el directorio publico con actualizacion en tiempo real; se anaden acopios en Carora, auth OTP/coordinadores/admin y migraciones de inventario.
EOF

git push -u origin HEAD
