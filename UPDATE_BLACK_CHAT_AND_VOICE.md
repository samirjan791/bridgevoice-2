# Black chat and voice update — 10/25/2026

## Start

Extract this ZIP, then run:

```bash
cd ~/Downloads/bridgevoice-chat-refined
bash start.sh
```

Install Node.js 24.15+ first if needed. Open http://localhost:3000 after Terminal says Ready. Leave the Terminal window open. Use Control+C to stop an older server before starting this one on port 3000.

Your private .env.local is not included in this archive. Copy it from your previous working project into this new folder to retain your Meta configuration. Do not paste keys into chats or client-side Settings. This update does not change the Meta variable names.

## Changes

- Pure #000000 main screen and sidebar in dark mode; #ffffff in light mode. The top-right moon/sun button switches immediately and persists through the existing preference mechanism. System theme remains available in Settings; a fresh profile now starts dark. Existing saved preferences are respected.
- Less crowded composer, round send/stop control, compact plus-tools menu, centered empty conversation, quieter sidebar/recent-chat rows. Existing photos/documents, search, message actions, glossary, demo, Bridge Mode and settings remain accessible.
- Connection options and external-processing consent move into a disclosure above the composer; consent is still required. Voice information appears only on demand.
- A small loading dot precedes actual streamed text. Streaming Markdown is provisional until final validation; it is not simulated typing or a claim about internal model reasoning. Reduced-motion preference disables the pulse.
- Original supplied unified logo files are unchanged. This is BridgeVoice branding with a familiar conversational layout, not an OpenAI product.

## Read aloud

The application first looks for a matching installed browser voice. It chooses the language of the response clicked, including Spanish and Pashto. Exact Dari tags fa-AF, prs and prs-AF are preferred. Persian fa-IR is NOT silently labeled as native Dari: it requires agreement and is labeled Persian pronunciation.

When no matching browser voice exists, an optional server-side Azure Speech adapter can generate audio. Set these in .env.local and restart:

```dotenv
AZURE_SPEECH_KEY=
AZURE_SPEECH_REGION=
```

Use the key and region from your own Microsoft Azure Speech resource. These are separate from your Meta key. The app asks permission before sending answer text to Azure; Azure processing terms and usage charges apply. Returned audio is memory-only, supports pause/resume/stop and is released when stopped or closed. Maximum cloud request: 6,000 characters; longer answers produce a useful error rather than silent truncation.

Configured voices: Pashto ps-AF-LatifaNeural; Spanish es-ES-ElviraNeural; English en-US-JennyNeural; optional Persian fa-IR-DilaraNeural for Dari text. A dedicated native Dari cloud voice is NOT provided. Persian pronunciation may differ from Dari. No fabricated or undocumented Dari voice is configured.

Official sources consulted:
- https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support
- https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech

**Cloud speech is implemented but not live-verified:** no Azure key was available in this environment. Mocked route tests verify requests, validation and error handling, not real audio quality. Install a matching browser voice or configure Azure to make read-aloud available on your machine. Native Dari pronunciation still depends on a suitable installed voice; the cloud option is Persian only.

## Preservation and repairs

Started from the attached BridgeVoice-Unified-Logo-Photos-History-Voice(1).zip, not an older project. No existing files were removed. Existing storage keys are preserved, so history and glossary remain accessible on the same browser origin. Do not switch localhost/127.0.0.1 or ports if you expect the same browser storage.

Existing compile errors in the supplied build were repaired: missing FileText import, unreachable duplicate image-payload expressions, optional Spanish glossary fields, and stale test props. Tests now use the supplied unified logo path and existing language selector label. No tests were disabled.

## Verification limits

Fresh results are in evidence/current-update/. Browser visual/mobile/screen-reader checks and actual microphone/audio playback remain unverified here; the prior environment blocked browser preview, and no alternate browser path was used. Real Meta and Azure requests require your private credentials. This update does not claim pixel-perfect identity with ChatGPT, certification, or a new public deployment.
