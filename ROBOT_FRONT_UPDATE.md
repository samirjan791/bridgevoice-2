# BridgeVoice 3.3 — front-facing robot

## What changed
The profile robot now faces directly forward. A generated frontal view preserving the original android’s human-like face, visor and segmented white cranial armor, based on the supplied video, replaces the side-facing footage in visible avatars. This is a new frontal reconstruction, not a claim that the original video was re-posed. The original clip remains in public/brand for reference.

The portrait is animated in CSS: restrained breathing motion and a faint visor light at rest. During actual voice playback, a subtle mouth aperture opens and closes. It is a stylized speaking animation, not audio-amplitude measurement or phoneme-level lip sync. The speaking signal comes from the existing voice hook after browser speech starts or cloud audio playback succeeds. It stops on pause, stop/interruption, error and unmount; zero-volume output is suppressed. No animation starts solely because a response is loading.

Avatars in shared branding, assistant messages, the About page and the live voice header use the same component. “Powered by Meta” remains in the labels. The center bridge visualization and introductory bridge writing animation remain intact. Tab/app icons and social previews use a matching still.

Reduced motion, Settings motion-off, hidden tabs and offscreen avatars disable animated movement. With motion disabled, the robot remains visible and the app continues to work.

## Preserved behavior
The Meta model adapter, chat/speech API routes, request format, model choice, launcher and credential handling are unchanged. The voice hook has only a visual activity publication effect; audio generation and recognition behavior are not replaced. No new dependency or external runtime service was added. The generated image is bundled locally, so image generation is not called by the running app.

Existing BridgeProof, interpretation, glossary/history and demo functionality remain. Telephone integration remains experimental/disabled as previously documented. This visual update does not improve the underlying model's reasoning or guarantee any competition outcome.

## Run
Extract BridgeVoice-3.3.zip into Downloads. In Terminal:

```bash
cd "$HOME/Downloads/bridgevoice-3.3"
bash START_VOICE_UPDATE.command
```

Open http://127.0.0.1:3002 after Ready. Existing configured Meta credentials are preserved by the launcher. If no configured project is found, it asks for your existing .env.local; never share that file publicly.

## Verification and limits
Automated logs: evidence/robot-front. Tests cover the portrait, motion preferences, hidden tab behavior, playback start/pause/resume/stop/error and late callbacks after interruption. Browser/device and real API checks were not performed here. The native browser speech service may not expose audio samples or phonemes, so the mouth is intentionally a playback-state animation rather than precise speech synchronization.

## Changed files from 3.2
- src/components/brand/RobotAvatar.tsx
- src/components/chat/VoiceConversation.tsx
- src/lib/speech-activity.ts (new)
- src/lib/use-voice-output.ts (visual signal only)
- src/app/globals.css
- src/app/about/page.tsx
- public/brand/robot-front.png (new)
- public/brand/bridgevoice-unified.png, bridgevoice-mark.png, bridgevoice-approved.jpeg, bridgevoice-app-icon.png, favicon.png, apple-touch-icon.png
- tests/robot-avatar.test.tsx, tests/speech-activity.test.tsx (new), tests/ui.test.tsx
- package.json, package-lock.json (version only)
- README.md, ROBOT_FRONT_UPDATE.md, ROBOT_ASSET_PROMPT.md, evidence/robot-front/*

## Suggested November 4 demo
1. Open BridgeVoice: show the bridge introduction and front-facing robot.
2. Ask a fictional, ordinary translation question using live voice; show a spoken reply and playback-driven mouth movement.
3. Interrupt and show that both speech and mouth movement stop.
4. Open the existing controlled MeaningGuard demonstration: highlight a changed number or negation, then show clarification.
5. State the limits honestly: AI helps identify possible meaning differences; it does not certify translation safety. Telephone routing is a labeled simulation unless externally verified.

Keep this sequence short and rehearse it with the actual browser, configured voice and internet connection used on demo day. Use fictional content only.

Final checks: lint passed; typecheck passed; 222 tests in 22 files passed; production build passed. Existing metadataBase warning remains. The Meta model adapter, chat/speech API routes and configuration-preserving launcher are byte-for-byte unchanged from 3.2.
