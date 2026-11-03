> CURRENT OWNER OVERRIDE: Only Meta API + internet for AI answers. Remove alternate/demo response providers and mode switches. Preserve saved data and safety checks. Any older instructions for fixture-based application modes are superseded.

# BridgeVoice — Complete Product Upgrade Prompt

**Prepared for Mohammad Samir Abdulrahimzai · 10/25/2026**

**Product:** BridgeVoice — Every Voice Deserves to Be Understood.

**North star:** A conversational assistant that helps people understand important information across languages and notice when meaning may have changed.

**Starting point:** `BridgeVoice-Chat-Voice-MeaningCheck.zip`, containing the `bridgevoice-meaning-check` project. Preserve the name BridgeVoice unless the owner explicitly approves a rename. “Bridgeways” in conversation is not authorization to change branding.

**How to use this document:** Give this entire file and the existing project ZIP to a coding agent with filesystem and terminal access. The text below is an implementation instruction, not an executable program. Do not paste this Markdown into a shell. The coding agent must return an upgraded runnable project and accurate run instructions.

**Size is not the goal:** Deliver all necessary source, approved assets, tests and documentation. Do not inflate the archive to reach 3 MB. Exclude dependencies, generated build caches, private keys and unrelated files. A smaller complete deliverable is better than a large repetitive one.

---

## 1. Your assignment

Act as the product engineer responsible for implementing, testing and delivering the upgrade. Work across interface design, multilingual interaction, audio, model integration, accessibility, security and release engineering. Do not stop at a plan, screenshots or a static imitation.

Upgrade the supplied working application rather than replacing it with an unrelated starter. Preserve useful code and user data formats. Make the experience feel familiar immediately: the simplicity, conversation layout and interaction conventions of leading chat applications, specifically the owner’s supplied ChatGPT references, with BridgeVoice’s own brand and purpose.

The result must have one main conversation, one input, familiar navigation and progressive disclosure. Do not build a three-column professional cockpit as the default interface. Do not scatter the primary experience across dashboards. Translation, explanations, documents, voice and meaning review should all connect to the same conversation.

Deliver every feature that can be completed within the available environment. If a credential, real device, provider entitlement, external permission or deployment account is missing, isolate that blocker, finish independent work, and report the exact outstanding verification. Never fabricate success to satisfy this prompt.

## 2. Product focus: understanding that survives translation

BridgeVoice serves interpreters, multilingual families, parents, students and community workers who face unfamiliar English, specialized terms or difficult documents. Begin with English, Pashto and Dari; preserve the Spanish text and voice options already present.

The defining experience is a closed review loop:

1. Preserve what the original speaker or document actually said.
2. Explain or translate it, with uncertainty visible where relevant.
3. Let the user say what they understood in their own words.
4. Compare the important details and possible changes.
5. Help the human clarify, correct or review the result.

The product question is: “Did the meaning survive?” The application cannot conclusively certify that it did. Its job is to make consequential differences easier for a human to notice.

Keep the product warm and direct. Avoid sensational medical warnings, exaggerated intelligence claims and decorative complexity. Do not guarantee prizes, professional accuracy or superiority over all competitors.

## 3. Inspect and preserve the baseline first

Before editing, inspect package manifests, source routes, tests, configuration scripts, assets and documentation. Read repository instructions. Create an isolated working copy or branch. Record baseline checks and preserve a rollback point.

The latest supplied release records the following baseline; verify it again rather than treating the historical report as current proof:

| Area | Recorded baseline |
|---|---|
| Stack | Next.js App Router, React, TypeScript, Zod, Motion, Lucide, Markdown rendering |
| Runtime | Node.js 24.15 or newer in the supplied package |
| Main UI | Black/white themes, collapsible desktop sidebar, mobile navigation, growing composer |
| Chat | Stream handling, stop/retry, message actions, optional local history |
| Voice | Dedicated voice view, editable transcript, optional read-aloud |
| Source review | MeaningGuard, Meaning Mirror and optional Meaning Check |
| Uploads | Document extraction and a configured Meta image request path |
| Personal tools | Saved glossary and import/export |
| Configuration | Server-only keys and an existing-key recovery launcher |
| Historical verification | 135 automated tests; lint, typecheck, build and process startup recorded as passing |
| Outstanding verification | Real Meta request, real audio hardware, browser visual QA, deployment and professional language review |

