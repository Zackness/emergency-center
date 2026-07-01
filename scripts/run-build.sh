#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

FNM_ROOT="${HOME}/.local/share/fnm"
FNM_BIN="${FNM_ROOT}/fnm"
PREFERRED_NODE="${FNM_ROOT}/node-versions/v20.20.2/installation/bin"

use_node_from_path() {
  if [[ -x "${PREFERRED_NODE}/node" ]]; then
    export PATH="${PREFERRED_NODE}:${PATH}"
    echo "Usando Node de fnm (PATH directo): $(node -v)"
    return 0
  fi
  return 1
}

if use_node_from_path; then
  :
elif [[ -x "$FNM_BIN" ]]; then
  mkdir -p "${XDG_RUNTIME_DIR:-/tmp}/fnm_multishells" 2>/dev/null || true
  if eval "$("$FNM_BIN" env --shell bash)" 2>/dev/null; then
    "$FNM_BIN" use 20 2>/dev/null || true
    echo "Usando Node vía fnm env: $(node -v)"
  elif use_node_from_path; then
    :
  else
    echo "fnm no pudo activar Node; probando Node del sistema…" >&2
  fi
fi

NODE_MAJOR="$(node -p "Number(process.versions.node.split('.')[0])")"
if (( NODE_MAJOR < 20 )); then
  echo "Se requiere Node >= 20 (actual: $(node -v)). Ejecuta: npm run build:local" >&2
  exit 1
fi

echo "Node: $(node -v)"
echo "npm:  $(npm -v)"
npm run build:astro
