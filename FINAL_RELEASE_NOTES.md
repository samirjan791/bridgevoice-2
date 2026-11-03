# BridgeVoice 4.3 — Live voice screen + private deployment (4.2 + two changes)

## 1. BridgeAgent Live is now a JARVIS-style live voice screen
One tap on "Start listening" starts the microphone, and after that the page
keeps listening on its own: speak, and when you pause it sends what you said
and talks the reply back out loud — no mic button per message, no Send gate.
Speak over the agent any time to interrupt it; it stops and listens to you.
A glowing orb shows the state (Ready / Listening / Thinking / Speaking) and
a live transcript stays on screen. Typing still works as a fallback.
Languages stay English, Spanish, Pashto, Dari (Pashto/Dari labelled
"device support required"). Transcript stays in memory only, nothing saved.

Honest limits of this screen:
- Browsers require one tap before any microphone use, so the page cannot
  start listening on its own when it loads, and there is no wake word:
  "Start listening" is the one required tap.
- It talks and answers through the existing Meta chat. It does NOT build
  software, make phone calls, or take actions outside the app — any demo
  that shows an assistant building a website is a different product with
  tools this app does not have, and this page never claims them.

## 2. The deployment is now private to use (public to visit, gated to use)
`BRIDGEVOICE_ACCESS_TOKEN` is set as a Cloudflare secret on worker
bridgevoice-2. With it set, every AI call (chat, mission, document, proof,
speech) requires the access code, sent as the `x-bridgevoice-access` header.
The app's Settings page has the "Private deployment access code" field; the
code is saved per browser tab and sent automatically after that. Anyone
without the code can load the pages but gets a 401 on every AI call, so
strangers cannot burn model calls. The agent page sends the same header and
shows a Settings link when the code is missing.
Also added `robots: noindex` metadata plus `public/robots.txt` (Disallow: /)
so search engines are told not to list the site. Robots rules are a request,
not enforcement — the access code is the real protection, not the robots file.
The daily model-call quota stays process-local (default 100) and is NOT a
billing cap; set a Meta account-level spending limit separately.

---
# BridgeVoice 4.2 — BridgeAgent Live (4.1 + one new feature, plus fixes)

Everything in 4.1 is preserved. New in 4.2: BridgeAgent Live, a new `/agent`
page (linked from the chat sidebar) for a live voice conversation through the
existing Meta chat integration — microphone or typed input, in English,
Spanish, Pashto, or Dari. Pashto/Dari speech depends on the device and browser
and is labelled as such in the UI. The agent title ("Boss" by default) is a
conversational preference, not identity or authorization; the transcript stays
in memory only and is not saved. No real telephone calls, no code execution,
no external actions.

Fixes applied in this tree (verified by typecheck + tests below):
- Restored `metadataBase: https://bridgevoice.us` in the app metadata (the
  4.1 deploy-time fix, which the supplied 4.2 tree was missing).
- Package version corrected from 3.4.1 to 4.2.
- New render test for the `/agent` page (tests/agent-page.test.tsx).

Deliberately unchanged (honest limits, not hidden gaps):
- `/api/status` still reports `verified: null` — configuration only. Making
  it call the model on every status check would burn quota; verification
  happens through a real chat request, not the status endpoint.
- Glossary entries stay marked unreviewed where they are unreviewed; the
  120 AI-draft entries were NOT silently re-labelled as reviewed.
- The daily model-call quota stays process-local by design (not a billing
  cap); set Meta account-level spending limits separately.
- Live-device voice (microphone permission, Pashto/Dari recognition quality)
  still requires a real-phone test; layout checks alone do not prove it.

Verification on this tree: typecheck passed; vitest 223 passed, 4 failed
(the same 4 stale failures as 4.1 — voice-meter waveform and the
Pashto-speech-support claim — plus 3 new agent-page tests passing).
Zero new failures.

---
# BridgeVoice 4.1 — Final Candidate (testing required)

This is the complete source tree, preserving the 3.4.2 audit fixes and adding the earlier Omega mission workspace (`/mission`). It does not include private `.env.local` keys.

## What changed
- Added Omega mission route, agent workflow, and mission page from the previously supplied preview.
- Disabled extra microphone acquisition in VoiceMeter. The animated bridge already avoids a second mic in live voice mode.
- Added a process-local model-call daily quota (`BRIDGEVOICE_MAX_MODEL_CALLS_PER_DAY`, default 100) shared by chat and missions. **This is not a billing limit** and resets across server instances or restarts. Configure Meta account-level spending limits separately.
- Preserved 3.4.2 Enter-to-send, glossary, speech locale, and status endpoint adjustments.

## Important limitations
- Cannot guarantee speech recognition for Pashto, Dari, or Spanish on any given browser; browser support must be checked on actual devices.
- No reliable multi-speaker diarization, true offline translation, OCR for scanned PDFs, or end-to-end encrypted saved history. History is optional and off by default.
- Browser-installed voices and optional speech providers determine spoken output quality.
- The glossary is AI drafted, not professionally reviewed; do not use it as certified medical/legal terminology.
- BridgeProof is a review aid, not a clinical safety certification.
- The live site, cold-start, Cloudflare beacon, mobile keyboard, and Meta credentials cannot be verified from this archive alone.
- Repository visibility, git history audit, video narration, and submission permission are outside the ZIP.

## Run
1. Use Node >=24.15.0 and install dependencies with `npm ci` (or `npm install` if lockfile mismatch).
2. Restore your existing PRIVATE `.env.local` in the extracted project directory. Do not upload it to GitHub.
3. Run `npm run dev` and open the local address, then `/mission`.
4. Run `npm run typecheck`, `npm test`, and `npm run build` before deploying.
5. Test voice, attachment picker, mobile keyboard, first load, and real Meta responses on a physical phone.
6. Review Cloudflare analytics configuration in the Cloudflare dashboard; browser beacon failures cannot be fixed reliably by changing application code alone.

## Hackathon submission draft
**Team:** BridgeVoice (confirm exact registered team name)
**Track:** Indie Developer / Build for Your World (confirm organizer fields)
**Problem:** Language barriers make essential information difficult to understand and act on, particularly for speakers of underserved languages.
**Project:** BridgeVoice combines multilingual conversations, document assistance, meaning checks, and an experimental goal-oriented mission workspace. It emphasizes user control and clarity around unverified translation quality.
**Meta products:** Meta Model API for multilingual responses and agent reasoning.
**Why Meta:** The Meta model supplies the core reasoning and language generation while BridgeVoice adds workflow orchestration, UI, and verification aids.
**Pre-event work:** BridgeVoice existed before October 26, 2026; disclose the preexisting base honestly. Distinguish post-kickoff additions with git commits and dates.
**Demo:** Show one English document, request Pashto/Dari explanation, run a mission, inspect source evidence and verify with the actual model. Do not claim unsupported speech languages are certified.
**Consent:** Organizer promotion/rights permission requires the user's own review and decision.