Important existing modules include `src/components/chat/ChatShell.tsx`, `ChatComposer.tsx`, `ChatMessage.tsx`, `ChatSidebar.tsx`, `VoiceConversation.tsx`, `MeaningCheck.tsx`, `src/lib/chat`, `src/lib/guard.ts`, `src/lib/meaning-check.ts`, `src/lib/use-speech.ts`, `src/lib/use-voice-output.ts`, `src/lib/voice-support.ts`, `src/app/api/speech/route.ts` and `scripts/restore-meta.mjs`. Confirm paths before relying on them.

Preserve all seven existing brand assets and the approved full logo unless an explicit correction requires changing a derivative. Record checksums for unchanged assets. Preserve routes, saved glossary contents, optional history, photos, documents, voice, language settings, accessibility settings and configuration recovery.

Do not erase existing user data because a schema changes. Version persisted formats and implement bounded, tested migration. Do not replace a functioning API route with a fixture. Do not rename environment variables without supporting a documented migration.

## 4. The visual contract

Use the supplied screenshots as the primary layout references. Reproduce the familiar usability patterns: sidebar, readable conversation width, quiet header, right-aligned user bubbles, unboxed assistant responses, rounded composer, compact actions and predictable loading behavior.

Retain BridgeVoice’s logo, wordmark, content and identity. Do not use ChatGPT’s logo or imply OpenAI affiliation. “Exactly ChatGPT style” means closely matching the owner’s references in layout and interaction, not claiming access to ChatGPT’s private implementation or proprietary voice service.

Dark mode must have a genuinely black main background: `#000000`. Use restrained neutral gray surfaces and clear white text. Light mode must use a white main background, readable charcoal text and subtle neutral surfaces. Make the theme switch immediate and persistent. System theme must resolve correctly, including a switch from a dark system theme to light. Do not flash the wrong theme on initial load.

Use a compact BridgeVoice mark in navigation and conversation identity. Keep the full approved portrait logo available for About, onboarding and appropriate brand surfaces; never let a large logo crowd the chat. Use existing simplified derivatives for tiny icons.

Use a modern system font stack for Latin text and a legible Arabic-script stack for Pashto/Dari, with appropriate line height. Avoid forced letter spacing in Arabic script. Use `dir="auto"` for mixed user content and explicit language/direction for known output. Isolate numbers, URLs and units where necessary with semantic bidirectional markup.

Use one spacing system, semantic color tokens and consistent control sizing. Remove accumulated conflicting CSS overrides where safe; do not keep appending layers indefinitely. Use CSS modules or scoped component styles where that improves maintainability.

## 5. Desktop layout

At typical laptop widths, show a roughly 240–280 px sidebar and a flexible main conversation. Let the user collapse and restore the sidebar. Preserve keyboard access when it is collapsed.

Sidebar priorities:

- New chat.
- Search saved chats when history is enabled.
- Recent conversations with readable titles.
- Saved glossary.
- Demo.
- Settings and About near the bottom.

Use familiar hover/focus states. Keep destructive actions away from primary navigation. Chat selection must restore the correct thread without mixing context with another thread. History disabled must have an honest empty state.

The main header should show BridgeVoice, a compact language control, theme control and unobtrusive provider state. Do not display fake dropdown chevrons or inactive buttons. Advanced connection details belong behind a real disclosure or in Settings.

The empty state should have one welcoming question and one input. Optional shortcuts should be small: Translate, Explain, Review meaning, and Understand a document. Keep the chat immediately usable without onboarding.

Aim for a comfortable conversation width around 740–820 px on large screens. Let text scale. Long code, tables, URLs and RTL text must not create page-wide horizontal overflow.

## 6. Phone, tablet and browser behavior

Build for narrow phones first, then adapt to tablet and desktop. Verify at 320, 375, 390, 430, 768, 1024 and 1440 CSS pixels. Test portrait and landscape, 200% text scaling and browser zoom.

