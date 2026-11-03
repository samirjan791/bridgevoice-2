# Setup and deployment

## Local development

Install Node 24.15+ and unzip. Run `bash start.sh` from the extracted directory. This installs locked dependencies only when node_modules is absent and starts localhost:3000. For a clean reinstall after dependency changes use `npm ci`. No global framework CLI is needed. If port 3000 is in use, stop the other app or run `npm run dev -- --port 3001` and open that port.

Set secrets in `.env.local`, based on `.env.example`. `MODEL_API_KEY` is the official quickstart name; `META_API_KEY` is a compatibility alias. Do not put secrets in any variable beginning NEXT_PUBLIC_. Never add .env.local to a ZIP or repository. Restart after changes. The status endpoint reports configuration only; a real response is required to verify connectivity.

## Production on a Next.js-compatible host

1. Create a private source repository or upload the source to your authorized Node/Next.js host. Exclude node_modules, .next, .env.local and test reports.
2. Configure Node 24+, install `npm ci`, build `npm run build`. A conventional Node server can run `npx next start --hostname 0.0.0.0 --port 3000` behind an HTTPS reverse proxy. The bundled `npm start` binds localhost for local testing.
3. Set MODEL_API_KEY, META_MODEL_ID and META_API_BASE_URL as private environment variables. Set BRIDGEVOICE_ACCESS_TOKEN to a separate random private demo code. Restart/redeploy.
4. On Vercel choose the Next.js framework, Node 24 if supported by the account, and a function duration allowing the chat's 45-second timeout (route maxDuration 60 seconds). Document extraction requires Node libraries, not Edge runtime.
5. Before opening public access, add a distributed abuse/rate-limit mechanism and review host request-size, streaming, memory and timeout limits. Current limits are per-process only; this is not a hardened public multi-tenant service.
6. Verify /, /demo, /glossary, /settings, /about, /privacy and /terms; send a fictional Live Meta message; test all document formats, consent, cancellation and invalid credentials. Check mobile RTL, microphone permission denial, and browser console. Record the actual deployed URL only after successful deployment.

No deployment has been performed by this package. Hosting account selection, secret provisioning and production verification remain owner steps.

## Speech

Use localhost or HTTPS. English Web Speech support varies by browser/OS. The application detects the API and provides typed fallback. Recognition may rely on an external browser service. Input uses the browser's default microphone; no fake device selector is provided. Read-aloud requires a matching installed voice; Dari requires fa-AF rather than assuming another Persian locale is Dari. Real-device testing remains outstanding.

## Opening animation (2.1.0)

To skip it while developing: Settings → "Opening animation", or clear `sessionStorage` to see it again. Re-generate the wordmark with `python3 scripts/build-wordmark.py <path-to-Inter-SemiBold.otf>`.
