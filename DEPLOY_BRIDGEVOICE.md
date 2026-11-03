BridgeVoice 3.0 update: consult README.md and docs/v3/IMPLEMENTATION_REPORT.md for current status. Live-service, hardware and telephone acceptance remain unverified. Prior notes below describe the original build, not current readiness.

# BridgeVoice website: deployment and release checklist

This release is a **Next.js website**, not a native iPhone application. Its optional install-to-home-screen manifest does not guarantee offline operation.

## Local setup

1. Install Node.js 24.15+.
2. Run `npm ci`.
3. Run `npm run dev`, then visit the printed local URL.
4. The default **Guided offline** mode works without an AI credential but is intentionally limited. It is **not** full translation or a live chatbot.
5. To try the live Meta provider, copy `.env.example` to `.env.local`, set `MODEL_API_KEY`, and restart. **Do not** commit `.env.local` or expose keys in `NEXT_PUBLIC_*` variables. Real API compatibility and access must be verified against your Meta account.

## Deploy on Vercel

1. Upload the project to a **private** Git repository (exclude `.env.local`, `node_modules`, `.next`).
2. Import that repository into Vercel as a Next.js project. Build command: `npm run build`.
3. In Project Settings → Environment Variables, add `MODEL_API_KEY` and any required approved model settings. Never paste the key into frontend code.
4. For a **private judges-only demo**, optionally set `BRIDGEVOICE_ACCESS_TOKEN` and provide the code separately to reviewers. Note this is a simple demo gate, not full authentication.
5. Deploy and verify `/api/status` shows `configured: true` (this only means a key is set, not that the model is reachable).
6. Send a real live request; check streaming, error states, English/Pashto/Dari output, document upload, browser microphone permissions, mobile Safari and Chrome.
7. Connect a custom domain in Vercel, update DNS at the domain registrar, and use HTTPS.

## Before a public launch

- Replace in-memory rate limiting with a shared, persistent limiter; implement user or session quotas, cost ceilings, monitoring, and abuse prevention.
- Add strong access controls and an appropriate retention/deletion policy before processing sensitive documents or conversations.
- Validate translation accuracy with qualified Pashto/Dari speakers, especially for medical and legal terminology.
- Confirm Meta's latest model/API terms, availability, pricing, and hackathon submission/ownership rules.
- Test mobile UI and accessibility on real devices. Do not claim that live speech recognition works for Pashto/Dari: the current browser speech-input implementation is English-only.
- Never advertise offline glossary output as real AI translation.

## Useful checks

`npm run typecheck` · `npm test` · `npm run lint` · `npm run build`

**Known boundaries:** no real Meta API call was possible without your credentials; no independent external deployment or live browser/device test has been performed here. Read `KNOWN_LIMITATIONS.md`.