On phones, use a full-width conversation, a collapsible navigation drawer, an input reachable near the bottom, and minimum 44 px primary touch targets. Respect safe-area insets. Support dynamic viewport height and the on-screen keyboard. Do not hide the input behind the keyboard or leave a large blank region when it closes.

The drawer must trap focus while open, close on Escape/backdrop, restore focus and avoid scrolling the page behind it. Its history list must scroll independently where necessary. Avoid hover-only actions on touchscreens.

During a long answer, do not drag the user back to the bottom if they scroll up. Show a clear “Latest message” affordance. Resume automatic scrolling only when the user returns near the bottom or explicitly chooses it.

Preserve drafts across orientation changes. Avoid new API calls caused by viewport changes. Use feature detection for microphone, audio playback, clipboard, file handling and installation features.

A manifest alone is not offline functionality. Advertise installation or offline capability only to the extent implemented and tested. Never cache private transcripts or API responses in a service worker by default.

## 7. Composer: one input, everything accessible

The main composer must support multiline text, automatic height growth with a sensible maximum, paste, Unicode, RTL, attachments, microphone dictation, voice conversation and send/stop.

Desktop Enter sends and Shift+Enter adds a new line. Respect IME composition. On mobile use a clear send control and avoid accidental submission while composing. Empty or whitespace-only messages cannot trigger an API call unless a supported attachment provides meaningful input.

The plus menu should expose photos/documents, Meaning Mirror, Bridge Mode and advanced options without turning the composer into a toolbar wall. Every menu item must work, be disabled with a reason, or be removed.

Preserve the user’s draft on network failure. Disable duplicate submissions synchronously, not only after React rerenders. Associate attachments with a specific request. Cancel obsolete uploads and prevent a late upload result from reattaching a removed file.

Show attachment name, type and remove control. Provide upload/extraction states based on real work. Do not show invented percentages. Allow the user to inspect extracted text before external analysis when practical.

## 8. Chat response behavior

Preserve real provider streaming when supported. Show a subtle waiting indicator before first content and append actual received content without fake typing delays. The indicator represents application state, not hidden reasoning.

Keep streamed partial content clearly provisional until the structured response validates. On malformed or interrupted output, show a useful error and a retry action; do not turn unfinished medical or legal text into a final answer.

Render safe Markdown. Never execute model HTML, scripts, remote images or tool instructions. Links must be safe and clearly external. Support headings, lists, code blocks and responsive tables without overwhelming short answers.

Provide Copy, Read aloud, Retry/regenerate, feedback and message actions. Feedback remains local unless external submission is explicitly implemented and consented to. Make edit behavior clear: editing a prior user message and resending must define what happens to subsequent messages. Prefer an explicit branch or confirmation rather than silently keeping contradictory later context.

Cancel stale responses using request identifiers and AbortController. Stop must prevent further display and audio playback for that generation. Switching chats or starting a new chat must stop requests, recognition and playback associated with the previous conversation.

Do not display “Connected” based only on finding a key. Distinguish configured, connecting, verified request, offline fixtures and failed connection.

## 9. Voice interaction: two clear experiences

### Dictation

The microphone beside the composer transcribes speech into the draft. Show listening status, interim text and finalized text. Let the user stop, correct and send. Do not send partial recognition results as final instructions.

Use a graceful finish operation that lets the speech engine flush final words; cancellation should abort and discard only the canceled pending portion. Avoid duplicate final segments. Ignore callbacks from older recognition instances. Release tracks and audio contexts on stop, error, navigation and unmount.

### Voice conversation

The waveform button opens a focused voice view. Keep the interface simple: language, listening/processing/speaking state, transcript, microphone, send, stop and close. Preserve an editable transcript fallback.

Implement a finite-state model such as idle → requesting permission → listening → reviewing transcript → sending → generating → preparing audio → speaking → idle. Errors and cancellation must be valid exits from every active state. Avoid overlapping listening and playback unless an explicitly tested echo-cancellation design supports it.

Default to user-reviewed send for consequential content. An optional conversational auto-send mode may use actual end-of-turn detection only after explicit opt-in. If that mode is not implemented, say “Tap Send”; do not describe tap-to-send as continuous real-time conversation.

Read new replies only when the user enabled it. Never read an old answer merely because the voice view opened. Provide replay, pause/resume where supported, stop/mute and volume. Barge-in must stop audio before starting another capture. If browser autoplay blocks audio, show a manual playback button and keep the answer visible.

