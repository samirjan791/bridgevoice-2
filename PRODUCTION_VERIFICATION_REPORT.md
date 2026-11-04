# BridgeVoice 4.4 — verification report

This is a **production review candidate, not a production-approved build**.

## Changes in this pass
- Dari voice preview now blocks fa-IR pronunciation without explicit consent.
- Installed voice previews hide fa-IR voices until agreement is enabled.
- A stale selected Dari voice cannot be previewed without consent.
- Disabling remembered access removes the persisted access code immediately.
- With agreement enabled, the Agent may select an installed fa-IR voice if no Dari voice exists.

## Verification performed
- Inspected Settings, agent voice selection, and access-test route.
- Attempted `npm test` and `npm run typecheck`: **blocked** because local dependencies are not installed (`vitest` and `next` not found).
- Current environment Node is v22.16.0; package requires >=24.15.0.
- No physical iPhone tests, live Meta requests, or deployed Cloudflare checks were performed.
- The existing live deployment and public GitHub repository were not modified.

## Required before production
1. On Node >=24.15: `npm ci && npm run typecheck && npm test && npm run build`.
2. Verify no unauthorized requests pass the access gate; verify a real authorized Meta reply.
3. Check phone microphone, interruption, Pashto/Dari speech, and both themes.
4. Scan the full repository and git history for credentials before public push.
5. Deploy only from a verified tree, preserving Cloudflare variables and secrets.

Browser voice recognition cannot reliably honor a microphone-device preference. Pashto/Dari support is device-dependent. Local storage is not encrypted. The process-local daily quota is not a billing cap. BridgeCall is a simulation.
