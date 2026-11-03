# BridgeVoice 3.4.1 — compact mobile input

Focused mobile input now uses a compact two-row layout without the heavy blue halo. It remains at the bottom of the visible viewport and grows with text. Original video and Meta integration are unchanged.

Extract into Downloads, run `cd "$HOME/Downloads/bridgevoice-3.4.1"`, then `bash START_VOICE_UPDATE.command`. Open http://127.0.0.1:3002 after Ready.

See COMPACT_COMPOSER_UPDATE.md for scope and verification.

# BridgeVoice 3.4 — mobile composer, attachment cards, original video

Current release: the phone composer sits at the bottom and expands above the keyboard when focused. Photos and documents appear as removable cards inside the composer. The profile uses the latest uploaded ORIGINAL 2.966667-second video, at normal speed, silently looping. No generated portrait or artificial mouth animation is displayed. Meta API behavior and the credential-preserving launcher remain.

Extract into Downloads and run `cd "$HOME/Downloads/bridgevoice-3.4"` then `bash START_VOICE_UPDATE.command`. Open http://127.0.0.1:3002 after Ready. See MOBILE_ATTACHMENTS_UPDATE.md. Earlier sections below describe release history.

# BridgeVoice 3.3 — front-facing animated robot

This release replaces the side-facing profile footage with a generated frontal view of the original visor-wearing android design, inspired by the supplied video. Subtle idle motion and a subtle mouth animation use CSS. Mouth movement runs during actual speech playback, stopping on mute, pause, interruption, completion and errors. It is not phoneme-level lip sync. Meta translation, keys and routes are preserved.

Run `bash START_VOICE_UPDATE.command` inside the extracted folder. Open http://127.0.0.1:3002 after Ready. See ROBOT_FRONT_UPDATE.md for details.

# BridgeVoice 3.2 — animated robot profile

Unzip this build, then run `bash START_VOICE_UPDATE.command` inside its folder. Open http://127.0.0.1:3002 when Terminal says Ready. The launcher preserves existing Meta configuration or copies it from a configured BridgeVoice folder in Downloads; it does not print keys. See ROBOT_PROFILE_UPDATE.md for changes and verification.

# BridgeVoice 3.1

**Don’t just translate words. Protect meaning.**

A targeted upgrade of the supplied BridgeVoice 2.1.0 Next.js application. This is a controlled multilingual communication prototype, not a medical safety system or production telephone interpreter.

The existing Meta chat, glossary, document/photo flow, local history, themes, RTL interface, writing intro and voice controls remain. New work adds BridgeProof pattern checks and a separate optional Meta review, explicit two-person turns, a state-driven Living Bridge, browser capability reporting and a labeled local BridgeCall routing lab.

## Follow-up suggestions

Suggestions now represent requests from you, not questions the AI asks you. Clicking sends the displayed message with conversation context. See [follow-up update](FOLLOW_UP_UPDATE.md).

## Voice-screen update

Minimal full-screen voice layout, controls at the bottom, language/privacy options behind Voice settings, a genuine microphone waveform, aligned sidebar navigation and a polished opening bridge sequence. Meta and voice orchestration are unchanged. See [update report](VOICE_FOCUS_UPDATE.md).

On macOS, extract into Downloads and run `cd ~/Downloads/bridgevoice-3.1` then `bash START_VOICE_UPDATE.command`. The launcher preserves an existing configured key, or copies the newest configured BridgeVoice `.env.local` from Downloads. It starts on http://127.0.0.1:3002. Existing projects remain untouched.

## Run locally

Install Node.js 24.15+ and npm. Extract the archive, then:

```sh
cd ~/Downloads/bridgevoice-3.1
npm ci
# Copy only if you do not already have .env.local:
[ -f .env.local ] || cp .env.example .env.local
npm run dev
```

Open http://127.0.0.1:3000. Configure your existing Meta key privately in `.env.local` and restart. Do not put a key in chat, a screenshot, public source, or NEXT_PUBLIC variables. An unconfigured app shows honest connection errors rather than sample AI answers. The archive contains no private key.

## Evidence and delivery guide

- [Implementation report](docs/v3/IMPLEMENTATION_REPORT.md): feature-by-feature status and remaining work.
- [Architecture](ARCHITECTURE.md): actual flow and separate proposed telephone gateway.
- [Local development and environment](docs/v3/LOCAL_DEVELOPMENT.md).
- [Deployment](docs/v3/DEPLOYMENT.md).
- [Telecommunications integration](docs/v3/TELECOM_GUIDE.md).
- [Competition demonstration](docs/v3/DEMO_SCRIPT.md).
- [Testing and regression checklist](docs/v3/TEST_REPORT.md).
- [Exact changed files](docs/v3/CHANGED_FILES.md).

Original source hashes and baseline logs are in `evidence/v3-baseline`; updated check logs are in `evidence/v3`. Older release notes describe historical builds, not current readiness. The v3 reports take precedence.