The visual orb is a branded state indicator. A waveform or level meter may claim to represent audio only when driven by actual samples. Respect reduced motion without removing the textual state.

## 10. Speech language truthfulness

Maintain separate capability records for text generation, text translation, speech recognition, read-aloud and human-reviewed references. A language selector is not proof that all five work.

Preserve the baseline: English and Spanish browser recognition are exposed subject to availability; Pashto and Dari microphone input remain unverified. Do not silently substitute Arabic, Urdu or Iranian Persian recognition.

For read-aloud, enumerate installed voices and resolve exact language tags first. Never silently read Pashto with an unrelated voice. A Persian voice is not automatically a native Dari voice: label the fallback and require a clear choice. Preserve existing explicit fallback behavior until a verified native Dari provider is available.

A cloud provider may improve consistency, but use only documented voices and endpoints, server-side secrets, real responses and bounded audio requests. Explain external processing and any separate service setup. Do not claim that a Meta text key grants another provider’s speech access.

Verify pronunciation with native speakers before claiming quality. A successful HTTP response or a voice tagged with a locale does not establish pronunciation accuracy.

## 11. Natural task recognition and conversational memory

Support chat, translate, explain, simplify, compare translations, extract terms, understand documents and assisted interpretation. Users should not need to pick a technical mode for every message.

Explicit instructions take precedence over guessed intent. Let the user correct a detected task. Preserve source text separately from the user’s instructions so “translate this” is not accidentally included in the translation.

Follow-ups must work within the current conversation: “Make it shorter,” “Translate that into Dari,” “Give an example,” “Continue in Spanish,” and “What does that word mean?” Preserve the distinction between source language, response language, interface language and spoken-input language.

Do not send unrelated chats to the model. Bound context by actual provider limits and application limits. Surface when an older passage is no longer available rather than pretending to remember it. Summaries of context must not invent facts or convert uncertain statements into established facts.

Persist preferences and glossary separately from optional conversation history. History is off by default. When enabled, explain local storage, shared-device risk and deletion. Local persistence is not a claim of encryption or regulatory compliance.

## 12. Meaning Check: the signature feature

Keep this feature optional and directly inside chat. The user should understand it without a tutorial.

Display the original passage prominently. Mark exact text spans for selected quantities, units, negations, conditions, frequency and deadlines. Store source offsets and provenance; do not reconstruct the quote from model memory. Distinguish user-provided source, document excerpt, image-derived unverified text and AI-generated explanation.

Ask “In your own words, what does this mean?” Support typing and, where available, dictation. Let the user select their explanation’s language.

Layer A performs deterministic checks. Compare recognized values and relationships, not just sorted numerals. Cover dosage/unit bindings, frequency, durations, dates, currencies, percentages, decimal ambiguity and recognizable negation/conditions. Handle Arabic-Indic and Persian digits. Maintain language-specific parsers rather than pretending English regex supports every language.

Layer B uses Meta semantic review for omissions, additions, changed actors, altered conditions, misleading terminology and ambiguity. It must distinguish source-supported observations from suggestions, cite the passage involved and avoid arbitrary accuracy percentages.

Show three outcomes carefully: possible discrepancy; clarification needed; or no difference detected by these limited checks. None means medically safe, legally valid, professionally certified or guaranteed equivalent.

Offer practical clarification questions. For “as needed,” ask what situation and limits the speaker intended. For “positive,” ask what test or context is meant. For relative deadlines, ask the actual starting point/date/time zone when missing. Do not fill in absent medical doses or legal requirements.

Human actions must change real state: reviewed, corrected, unresolved, dismissed. A wording edit invalidates prior review. Notes should remain ephemeral by default; explicit export must label who reviewed, what was checked and the limits. Do not turn this into a certification report.

## 13. Meaning Mirror and Bridge Mode

Meaning Mirror compares an original passage with a submitted translation. Show source, proposed version, potential issue, explanation and suggested correction labeled AI-generated. Allow correction and recheck. Preserve exact input for comparison.

