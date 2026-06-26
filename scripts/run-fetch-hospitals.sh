#!/usr/bin/env bash
set -eu
export FNM_PATH="/home/zackness/.local/share/fnm"
export PATH="$FNM_PATH:$PATH"
eval "$(fnm env --shell bash)"
fnm use 20 >/dev/null 2>&1 || true
cd /home/zackness/emergency-center
npx tsx --tsconfig tsconfig.json scripts/fetch-venezuela-hospitals.ts
