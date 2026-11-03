# Test evidence and regression checklist

## Baseline

Supplied 2.1.0 source: lint, typecheck, 171 tests in 13 files, and production build passed before code changes. Original SHA-256 manifest and logs: `evidence/v3-baseline/`. No source control repository was present; the original ZIP and manifest form the baseline. No private environment file was changed.

## Updated automated checks

- `npm run lint`: passed, no lint errors or warnings.
- `npm run typecheck`: passed.
- `npm test`: 204 tests passed in 18 files (33 more than baseline).
- `npm run build`: production build passed, including new proof/call routes and call-lab page.
- Evidence: `evidence/v3/{lint,typecheck,tests,build}.txt`.

Tests use mocked Meta/telecom transport and mocked browser speech, not real provider calls. The suite emits existing jsdom navigation and Framer Motion reduced-motion notices; these are not evidence of a browser navigation or animation acceptance test.

Added cases cover changed/unchanged numbers, negation, dates/times, currencies, unit bindings, instructions, names/identifiers, high-risk review, handoff copying, semantic-review validation/access/failure/status reset, explicit A/B language direction, capability detection, expanded animation states, consent/timeout/handoff/failure, recipient isolation, duplicate/generated-output rejection, webhook signatures, feature flags, adapter authorization, rate/budget bounds and provider failure.

## Not run / external blockers

Playwright Chromium is absent (see `browser-availability.txt`). Browser clickthrough, screenshots, visual contrast, mobile overflow, physical RTL rendering and device speech acceptance were not executed. Existing browser automation access was unavailable; no alternate control path was used. Added `tests/e2e/bridge-v3.spec.ts` covers local call-lab controls and 440/1440px overflow; existing E2E specs cover themes, RTL, intro and chat. These remain **unverified**, not passed.

No live Meta key or speech hardware was available. No two-phone call was attempted. No real translation-quality, acoustic interruption, Pashto/Dari recognition, native voice quality, cloud output or provider-webhook delivery claim is made. There is no production WSS gateway.

## Regression checklist

| Check | Result / next verification |
|---|---|
| Chat send, edit, copy, regenerate, failure/cancel | Automated regression passed; live Meta smoke test pending |
| Glossary and saved items | Existing unit/UI regressions passed; browser check pending |
| History search, pin/filter/delete, retention settings | Existing regressions passed; real reload/browser check pending |
| Document and photo flows | Validation/extraction tests passed; browser file-picker and live model acceptance pending |
| Theme/interface language/settings | Automated regressions passed; light/dark visual inspection pending |
| Intro once/session, skip and reduced motion | Automated regressions passed; browser acceptance pending |
| Voice auto turn, speak, interrupt, mute/end/retry | Mocked lifecycle tests passed; headset/device validation pending |
| BridgeMode source/target A/B switch | Request direction and attribution tested; real bidirectional translation pending |
| BridgeProof warnings, false positives, exact original | Automated tests passed; bilingual human review still required |
| Handoff | Local copy tested; no interpreter service connected |
| RTL and 440px mobile | Existing layout preserved, new wrap rules and E2E cases authored; visual run pending |
| Call simulation and disabled real route | Automated controls/security/reducer tests passed |
| Real call, separate audio routing, recovery | Blocked pending gateway and authorized two-phone verification |
| Secrets | Private environment files excluded from delivery; adapter is server-only, uses no public credential variable |

## Remaining experimental features

Telephone simulation and REST provider adapter; browser experimental recognition availability API; same-model semantic comparison; heuristic interruption echo suppression; Persian pronunciation fallback for Dari. None is a safety certification. Advanced speaker identification, actual interpreter dispatch, production audit/retention and telecom media orchestration are planned rather than implemented.