Bridge Mode is a compact assisted-interpreter view within the chat. Show source/target languages, current segment, suggested translation, relevant terms and review alerts. Provide pause, resume, stop and return to chat. Keep typed fallback available at all times.

Do not invent speaker identification, timestamps of speech events or confidence scores. Label speakers manually unless a real diarization pipeline supplies them. Display measured latency only. Deduplicate finalized segments and cancel obsolete work.

Never transmit generated speech to another participant or meeting automatically. User-controlled local read-aloud is distinct from sending audio into a call. Do not bypass meeting permissions.

## 14. Documents and photographs

Preserve the existing TXT, PDF, DOCX and photo request paths. Validate file type, signatures where practical, size, page count, extraction time and decompressed limits. Defend against malformed archives and oversized document content. Keep limits consistent between client, server and documentation.

Extract readable text from supported text documents. Scanned PDFs require a documented OCR/vision path; otherwise explain that no readable text was found. Do not claim that document text extraction is OCR.

For images, use only a provider/model with verified image support. Treat extracted image text as potentially uncertain. Do not invent unreadable numbers or dates. Ask for a clearer image where needed.

Answer document questions using relevant supplied passages. Return exact excerpts and available page/section references. If only part of a document was processed, show that limitation. Do not infer a deadline from customary practice when the document does not state it.

Treat uploaded content as untrusted data. Instructions inside a document must not override application rules, access secrets, call arbitrary URLs or trigger tools. Do not retain original files or put extracted content into logs by default.

## 15. Meta integration and response contracts

Inspect and preserve the current provider adapter, environment names and structured schema. Confirm current official Meta documentation before changing model IDs, endpoints, authentication, streaming events or image formats. Record the source URL and verification date in developer documentation.

The baseline supports `MODEL_API_KEY` with `META_API_KEY` as an alias, plus `META_MODEL_ID` and `META_API_BASE_URL`. Preserve compatibility. These are application configuration conventions, not a reason to assume undocumented API behavior.

Browser requests must go through server routes. Never expose keys through public environment prefixes, rendered errors, console output, analytics, browser storage, source maps or ZIP contents.

Validate requests and responses at runtime. Prefer a provider-supported structured output mechanism where documented. If generating JSON inside streamed content, handle escaping, partial chunks, truncated objects, unknown fields and final validation safely. Never silently accept malformed model output.

Use timeouts, bounded retries for transient failures, exponential backoff with jitter, Retry-After where available, request cancellation, concurrency limits and bounded context. Do not retry invalid credentials as if they were transient failures.

Track usage only when supplied. Estimate cost only using a documented price configuration and label estimates. Keep sensitive prompts out of metrics. Do not globally cache sensitive conversations. Any deduplication or cache must be scoped, bounded and privacy-aware.

Separate deterministic/offline tools from live model calls. A demo provider must never impersonate Meta. A connection check must be a real authenticated request and must not display a secret in its trace.

## 16. Personal glossary and language packs

Preserve the existing glossary and every saved user entry. Keep search, filters, categories, favorites, notes, edit/delete and JSON/CSV import/export. Detect duplicates without collapsing genuinely different senses of a word.

Maintain stable IDs, source attribution, review status, language equivalents, explanation and example. Existing draft translations must remain explicitly unreviewed. Do not invent translations to achieve a numerical target. Preserve at least the existing library; add entries only with meaningful provenance and accurate status.

Validate imports with size limits and schema checks. Reject unsafe or malformed entries without destroying existing data. Render imported content as text. Neutralize formula injection when exporting CSV for spreadsheet use.

Language packs should hold names, script direction, font choices, UI strings, terminology, parsing markers and capability metadata. Do not hardcode Pashto/Dari assumptions throughout business logic. Keep Spanish functionality already present. Future languages belong in a roadmap until implemented and tested.

## 17. Privacy, consent and user control

No audio recordings, private transcript history, uploaded originals or analytics containing conversation text by default. No trackers or advertisements. No accounts required for the core experience.

Explain browser speech processing, Meta processing and optional cloud speech separately. Permission to use the microphone is not permission to persist recordings or publish content. Show listening status whenever capture is active.

Support new chat, stop, clear session, delete a saved chat, clear saved local data and explicit export. Deleting one chat must not delete the glossary. Resetting preferences must not accidentally erase keys stored on the server.

