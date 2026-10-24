# Architecture

Browser chat → validated `/api/chat` → Meta Responses API → SSE draft → validated result → MeaningGuard and UI.

## Boundaries

- ChatShell coordinates UI state; Composer, Message, Sidebar, BridgeMode, DemoPanel and MeaningGuardCard are separate components.
- useConversation owns in-flight state, generation IDs, AbortController, draft removal, retry and bounded conversation context. Duplicate rapid sends are blocked; obsolete responses are discarded after reset/stop.
- Task router recognizes explicit requests and supports manual correction. Deterministic local save/retrieve actions avoid model calls. Guided offline tools never impersonate live AI.
- Meta provider uses only the configured official origin. Request size, runtime Zod validation, 45-second timeout, up to three attempts for HTTP 429/5xx and structured output validation protect the interface. HTTP failures return friendly errors. Partial text is labeled provisional; hidden reasoning is not displayed.
- Context includes only the current chat: at most 12 prior turns and 24,000 characters, plus current message and up to 24,000 document characters. There is no cross-conversation retrieval.
- MeaningGuard parses numeric strings and limited English number words, normalizes Persian/Arabic digits, compares quantity multisets, tests language-pack negation markers and flags units/conditions. It does not prove semantic equivalence. Model source passages and document quote/page pairs are checked against supplied text; unsupported citations are removed.
- Glossary entries and language metadata are separate from UI. Adding languages requires extending schemas and verified packs; not a claim of automatic universal speech support.
- Documents: bounded multipart request → extension/MIME/signature validation → PDF text or DOCX raw text → context cap. DOCX archive entry count and declared uncompressed sizes are checked before extraction. No HTML output from DOCX is rendered.
- Markdown is rendered without raw HTML; remote markdown images are suppressed. No model tool execution is enabled.
- Saved glossary/settings use versioned localStorage. Optional history validates at read/write and keeps at most 20 chats. Quota/security errors are surfaced. No persistent transcript history by default.

## Deliberate limits

No shared cache of sensitive AI responses. Stable glossary matching is local; there is no distributed response cache or distributed rate limiter. Server concurrency is three active calls and 30 admitted requests per minute per process. This limits a private demo, not global account spend. Provider usage is shown only when returned; optional cost estimates require owner-entered current rates. Documents are neither stored nor embedded in an external vector database.
