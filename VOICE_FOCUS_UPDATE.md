# BridgeVoice 3.1 · focused voice interface

## Delivered

- Full-screen voice with spacious center bridge, short state label, bottom Type instead / mute replies / end controls. Dark voice mode is pure black. Errors remain visible when necessary.
- Language selectors, connection details and speech/privacy information live behind a working Voice settings button. Escape closes that panel before ending the session. No transcript paragraphs occupy the center; turns remain in chat.
- Genuine microphone waveform in the voice pill and recording composer. SVG coordinates come from analyser time-domain samples, limited to about 30 frames/second. No random activity. The line stays flat if the meter is unavailable; the accessible label explains that. Motion off/reduced motion disables visual sampling while recognition continues.
- Larger BridgeVoice center animation, smooth entrance and a traveling light across the existing intro bridge. The writing/tagline sequence remains skippable and once per session. This is the app opening animation, not a browser-tab favicon animation.
- Matching outline icons and aligned sidebar rows. The Next.js development badge is disabled so it does not overlap Settings.
- A shell-file launcher avoids pasting a long script. It preserves a configured Meta key, never prints it, and only copies from a configured existing BridgeVoice folder if needed. It backs up any existing unconfigured destination. Port 3002 separates this update from the previous app.

## Verification

Lint, typecheck, all 208 tests in 19 files, and production build passed. Added tests cover measured waveform samples, released microphone resources, reduced motion, unavailable metering and settings-panel dismissal. A local fixture verified both API-configuration copying and preservation with fictional values. Logs are in evidence/voice-focus.

The live conversation hook, recognition hook, speech-output hook, Meta adapter, chat route and speech route are byte-for-byte unchanged from delivered 3.0. No dependencies added. No key bundled or modified. A waveform analyser uses its own visual-only stream; the bridge no longer requests a redundant meter stream in live voice mode.

Browser screenshots and physical microphone/echo tests were not performed here because the browser runtime is unavailable. Automated speech tests use mocks. This is not a claim of verified device audio or pixel-exact parity with ChatGPT. Existing 3.0 external-service and telephone limitations still apply. Telephone calling remains disabled.

## Run

Extract BridgeVoice-3.1.zip into Downloads. In Terminal:

```sh
cd ~/Downloads/bridgevoice-3.1
bash START_VOICE_UPDATE.command
```

Open http://127.0.0.1:3002 after Ready. Keep Terminal open. If no prior key is found, copy `.env.local` from the working project into this folder and rerun. Nothing prints the key. A successful real reply is the connection check. Node.js 24.15+ is required. If port 3002 is occupied by a previous run, stop that run with Ctrl+C.

## Manual acceptance on the target device

Open voice, grant mic access, speak and confirm spoken reply; interrupt it; mute/unmute replies; open/close settings; verify the wave responds to speech and settles in silence; return to chat and inspect transcript. Try dictation, light/dark themes, a narrow phone viewport and joined Pashto/Dari text. Toggle Settings motion off, then confirm still rendering. Use a new browser session for the once-per-session intro, and test tap/Escape skip. Report any browser/device-specific audio behavior separately from the visual changes.

## Suggestion-row refinement

Translate something, Help me understand and Upload a document now share a single compact horizontal row aligned with the composer’s left edge. Each dismiss button stays beside its own label. Narrow screens scroll this row horizontally instead of overflowing the page. English labels retain left-to-right order when the greeting is RTL. Sending/upload/dismiss actions are unchanged.