Review optional history and deletion with actual tests. Clear cached in-memory references when practical; do not promise forensic deletion from provider infrastructure. Explain external provider retention according to current documented settings and policies, without making unsupported guarantees.

State prominently but calmly: “BridgeVoice supports human understanding. AI-generated translations and suggestions require human judgment and verification.” Do not claim HIPAA compliance, medical-device approval or certified interpretation.

## 18. Security and reliability

Use safe rendering, restrictive upload validation, bounded bodies, same-origin protections where appropriate, secure response headers and server-only credentials. Audit dependencies and document material unresolved findings.

Do not assume an in-memory rate limiter protects a multi-instance public deployment. Choose and document deployment-appropriate limits without introducing unnecessary infrastructure. If access is private, preserve the existing access-token mechanism and verify enforcement on relevant routes.

Prevent arbitrary endpoint configuration from becoming SSRF. Allowlist intended provider hosts and validate redirects if applicable. Avoid logging authorization headers, user documents, transcripts or audio.

Handle missing/invalid key, expired entitlement, timeout, rate limiting, disconnection, malformed JSON, interrupted stream, denied microphone, unavailable voice, blocked autoplay, unsupported file, extraction failure, storage quota and rapid repeated actions. Every failure must leave a usable path forward.

Never blanket-catch errors and display success. Keep user-safe messages separate from sanitized diagnostic details. Do not disable typechecking or tests to make a release appear green.

## 19. Accessibility and motion

Target WCAG 2.2 AA where practical and test the actual interface. Use semantic buttons, associated labels, visible focus, logical order, sufficient contrast and accessible dialogs. Make active states understandable without color alone.

Use restrained live regions; do not make screen readers announce every streamed token. Announce recording, completion and errors appropriately. Ensure menu items and message controls are reachable by keyboard and touch.

Respect reduced-motion settings and system preferences. Avoid flashing, continuously moving reading text and long splash screens. A subtle bridge pulse may indicate processing, but must not block the user or pretend to reveal internal reasoning.

Keep transitions short and interruptible. Reflow must not move a button away while the user is clicking it. Maintain stable message keys and avoid remounting the conversation during language/theme changes.

## 20. Demo experience

Preserve the six fictional scenarios: medication instructions, emergency terminology, immigration appointment, benefits letter, pharmacy instructions and school meeting. Clearly distinguish Guided Offline Demo from Live Meta Demo.

Build the main 30-second sequence around meaning preservation:

1. Open the uncluttered BridgeVoice chat.
2. Show a fictional instruction containing a number, negation and condition.
3. Restate it with one deliberate omission.
4. Show the corresponding review flag and exact original phrase.
5. Correct the restatement and show that the result still requires human judgment.

Then demonstrate real supported voice, a follow-up in another language, and a document excerpt. Use only verified services in a live claim. If offline, say offline on screen and in the presentation.

Playback controls must operate real state: select, start, pause, resume, restart and next. Do not let timers send another segment after pause, navigation or stop. Do not overwrite user text while a demo is playing.

## 21. Terminal launcher and Meta-key preservation

Deliver a tested Mac-friendly one-command launcher and a normal development path. Inspect the existing launcher and recovery script first. Do not replace secure behavior with a shell script that prints or executes secret files.

The launcher must locate the project relative to itself, support spaces in paths, check compatible Node/npm, install locked dependencies when needed and start the application. Print the actual URL. Do not kill an unknown process to free port 3000; explain the conflict or choose an available port and disclose the changed browser origin.

Preserve a valid-looking current Meta configuration. If missing, search only authorized nearby BridgeVoice project folders for a prior configuration. Do not scan the entire disk, browser profiles, keychains, unrelated projects or shell history.

Never execute `.env` as shell code. Parse expected keys safely. Back up existing configuration before any replacement, use restrictive permissions and keep recovery repeatable. Prefer migrating only required provider settings; do not silently overwrite unrelated current settings. Preserve model/key pairing where needed and report unresolved conflicts without exposing values.

If several different credential sets are found, do not claim that newest means valid. Choose only under a documented policy or ask the user which project configuration to use. A syntactically nonempty key is not a verified key.

