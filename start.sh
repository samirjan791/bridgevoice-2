#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Please install Node.js 24 LTS (24.15 or newer) from https://nodejs.org, then run this script again."
  exit 1
fi
node -e 'if (Number(process.versions.node.split(".")[0]) < 24 || (Number(process.versions.node.split(".")[0]) === 24 && Number(process.versions.node.split(".")[1]) < 15)) { console.error("Node.js 24 LTS (24.15 or newer) is required."); process.exit(1); }'
if [ ! -d node_modules ]; then
  npm ci --no-audit --no-fund
fi
export NEXT_TELEMETRY_DISABLED=1
printf '\nBridgeVoice is starting. Open http://localhost:3000\nPress Control+C to stop.\n\n'
npm run dev
