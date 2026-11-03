# Changed files relative to delivered 3.0

- `README.md`
- `START_VOICE_UPDATE.command`
- `VOICE_FOCUS_UPDATE.md`
- `next.config.ts`
- `package-lock.json`
- `package.json`
- `src/app/globals.css`
- `src/app/intro.css`
- `src/components/chat/ChatComposer.tsx`
- `src/components/chat/ChatShell.tsx`
- `src/components/chat/VoiceBridge.tsx`
- `src/components/chat/VoiceConversation.tsx`
- `src/components/chat/VoiceMeter.tsx`
- `src/components/intro/Intro.tsx`
- `src/styles/voice-focus.css`
- `tests/voice-conversation.test.tsx`
- `tests/voice-meter.test.tsx`
- `VOICE_FOCUS_CHANGED_FILES.md`

New validation logs: `evidence/voice-focus/`. The previous v3 reports remain historical.

- `src/styles/chat-layout.css` — single left-aligned horizontal suggestion row; narrow-screen scrolling.

Suggestion-row regression: lint, typecheck, 208 tests and production build passed; logs in `evidence/suggestion-row/`. Browser visual validation remains unperformed.

Follow-up correction source/test changes and newer 215-test results are recorded in FOLLOW_UP_UPDATE.md.
