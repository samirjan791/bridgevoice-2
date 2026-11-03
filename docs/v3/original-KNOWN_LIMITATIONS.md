## Current combined animated release

Live acceptance is not certified: browser click-through, real microphone/echo/interruption behavior, actual Meta answers, and phone/desktop screenshots remain unverified. See README.md for the current voice architecture, requirements and device checklist. Older notes below are retained as history and may describe the replaced manual voice interface.

# Known limitations — release 2.0

## External verification still required

- No genuine Meta request was executed: no usable API key was supplied. Adapter tests mock HTTP/SSE, not model intelligence. Muse Spark access, multilingual quality and latency need live evaluation.
- No public deployment or repository URL exists for this delivery. This package is runnable source, not a certified production service.
- Browser visual/E2E testing and real microphone testing were not performed for v2. An earlier browser preview attempt was blocked by the environment's automatic safety review; this build did not bypass that restriction. Component tests do not verify real layout, fonts, screen readers, browser speech or mobile hardware.
- Competition rules about pre-event code and final eligibility remain unconfirmed. This build was prepared before the stated 10/26/2026 start; disclose it and follow the final rules.

## Functional boundaries

- Offline mode provides deterministic glossary and pattern checks, not open-ended AI chat or full sentence translation. The six demos use those labeled local outputs unless Live Meta is selected.
- All 120 seed bilingual entries are editorial drafts, explicitly unreviewed; no translation is advertised as professionally verified. Main chat labels have separate Pashto/Dari dictionaries; advanced controls and legal pages remain English. Font shaping and language quality need human review.
- Speech input is English-only and browser-dependent. Text-to-speech is available only with a matching installed voice. No diarization, custom input-device recognition, translated audio broadcasting or call-platform capture.
- MeaningGuard supports limited lexical patterns and number parsing, not complete date/age/currency/grammar reasoning. It can miss changed scope, swapped values or paraphrased negation; matching digits do not prove correct translation. Semantic review requires Meta and remains fallible.
- Document extraction is limited to text-based PDF, DOCX and UTF-8 TXT under 4 MB, 30 PDF pages and 24,000 characters. DOCX/TXT use section 1, not true pagination. No OCR, images, handwriting, tables/layout fidelity or whole-document retrieval beyond that cap.
- No general AI response cache, distributed rate limiter, billing budget enforcement, worker isolation for parsers, strict CSP or multi-tenant account security. Private demo protection is optional; public deployment needs hardening.
- Local history is optional and limited to 20 chats of 100 messages each. It can include sensitive responses/excerpts and is not encrypted by the application. Read/write quota failures are reported. Review notes and per-warning resolution state are session-only.
- No service worker/PWA offline installation: local glossary and demos work without an AI/internet connection once the local app server and assets are available, not as a guaranteed offline-hosted website after browser restart.
- No recorded video, actual v2 screenshots, Lighthouse scores, WCAG certification or human-reviewed translation accuracy results are included. The recording checklist is ready; the media must be recorded from a verified running build.
