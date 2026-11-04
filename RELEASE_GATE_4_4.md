# BridgeVoice 4.4 release gate — November 2, 2026

## Completed here
- Added `scripts/verify-release.mjs`, a dependency-free offline preflight (10/10 checks pass). Run: `node scripts/verify-release.mjs`.
- Confirmed the archive contains no `.env.local`.
- Reviewed the Dari speech server gate and the agent's installed-voice fallback logic; the existing consent protections remain in place.
- Confirmed that agent CSS contains a global dark-mode override.
- Did **not** change the live site or public repository.

## Blocked and NOT verified
- The available runtime is Node 22.16.0, while package.json requires >=24.15.0.
- `npm ci --ignore-scripts --no-audit --no-fund` failed in this environment (`Exit handler never called`); dependencies are incomplete. Consequently typecheck, unit tests, and Next.js build have not passed.
- No real iPhone, browser screenshot, real Meta call, Cloudflare deployment, or GitHub push was performed.
- Offline preflight checks only source markers, not behavior. Do not mistake them for production approval.

## Run on a Node 24.15+ machine
```sh
node --version
npm ci
node scripts/verify-release.mjs
npm run typecheck
npm test
npm run build
```
If all pass, manually test browser voice, interruptions, dark/light and all Settings controls, then gate endpoints using non-recorded credentials. Do not put the access code in shell history or logs. Deploy only after approval and only using the documented `--keep-vars` path while the Meta key remains a plain variable. Do not push to a public repo without reviewing both working tree and git history for secrets.

## Manual checks still required
- Unauthorized chat returns 401; authorized chat returns a real Meta reply; `/api/status` reports accurately.
- Voice pause/auto-send, echo-guard interruption, all orb states, typed fallback, memory-only transcript.
- Reload persistence, Dari agreement, microphone and voice selection, confirmation dialogs.
- Desktop/phone screenshots in light and dark with all sensitive information redacted.
- Real iPhone mic permissions and Pashto/Dari speech and preview.

## Product limits
Microphone picker cannot guarantee Web Speech recognition device selection. Pashto/Dari speech support varies by device. Local storage is not encrypted. Daily quota is process-local, not a billing cap. BridgeCall is simulated. The agent has no phone-calling or software-building powers.
