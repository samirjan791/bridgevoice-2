# BridgeVoice 2.0 — submission draft

**Current status — November 2, 2026 (v4.3):** Live at https://bridgevoice.us with the JARVIS-style live voice screen (`/agent`) and a private access gate (chat without the code returns 401). Live Meta chat verified Nov 1, 2026. Demo video: pending (to be recorded with narration). This repo is the submission repo.

**Founder:** Mohammad Samir Abdulrahimzai. **Pitch:** A human-first multilingual chat assistant that helps interpreters and communities understand difficult language while checking critical details.

**Problem:** Specialized terminology and consequential quantities can be hard to preserve across English, Pashto and Dari. **Audience:** community interpreters, families, students and service workers. **Solution:** one conversational interface with translation/explanation, MeaningGuard, Meaning Mirror, Bridge Mode, local glossary and source-grounded document excerpts.

**Technical distinction:** Deterministic checks complement structured Meta semantic output; human review stays visible. A documented server-side Meta Responses adapter powers live chat and translations; bounded current-chat context supports follow-ups. Offline fixtures/local tools are labeled. PDF/DOCX/TXT extraction and exact quote validation support document questions.

**Meta evidence:** Server-side Meta Responses adapter powers live chat and translations; live chat verified with a real request on Nov 1, 2026. Never include keys.

**Demo URL:** https://bridgevoice.us **Repository URL:** https://github.com/samirjan791/bridgevoice-2 **Screenshots/video:** Recording checklist in DEMO_SCRIPT.md; actual v4.3 demo video pending. **Setup:** README.md. **Testing:** TESTING.md and evidence/ after final verification. **Limitations:** KNOWN_LIMITATIONS.md.

**Competition check:** Official event page https://dev.meta.ai/events/global-hackathon was consulted during preparation. The stated event is 10/26/2026–11/04/2026. Final submission requirements, deadline timezone and pre-event-code rules must be rechecked against the organizer's published rules/portal. Do not infer eligibility from this package. Preserve BUILD_RECORD.md and disclose pre-event work. Do not submit this draft as a claim that all definition-of-done requirements have been met.

**Roadmap:** Qualified Pashto/Dari review; real-device speech and accessibility testing; stronger public-host abuse controls; measured model evaluations; additional reviewed language packs; OCR only after a documented integration.


## 10/25/2026 preparation update
Added conversational Meaning Check and focused voice UI. 135 automated tests pass; see evidence/meaning-check. Real service/device QA and final-rule review remain outstanding. See UPDATE_MEANING_CHECK.md and DEMO_MEANING_CHECK.md. No deployment URL or live-inference success is claimed.
