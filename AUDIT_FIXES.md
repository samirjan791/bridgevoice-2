# BridgeVoice audit remediation (November 2026)

## Applied in this package
- Removed duplicate microphone acquisition from both chat and voice visualizers. Voice recognition is now the sole microphone consumer in these paths; the animated waveform is replaced with a truthful listening status rather than a fabricated waveform.
- Desktop Enter-to-send no longer depends on viewport width; Shift+Enter remains a newline.
- Enabled browser speech-recognition attempts for Spanish, Pashto and Dari with their explicit locale tags. **Browser/device support is NOT guaranteed**. This is not an independent STT service.
- Status endpoint no longer returns the demonstrably false `verified: false`; it reports `null` until a real verified request is performed.
- Default glossary landing page now shows the existing library, which remains AI-drafted and unreviewed.

## Not fixed / must not be represented as ready
- Real-device microphone/STT/TTS support and accuracy (especially ps-AF and prs-AF); Spanish/Dari/Pashto voice output; device keyboard and file picker.
- Cold-start latency, intermittent production streaming, analytics beacon errors, actual Cloudflare deployment. Requires deployed URL, logs, and device testing.
- OCR, offline translation, encrypted sensitive chat history, multi-speaker diarization, production-grade meaning verification and medical/legal glossary review.
- Repo public visibility, git history secret audit, demo recording, permissions checkbox, and hackathon submission. These require owner action.
- Mission multi-call spending limits: no safe unverified claim of completion. Set provider-side billing caps and restrict demo access.

## Security and demo requirements
Do not include `.env.local`, secrets, git history, or node_modules in distribution. Review old git commits and rotate any exposed key before publishing. Never use unreviewed glossary or heuristic checks as certified medical/legal translation.

## Manual verification
1. Run npm ci, npm run typecheck, npm test, npm run build.
2. Run a real Meta API chat and verify response/stream termination.
3. Test Enter, Shift+Enter, attachment selection, and phone keyboard on desktop and iPhone.
4. Test EN, ES, PS, Dari speech recognition individually on the target browser; if unavailable, use typed input and clearly label limitations.
5. Test cold Cloudflare startup, errors, and cost usage before judging.
