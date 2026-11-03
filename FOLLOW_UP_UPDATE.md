# Follow-up suggestion correction

Follow-up chips are next user messages, not questions the assistant asks the user. The Meta prompt and response-schema description now state this explicitly and request contextual suggestions. They also instruct the model to perform the task using supplied context, asking only for missing essentials when needed.

A small shared normalizer removes common English assistant-perspective prompts (including the exact reported examples), trims/deduplicates suggestions and preserves useful user questions. If all supplied suggestions have the reversed perspective, the app supplies localized user-request shortcuts for translation and explanation. These are request labels, not simulated AI answers. An empty suggestion list stays empty. The same normalizer runs at result finalization and rendering, so stored replies benefit too.

Clicking sends the displayed request verbatim through the existing Meta chat path with bounded conversation context. This was verified in a mocked UI integration test. Language availability and live model behavior remain subject to the existing limitations. The wording filter is a limited English-pattern safeguard, not universal multilingual intent classification; new suggestions in all languages are governed by the model instructions.

Changed source: src/lib/chat/follow-ups.ts (new), src/lib/chat/meta.ts, src/lib/chat/schema.ts, src/lib/chat/result.ts, src/components/chat/ChatMessage.tsx. Tests: tests/follow-ups.test.ts (new), tests/layout-controls.test.tsx.

Validation: lint, typecheck, all 215 tests in 20 files and production build passed. Logs: evidence/follow-ups. Live Meta responses were not tested here. No credentials, endpoint/model selection, voice engine or existing actions were changed. Earlier reports describing an unchanged Meta adapter refer to the visual-only update; this correction changes its instructions only.

Use the existing START_VOICE_UPDATE.command in the newly extracted project to preserve/reuse your Meta configuration and launch on port 3002. No private environment files are included.
