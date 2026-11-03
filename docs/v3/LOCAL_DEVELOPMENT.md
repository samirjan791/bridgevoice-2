# Local development and environment

Use Node >=24.15.0. Run `npm ci`, preserve your existing `.env.local`, configure server values privately, and run `npm run dev`. Visit http://127.0.0.1:3000. `npm run dev -- --port 3001` selects a different port. Stop with Ctrl+C. Restart after changing environment values.

Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. `npm start` serves the production build. `npm run test:e2e` requires separately installed Playwright browsers. Use fictional data.

| Variable | Purpose |
|---|---|
| MODEL_API_KEY | Existing server-side Meta credential; never public |
| META_API_KEY | Accepted legacy alias; preserve existing choice |
| META_MODEL_ID | Existing default muse-spark-1.3; use only an account-supported model |
| META_API_BASE_URL | Existing default https://api.meta.ai/v1 |
| META_INPUT_USD_PER_MILLION / META_OUTPUT_USD_PER_MILLION | Optional verified price inputs; absence means no fabricated price |
| BRIDGEVOICE_ACCESS_TOKEN | Recommended private-demo access code, entered through existing Settings |
| AZURE_SPEECH_KEY / AZURE_SPEECH_REGION | Optional existing server speech provider; native installed voices otherwise |
| ENABLE_BRIDGE_CALLS | Defaults false; true does NOT enable functioning calls without a future verified gateway |
| TWILIO_AUTH_TOKEN | Only the disabled webhook's signature validation; never a browser variable |
| TWILIO_WEBHOOK_URL | Exact canonical HTTPS URL for form signature verification |

The unused REST adapter requires server constructor configuration (account SID, token, originating number, approved destination allowlist, HTTPS callback/TwiML endpoints and explicit limits). There is intentionally no automatic environment-to-call-creation wiring. Do not assume adding credentials enables telephone interpretation.

Existing speech-recognition implementations may use a browser vendor's remote service. Browser/API availability is not a measured language-accuracy guarantee. English remains the original browser-dependent default; other languages appear only when the browser's experimental availability API reports support. BridgeMode retains typed non-English input. Missing native/configured output produces the existing fallback rather than an invented voice.

History is opt-in. Disable it for sensitive prototypes and clear existing history separately. Do not share `.env.local`, recordings or real patient data. Do not overwrite an existing key to test this archive.
