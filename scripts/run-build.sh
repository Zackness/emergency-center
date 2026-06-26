#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

FNM_BIN="${HOME}/.local/share/fnm/fnm"
if [[ -x "$FNM_BIN" ]]; then
  eval "$("$FNM_BIN" env --shell bash)"
  "$FNM_BIN" use 20
else
  NODE_MAJOR="$(node -p "Number(process.versions.node.split('.')[0])")"
  if (( NODE_MAJOR < 20 )); then
    echo "Se requiere Node >= 20. Instala fnm o actualiza Node (actual: $(node -v))." >&2
    exit 1
  fi
  echo "fnm no encontrado; usando Node del sistema: $(node -v)"
fi

echo "Node: $(node -v)"
echo "npm:  $(npm -v)"
npm run build:astro