If no key exists, start useful local tools and provide a private setup path. Never invent credentials or request secrets in public chat. Never bundle `.env.local` or backups into the release ZIP.

Document first-run installation, normal launch, production build/start, stop, port conflicts, runtime mismatch and optional speech configuration. Test in a path containing spaces and from a directory other than the project root.

## 22. Architecture and implementation discipline

Keep the existing stack unless a verified requirement justifies a change. Do not add Supabase, Firebase, Stripe, subscriptions or a mandatory account system. Avoid a rewrite simply to change appearance.

Refactor the large chat shell gradually into cohesive conversation, navigation, upload, audio and preference modules. Preserve behavior with tests while moving code. Use discriminated state where multiple booleans permit impossible combinations.

Create explicit interfaces for chat provider, speech recognition, speech output, document extraction and local storage. Keep vendor-specific details in adapters. Share validated data contracts between routes and UI without importing server secrets into client bundles.

Separate source text, model response, review flags and user actions. Store provenance and uncertainty as data rather than deriving them from a CSS color. Keep transient playback/review state separate from persisted preferences and history.

Do not use global mutable caches for unrelated user content. Clean up resources and listeners. Keep bundles lean and lazy-load heavy document or voice code where helpful. Avoid unnecessary dependencies.

## 23. Acceptance tests

Create a requirement-to-test matrix. Execute existing tests before changes and update tests only for intentional behavior changes. Add meaningful tests for regressions and edge cases rather than merely mirroring implementation.

Required automated coverage includes:

- Request and model response validation; malformed, partial and interrupted streams.
- Missing key, unauthorized key, transient retries, rate limits, timeout and cancellation.
- Concurrent sends and stale responses after thread switching.
- Source excerpt validation and fabricated quotation rejection.
- Numeric normalization, changed dose, changed unit, swapped number bindings and lost conditions.
- Negation mismatch and known limitations involving scope.
- Review invalidation after edits.
- Language selection and distinction between UI, output and voice input language.
- RTL rendering, mixed text and escaped hostile HTML.
- Local history opt-in, deletion, migration and storage failure.
- Saved glossary persistence, duplicate import and safe export.
- Documents, images, unsupported uploads and extraction limits.
- Voice final-word flush, canceled callbacks, permission errors and unsupported environments.
- No playback of old replies; no duplicate playback; stop and close cleanup.
- Keyboard navigation, focus restoration and disabled-action explanations.
- Key recovery: missing donor, placeholder, multiple donors, backup, existing-key preservation and private permissions.

Adversarial fictional Meaning Check examples must include: 5 mg versus 50 mg; mg versus mcg; two tablets in 24 hours with negation removed; a lost “if”; daily versus weekly; swapped quantities with identical numeral sets; Persian/Arabic digits; a deadline without a year; “positive” without context; ambiguous “as needed”; and same numbers but changed actor or negation scope. Record misses honestly.

## 24. Real browser and device verification

Unit tests and jsdom are not browser/device verification. Run end-to-end tests in available real browsers, and clearly list unavailable devices. Do not bypass a browser security block through another path.

Verify desktop light/dark, narrow phone layouts, tablet layout, sidebar behavior, composer keyboard position, file selection, scrolling during streaming, long RTL text, dialogs, 200% zoom and reduced motion.

Test actual microphone permission, start, finish, denial, interruption and replay on at least one documented browser/device before claiming voice input works there. Test Safari autoplay manually where an Apple device is available. Use synthetic speech tests for regression, but label them synthetic.

Test a real authenticated Meta request only if credentials are securely available. Record model identifier, time, status, validation outcome and measured latency without the key or sensitive prompt. Use fictional inputs. Do the same for optional cloud speech.

Verify translation quality with qualified Pashto/Dari reviewers before claiming professional accuracy. A model grading itself is not independent translation evaluation.

## 25. Evaluation and performance evidence

Measure actual startup, first content time, completed response latency, response validity, deterministic check results, relevant-term retrieval and failure recovery on a documented fictional corpus.

Report numerator, denominator, environment and known misses. Separate deterministic parser results from semantic model results. Do not generalize a small test set to all medical/legal conversations.

