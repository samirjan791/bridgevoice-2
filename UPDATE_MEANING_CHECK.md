# BridgeVoice — conversational interface update
Built 10/25/2026. Updated from the supplied Black Chat Voice project; prior source and brand assets retained.

## Run on your Mac
Unzip the download into Downloads. It creates `bridgevoice-meaning-check`.
Use Node.js 24.15 or later. Stop the old development server with Control+C first if it uses port 3000.

```bash
cd ~/Downloads/bridgevoice-meaning-check
bash START_WITH_EXISTING_KEY.command
```

This launcher searches only neighboring BridgeVoice-named folders (and two nested directory levels) for an existing BridgeVoice `.env.local` containing a non-placeholder Meta key. It preserves an existing key; otherwise it backs up the current config and copies the newest candidate, with private file permissions. It never prints credentials. It cannot create a Meta account, recover a key that isn't there, or prove an old key is valid. Keep previous project folders alongside the new folder for recovery. No source files in the old projects are changed.

To start without searching for previous configuration: `bash start.sh`.
Open http://localhost:3000 after Terminal says Ready.

## Design
Black and white themes, a collapsible desktop sidebar, responsive mobile navigation, centered conversation and rounded auto-growing composer. BridgeVoice retains its own logo and typography. Familiar conversational layout; no claim of pixel-identical ChatGPT behavior. Advanced tools stay under the plus menu or optional disclosures.

## Voice conversation
The waveform button beside Send opens a focused full-screen voice view. Tap Speak, then Done; inspect or edit the transcript and Send. New replies can be read aloud with the optional toggle. Stop cancels processing and playback; Close exits voice mode. Input defaults to English; Spanish is selectable. Recognition availability depends on the browser. No audio file is saved. The audio meter samples actual microphone data; the blue orb is a state symbol, not an audio visualization or internal-model visualization.

Pashto/Dari speech input is not verified. They remain available as typed text and output languages. Read-aloud uses installed matching voices or the optional Azure setup from the prior release. Persian fallback is explicitly labeled, never represented as a native Dari voice. Cloud read-aloud needs separate credentials and permission; Safari may require another tap to allow playback. Live voice and speaker quality were not tested on real hardware here.

## Meaning Check
Open “Try a 30-second Meaning Check” on an empty chat. Choose “Try a deliberate omission”, then “Check important details”. The fictional example flags missing negation and a missing condition. Edit the explanation and check again. Mark reviewed only after human review.

Each source-bearing AI answer also offers a collapsed Meaning Check: exact source text with markers, context clarification questions, a restatement field, selected language, local deterministic checks, and optional Meta semantic review. No automatic external call occurs during local checking. Review notes remain only in the current component session; they are not a professional record. Switching chats or reloading discards them. A review mark is not certification.

The local check handles defined cases only. It can miss changed subjects, swapped actions, negation scope, translated units, spelled-out numbers and other semantic differences. English-specific binding and frequency rules are not applied to other languages. No percentage or claim of complete equivalence is displayed. Meta semantic review requires a configured connection, Live Meta selection and permission. Provider data policies apply.

## Verification and limits
See `evidence/meaning-check/` for actual test/build logs. Automated browser-DOM tests are not visual browser or device tests. Live Meta, Azure, real microphone, mobile visual QA, deployment and professional translation review remain owner-side validation tasks. No public deployment was created. Prior evidence folders describe older versions.

## Competition
Official page checked 10/25/2026: https://dev.meta.ai/events/global-hackathon
It lists a $1,000,000 total prize pool across tracks, with submissions due 11/04/2026 at 9 PM Eastern, subject to change. The page says official rules will be published before kickoff. This is pre-event preparation; eligibility of reused code/assets is not confirmed. Review final rules before submission. No prize or eligibility guarantee is made.
