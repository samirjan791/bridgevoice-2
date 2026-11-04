# BridgeVoice 4.4 judge failure review

This is a **patch candidate**, not a production release. Live 4.3 was not modified.

## Changed in this patch
- `src/components/chat/VoiceMeter.tsx`: real microphone waveform with sample-driven SVG, cleanup of microphone tracks and AudioContext, reduced-motion guard, and an honest unavailable state. Note: the meter acquires a separate stream only when enabled; device/browser permission and resource behavior must be checked on a real phone.
- `src/components/settings.tsx`: explicit removal of history, glossary, and both versions of settings keys before sweeping BridgeVoice-prefixed browser storage on full-data deletion.

## Judge's four new 4.4 failures
- Agent page render: source is present; the external judge test has not been supplied and this check is **not verified**.
- Settings navigation/search/persistence: source is present; **not verified** against the judge test.
- History toggle/deletion: source is present; **not verified** against the judge test.
- Full browser-data deletion: deletion implementation reinforced; **not verified** against the judge test.

## Four pre-existing 4.3 failures
- Three VoiceMeter checks: implementation changed to address the stated cases; **not yet executed**.
- Pashto speech claims: no change; requires the failing test or exact UI assertion to fix without guessing.

## Release blockers
Node 24.15+ and dependencies, typecheck, Vitest, build, external judge tests, iPhone speech test, real gated Meta call, screenshots, secret scan, Cloudflare deploy and GitHub update. No production readiness claim is made.