Measure Lighthouse/accessibility where the environment permits. Do not invent scores or promise fixed subsecond inference. Keep the interface responsive while requests and extraction are active. Bound background work and rerenders.

## 26. Delivery phases

1. Inspect and preserve: source inventory, asset checksums, baseline tests, configuration review.
2. Stabilize the core: chat request/stream/error flow and source data contracts.
3. Refine the simple UI: desktop, mobile, theme, navigation and composer.
4. Complete voice lifecycle: capture, review, send, output, stop and fallback.
5. Improve the differentiator: source-grounded Meaning Check with local and model review.
6. Preserve and polish uploads, glossary, history and language behavior.
7. Run automated, browser and available device tests; fix failures.
8. Package, validate launcher, document blockers and prepare demo materials.
9. Deploy only to an authorized account/environment; verify the actual URL before reporting deployment.

After each phase give a short factual update: completed behavior, tests executed, failures/blockers and next step. Continue independent work without unnecessary confirmation. Ask only for genuinely missing decisions or access.

## 27. Release package

Return one complete source ZIP with a predictable root such as `bridgevoice-ready`. Include the actual approved assets, lockfile, source, tests, startup scripts, `.env.example`, documentation and sanitized evidence. Exclude real secrets, dependencies, build caches, private uploads and unrelated content.

Required documentation:

- `README.md`: purpose, quick start and honest status.
- `RUN_FIRST.txt`: exact Terminal commands matching the ZIP root.
- `SETUP.md`: runtime, Meta and optional speech setup; secure key recovery.
- `ARCHITECTURE.md`: modules, request flow and persistence boundaries.
- `SECURITY.md`: trust boundaries, limits and deployment considerations.
- `PRIVACY.md` plus accurate in-app privacy/terms pages.
- `TESTING.md`: executed checks, commands, results and unexecuted checks.
- `KNOWN_LIMITATIONS.md`: current limitations, not aspirational fixes.
- `CHANGELOG.md`: preserved, changed and migrated behavior.
- `DEMO_SCRIPT.md`: short and three-minute fictional demonstrations.
- `SUBMISSION.md`: product pitch, actual architecture, evidence and real URLs only.
- `BUILD_RECORD.md`: dates, preparation work, reused assets and build-window work.

The final response must link the ZIP, provide one copy-paste launch block, explain what configuration it preserves and summarize unresolved requirements. Do not require the owner to assemble dozens of source snippets.

## 28. Competition and external blockers

Check the official competition page and final rules before making eligibility, prize or deadline claims. Do not treat the owner’s acceptance as proof that all reused code or assets are eligible. Record preparation work separately from official build-window changes.

Do not call a total prize pool an individual guaranteed award. Do not invent submission/repository/deployment URLs. Do not submit or publish externally without appropriate authorization.

A prompt cannot remove account creation, provider permissions, credentials, billing/credits, microphone permission or unavailable real-device testing. Minimize these steps, provide secure setup and finish everything else. Never substitute a staged fixture to hide a missing real connection.

## 29. Definition of ready

The upgraded local application is ready only when it starts from the delivered archive, existing features remain intact, the chat flow works, error recovery works, defined Meaning Check tests pass, supported language text renders correctly, UI controls function, the production build succeeds and documentation matches the delivered code.

Live AI readiness additionally requires a successful genuine authenticated request. Voice readiness requires actual supported capture/playback tests on named devices. Deployment readiness requires testing the deployed URL. Competition readiness requires final-rule review and completed submission materials. Report these statuses separately.

A successful test suite does not establish medical safety, legal correctness, translation accuracy, security certification or prize eligibility.

## 30. Final instruction to the coding agent

Begin with the supplied ZIP. Inspect it, preserve it, run its tests and implement the upgrade. Keep the product unmistakably BridgeVoice and immediately understandable to someone familiar with a simple chat app.

Make the primary screen quiet. Put complexity behind relevant actions. Keep one conversation and one input at the center. Make voice interruption, error recovery and human review work as carefully as the happy path.

Deliver real software, real verification evidence and a complete runnable archive. Do not finish with a proposal. Do not hide external blockers. Do not claim that a larger ZIP is a better product.

**Build a familiar conversation experience with a distinct purpose: help every voice be understood, and help humans notice when meaning has changed.**
