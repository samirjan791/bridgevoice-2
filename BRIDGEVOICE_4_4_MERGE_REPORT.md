# BridgeVoice 4.4 merge report

Base: user-supplied 4.3 archive. Donor: White Agent + Settings v3 archive.

## Preserved
Existing 4.3 agent voice recognition, streaming Meta chat, interruption/echo guard, typed fallback, routes, tests, quota and access gate.

## Added or changed
Settings v3 and v2 migration, versioned persistence, global appearance, agent title/language/transcript/orb preferences, per-language voice preferences, speech rate, mic picker, access-code test route, export/reset controls, and the donor-inspired white agent visual treatment adapted to dark mode.

## Important limitations
The microphone picker stores a preference but browser SpeechRecognition does not expose a reliable device-selection API. Pashto/Dari recognition and synthesis require actual browser/device testing. Speech recognition may stop or fail to interrupt on certain devices. The agent is a voice-only conversational assistant, not a software executor or telephone caller. Browser storage is unencrypted. Process-local quota is not a billing cap.

## Verification
ZIP integrity and source presence checked. Dependency installation timed out in the provided environment and Node v22.16 is below the required >=24.15; typecheck, tests, live chat and phone tests are NOT verified. No deployment or public-repository push was performed.

## Safe deployment
Run npm ci, npm run typecheck, npm test, npm run build on Node >=24.15. Confirm access gate returns 401, test a real Meta chat, verify both themes and device voice, and perform secret scanning before pushing. If using Cloudflare deployment, preserve existing variables/secrets and follow the existing deployment guide; never expose .env.local or access tokens.
