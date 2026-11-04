# BridgeVoice — Real-time co-pilot for Pashto/Dari community interpreters

**Live demo:** https://bridgevoice.us
**Version:** 5.0.1
**Built for:** Meta Global AI Developer Hackathon 2026 — Indie Developer track

## What it is

BridgeVoice is a real-time multilingual co-pilot for Pashto/Dari community
interpreters and the families they serve. Community interpreters and families
who speak Pashto or Dari often face essential information — medical
instructions, school letters, official forms — written in difficult English.
A mistranslated word or number can change what someone does. BridgeVoice
helps them understand that language while keeping the human in control of
the final meaning. It does not replace the human interpreter.

## Who it serves

- Community interpreters working in Pashto and Dari (with English and
  Spanish also supported in the app).
- The families they serve: people who need to understand difficult wording
  in simple language before they act on it.

## Headline feature: live voice

One tap on "Start listening" on the live voice screen (`/agent`) and the app
keeps listening, answers out loud, and can be interrupted by speaking — with
typed chat as a fallback. The voice screen is the centerpiece of this
release, together with a private access gate (see below).

## What else it does

- Chats in English, Pashto, Dari, and Spanish, and explains difficult
  wording in simple language.
- Checks critical details such as numbers and negations before they are
  acted on (meaning checks — the human judges the meaning).
- Answers questions about uploaded documents with exact quoted excerpts.
- Keeps history local and off by default; the voice-screen transcript is
  memory-only.
- A 120-entry interpreter glossary is wired into agent requests (see
  Honest limits below).

## Access gate — note for judges

The live deployment at bridgevoice.us is currently OPEN: no access code
is needed to chat, so judges can use the app directly. The gate was removed
Nov 3 at the owner's decision and goes back on after judging. The gate is
a deployment control, not a product feature.

## How it works

Browser → secure server → Meta Model API (Muse Spark) → checked output.
Meta's model supplies the core reasoning and language generation:
understanding the question, producing the Pashto/Dari explanation, and
carrying the live voice conversation. BridgeVoice adds the workflow around
it — the voice screen, the meaning checks, the document excerpts, and the
access gate — but without the Meta model there is no conversation at all.

## Run it locally

Requires Node.js 24.15+ and npm.

```sh
npm ci
cp .env.example .env.local   # then put your own Meta key in .env.local
npm run dev
```

Open http://127.0.0.1:3000. Configure your own key privately in `.env.local`
and restart. This repository contains no private key: the only `.env` file
is `.env.example` (placeholders only). Never put a key in chat, a
screenshot, public source, or a `NEXT_PUBLIC_` variable.

Tests: `npm test` (Vitest). Typecheck: `npm run typecheck`.

## Pre-event disclosure

BridgeVoice existed before October 26, 2026. The base app predates the
hackathon. Hackathon-period work (October 26 – November 4, 2026) is the
BridgeAgent live voice page and the JARVIS-style live voice screen with the
private access gate. Only hackathon-period work is shown as new in the demo.

## Honest limits — please do not overclaim

- Glossary entries are AI drafts, not professionally reviewed.
- Spoken Pashto/Dari depends on the device and browser; it is not
  certified and translations are not professionally verified.
- BridgeCall is a simulation with fictional participants, not real
  telephone calling. There is no WebRTC or phone path.
- The app talks and answers only — it does not build software, make phone
  calls, book anything, or take external actions.
- The daily model-call quota is process-local, not a billing cap; a Meta
  account spending cap is still advised for the live deployment.
- Real image generation and verified translation/terminology are not part
  of this release.

## Repository layout

- `src/` — Next.js app source (chat, live voice screen, agent page,
  document handling, meaning checks, glossary).
- `public/` — static assets. Brand images and example documents are binary
  and are intentionally not included in text-only snapshots of this repo.
- `tests/` — Vitest suites, including route and access-gate tests.
- `docs/` — architecture and implementation notes.
- `wrangler.jsonc` / `open-next.config.ts` — Cloudflare Workers deployment
  via the OpenNext adapter. Deploys must preserve the worker's existing
  plain variables (notably the Meta API key) with `--keep-vars`.
