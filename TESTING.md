# Verification evidence

Executed in this build on 10/24/2026 with Node 24.19.0. Raw command output is in `evidence/`.

- `npm test`: see final `evidence/tests.txt` for executed test count and result. Unit/integration/component coverage includes pattern checking, multilingual digits, glossary import/export/persistence, task routing, bounded context, schema rejection, chunked SSE, mocked Meta success/auth/network/partial-response failures, retry, cancellation, provenance filtering, actual PDF/DOCX/TXT parsing, upload routes, saved terms, RTL direction attributes, keyboard send, demo advance, optional history and reset.
- `npm run typecheck`: actual TypeScript results in `evidence/typecheck.txt`.
- `npm run lint`: actual ESLint results in `evidence/lint.txt`.
- `npm run build`: production compilation and route generation in `evidence/build.txt`.
- `node scripts/smoke-start.mjs`: process readiness only; no browser request, layout or live provider assertion. Output in `evidence/startup.txt` when executed.
- `npm audit --omit=dev`: registry reported zero production dependency vulnerabilities in `evidence/production-dependency-audit.json`. This is not a comprehensive security audit.

`evidence/evaluation.json` records a small fictional rule evaluation: changed number, unit and negation cases, and the number of scripted demo segments matching the glossary. It is not a translation-quality score or a model benchmark. The recorded milliseconds are local rule execution time only.

## Not executed / not established

- Real authenticated Meta request: no usable credential available. All provider success tests use mocked transport. No real model latency or multilingual accuracy has been measured.
- Playwright browser suite: supplied but NOT executed. Prior environment browser access was blocked by automatic review; no alternate browser path was used to bypass it.
- Real-device microphone, installed voice output, iPhone responsive layout, keyboard focus in a real browser, screen-reader and rendered Arabic-script font review.
- Deployment or production HTTP smoke test; no deployed URL.
- Lighthouse or WCAG conformance audit; component assertions do not establish AA compliance.

## Reproduce on your computer

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
node scripts/smoke-start.mjs
npx playwright install chromium
npm run test:e2e
```

The browser suite starts the local app unless E2E_BASE_URL is set. It covers offline chat/save/export, Meaning Mirror review, demo/RTL/mobile width, settings persistence and PDF upload. A real Meta test must be performed separately with a private .env.local and explicit Live Meta consent. Test a fictional question and follow-up; record only model name, timestamp, token counts and measured latency, never credentials or sensitive text.
