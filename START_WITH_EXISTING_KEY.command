#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Install Node.js 24.15 or newer first, then run again."
  exit 1
fi
node scripts/restore-meta.mjs
bash start.sh
