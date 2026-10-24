# BridgeVoice 2.0 — The Human Connection Engine

**Every Voice Deserves to Be Understood.** Founder: Mohammad Samir Abdulrahimzai.

A chat-first communication assistant for English, Pashto and Dari: terminology explanations, translation suggestions, Meaning Mirror, local MeaningGuard checks, Bridge Mode, documents and personal glossary. The approved image supplied by the founder appears on the chat welcome screen and About page; a simplified bridge symbol is the small app icon.

## Start on your Mac

1. Install Node.js **24 LTS, version 24.15 or newer** from https://nodejs.org.
2. Extract this ZIP. Open Terminal:

```bash
cd ~/Downloads/bridgevoice-2
bash start.sh
```

3. Open http://localhost:3000. Leave Terminal running. Control+C stops it.

The initial install downloads npm dependencies. No API key is needed for the guided offline tools. If the folder is elsewhere, type `cd ` and drag the extracted folder into Terminal, then press Enter. The alternative `START_BRIDGEVOICE.command` starts the same script.

## What is implemented

- Responsive chat interface, supplied portrait logo, small companion icon, light/dark theme, reduced motion, high contrast and larger text.
- Typed chat, context-bounded follow-ups, edit/resend, retry, stop, copy, feedback, dismissal and export. Actual Meta streaming is provisional until JSON validation succeeds.
- English/Pashto/Dari language metadata, RTL output, localized main chat labels; advanced controls and legal pages remain English.
- Meaning Mirror: original/translation comparison, local quantities/units/negation checks and optional Meta semantic review. Review → resolve or dismiss; correction notes stay in-session.
- Bridge Mode: typed segments and browser-dependent English speech, pause/stop/return, no automatic outgoing speech.
- Browser speech input and matching-voice read-aloud; no audio recording storage. Pashto/Dari speech recognition is not enabled.
- 120 explicitly unreviewed draft glossary entries, search, category and displayed-language selection, edit, notes, favorites, duplicate handling, import JSON, export JSON/CSV and print.
- Six fictional demo scenarios. Guided offline responses are deterministic glossary/rule outputs, not general AI. Live Meta sends fictional samples to the real adapter.
- PDF, DOCX and UTF-8 TXT extraction on the server (4 MB, 30 pages, 24,000 text characters). No OCR. Fictional test files are in `public/examples`.
- Optional local history (off by default), new chat and deletion controls. No accounts, Supabase, Firebase or payments.

## Enable real Meta AI

The adapter follows the official Meta Responses protocol checked during this build:

- https://dev.meta.ai/docs/quickstart
- https://dev.meta.ai/docs/protocols/responses
- `POST https://api.meta.ai/v1/responses`, Bearer authorization, `muse-spark-1.3`, `store:false`, SSE `response.output_text.delta` and `response.completed`.

Obtain access through Meta's official developer portal or the hackathon's official onboarding. Availability is controlled by Meta. The application cannot create your credentials or guarantee access.

```bash
cp .env.example .env.local
nano .env.local
```

Set `MODEL_API_KEY` privately. The application also accepts `META_API_KEY` as an alias. Keep `META_API_BASE_URL=https://api.meta.ai/v1`; other endpoints are rejected. Set `META_MODEL_ID` only to a model your Meta account supports. Restart the server, select **Live Meta**, affirm permission, and send fictional text. Only a successfully validated response sets the UI to Connected. Never paste a key in chat or commit `.env.local`.

Optional `BRIDGEVOICE_ACCESS_TOKEN` protects server routes for a private demo; enter that separate access code in Settings. Optional token price variables calculate an estimate from actual reported usage; no price is assumed.

**No genuine authenticated Meta call was executed for this delivery because credentials were unavailable. Mocked transport tests are not proof of live integration.**

## Commands

```bash
npm ci
npm run dev
npm test
npm run typecheck
npm run lint
npm run build
npm start
```

Browser tests for your own local machine:

```bash
npx playwright install chromium
npm run test:e2e
```

Do not interpret unexecuted browser tests as passing. See TESTING.md for actual evidence and limits.

## Deployment

This is a Node/Next.js source distribution, not a static site. Use a Next.js-compatible Node host such as Vercel, configure private environment variables there, and use `npm run build`. See SETUP.md. No public deployment or repository URL was created in this delivery. Real AI, microphone, browser visual QA and production smoke verification remain required before submission.

## Privacy and limitations

By default messages and document text are session-only. Saved glossary/preferences persist locally; enabling history explicitly saves up to 20 conversations. Browser recognition may use external speech services. Live Meta sends bounded conversation context and document excerpts externally. Documents are processed in server memory. `store:false` is not a universal provider-retention guarantee.

All glossary translations are unreviewed drafts. No professional translation accuracy, HIPAA compliance, WCAG certification, medical/legal certification or competition eligibility is claimed. MeaningGuard's simple rules miss semantic errors and can produce false positives. Read KNOWN_LIMITATIONS.md before client use.

## Stack and structure

Next.js App Router, React, TypeScript, Zod, Motion, Lucide, React Markdown, pdf-parse and Mammoth. Standard CSS implements the design system without adding Tailwind infrastructure. Local browser storage implements glossary/history without accounts.

`src/components/chat`: chat UI; `src/lib/chat`: orchestration, schemas, providers and history; `src/lib/guard.ts`: deterministic checks; `src/lib/documents`: text extraction; `src/app/api`: secure server routes; `src/data`: fictional demos and glossary; `tests`: unit, integration, component and optional browser suites.
