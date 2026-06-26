#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

FNM_BIN="${HOME}/.local/share/fnm/fnm"
if [[ -x "$FNM_BIN" ]]; then
  eval "$("$FNM_BIN" env --shell bash)"
  "$FNM_BIN" use 20
else
  echo "fnm no encontrado en ${FNM_BIN}" >&2
  exit 1
fi

echo "Node: $(node -v)"
echo "npm:  $(npm -v)"
npm run build:astro
