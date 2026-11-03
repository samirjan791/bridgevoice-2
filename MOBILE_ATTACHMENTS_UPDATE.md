# BridgeVoice 3.4

## Implemented
- Phone composer stays at the bottom even in an empty conversation. The greeting occupies the space above it rather than centering the whole input block.
- On phones, focusing the text input expands it into a two-row rounded composer: text above, attachment/microphone/send controls below. No model selector or other fake controls were added.
- VisualViewport resize/scroll events keep the application inside the visible screen when a software keyboard opens. Dynamic viewport and safe-area fallbacks remain; pinch zoom is not disabled.
- Photos appear as image thumbnails; PDF/DOCX/TXT files appear as filename cards inside the composer. Each has its own remove control. Cards scroll horizontally if needed.
- Clicking a document card shows its real extracted excerpt. Partial extraction remains identified. Extraction progress has a working cancel button.
- Existing limits remain: one photo and one extracted document can be attached together; selecting another of the same type replaces it. File extraction, consent and validation remain intact. A document-only send asks for a summary.
- The avatar uses the latest uploaded original video, byte-for-byte unchanged: 2.966667 seconds, normal playback speed, muted and looping. CSS frames the robot inside the avatar; it does not edit, shorten or retime the file. Source overlays inside the crop remain. The previously generated portrait and artificial mouth animation are no longer displayed. Reduced motion/motion-off and autoplay failures use a still frame. Background/offscreen playback pauses.
- “Powered by Meta” remains. The real API and speech routes are unchanged.

## Validation
Logs are in evidence/attachments. Automated tests cover both attachment cards, independent remove actions, extracted-text preview, document-only send, upload cancellation, removal of document text from the outgoing request, software-keyboard viewport changes, cleanup, and original-video playback/motion fallbacks.

No browser/device screenshots or real Meta request were verified in this environment. iPhone Safari keyboard positioning and appearance should be checked on a real device before deployment; this build is not claimed to be pixel-identical to a native iOS app. Existing metadataBase build warning remains.

## Files changed from 3.3
- src/components/chat/ChatComposer.tsx
- src/components/chat/ChatShell.tsx
- src/components/brand/RobotAvatar.tsx
- src/lib/use-chat-viewport.ts (new)
- src/lib/use-voice-output.ts (restored before synthetic avatar activity)
- src/lib/speech-activity.ts (removed)
- src/styles/mobile-composer.css (new)
- src/app/layout.tsx, globals.css, about/page.tsx
- public/brand/robot-original.mp4 (exact uploaded file), robot-poster.png and static brand icons
- tests/composer-attachments.test.tsx, chat-viewport.test.tsx (new), layout-controls.test.tsx, robot-avatar.test.tsx, ui.test.tsx; speech-activity.test.tsx removed
- package.json, package-lock.json, README.md, this report, evidence/attachments

## Local run
```bash
cd "$HOME/Downloads/bridgevoice-3.4"
bash START_VOICE_UPDATE.command
```
Open http://127.0.0.1:3002 when Ready. The launcher preserves existing Meta configuration or copies it from a configured BridgeVoice folder in Downloads. Credentials are never bundled in this archive.

This ZIP updates your local project. The existing bridgevoice.us deployment does not change until you deploy this source through your hosting workflow.

Final checks: lint passed; typecheck passed; 224 tests in 23 files passed; production build passed.
