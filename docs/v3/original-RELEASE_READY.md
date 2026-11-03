# BridgeVoice — merged chat and voice release

Prepared 10/25/2026 from `BridgeVoice-Chat-Voice-MeaningCheck.zip` plus `MASTER_PROMPT.md`. This is a complete source package, not a claim that all external services or devices have been verified.

## Start on your Mac

Keep older BridgeVoice folders in Downloads. Extract this archive there; its root folder is `bridgevoice-ready`. Stop the old server with Control+C before starting another on port 3000.

```bash
cd "$HOME/Downloads/bridgevoice-ready"
bash START_WITH_EXISTING_KEY.command
```

Requires Node.js 24.15 or newer and an internet connection for the first dependency install. Open http://localhost:3000 after Ready. Use the SAME browser and SAME URL/origin as before to retain browser-local history and glossary. Switching between localhost and 127.0.0.1 uses different browser storage; the project cannot transfer that data automatically. If you previously used http://127.0.0.1:3000, keep using that address.

The launcher preserves an existing Meta key. With no existing key it searches only nearby BridgeVoice-named folders and two nested levels for a prior project configuration. It backs up current config, selectively restores provider fields, keeps unrelated current settings and uses private permissions. If different keys are found, it makes no change and explains how to use the working project’s configuration. It never prints key values. A key may still be expired or unauthorized; only a real request verifies it. Old folders are not modified.

To start without configuration recovery, use `bash start.sh`. No real secrets are included in this ZIP.

## History search

The magnifying glass is at the top corner of the sidebar, beside BridgeVoice. It opens a focused search dialog. Search matches saved titles and message content, locally. Command+K / Ctrl+K opens it; Escape closes it. Click a result to open that chat. Empty results and history-off states are explicit. The sidebar no longer contains a permanent search field above Recents. History stays off by default; enable it in Settings to save future chats.

## Voice conversation

Tap the waveform control beside Send. A separate voice conversation view opens, with the spoken transcript and latest response visible. You can speak or type there. Manual mode: Speak → Done → correct transcript → Send. Read-aloud can be enabled or disabled.

For hands-free turns, configure Live Meta and explicitly allow processing for this session. Enable Hands-free turns, then tap Speak. The browser recognition service ends a turn; finalized words are sent once. After a new reply has finished playing, listening starts again. Use Interrupt to stop the reply/generation and begin another turn. Stop cancels the loop; Close exits; moving the app into the background pauses it. Recognition failure or empty input does not send a request automatically.

This is sequential browser speech recognition → Meta text response → speech playback. It is NOT a proprietary native real-time audio model, simultaneous full-duplex conversation, or a guarantee of ChatGPT-level voice latency. Browser permission, turn boundaries, autoplay and installed voices can vary. Some browsers require another tap before listening again. Stop and type if the automatic flow is unsuitable. Manual review is preferable for consequential instructions.

English and Spanish spoken input are exposed where browser recognition supports them. Pashto/Dari microphone input is not verified. Read-aloud uses matching installed voices or the existing optional Azure service; Persian fallback is explicitly labeled, not advertised as a native Dari voice. Separate Azure credentials may be required. Speech input and cloud output may process content externally. No audio recording is stored.

## Preserved

Approved logo and all seven brand assets; black/white themes; chat and streaming adapter; typed translations; photo/document paths; Meaning Check/Mirror and Bridge Mode; six fictional demos; glossary and saved entries; optional history; settings; privacy and terms. Existing local storage keys remain unchanged. No dependency versions were changed in this release.

## Evidence and remaining work

Executed logs are in `evidence/ready`. Historical folders describe older versions. Browser-DOM and fake speech events test application logic, not real microphones, speaker quality or visual appearance. Real Meta/Azure credentials were unavailable here. No public deployment was performed. Real desktop/mobile visual checks, audio-device testing, translation review and final competition-rule review remain outstanding. Do not describe this release as medically certified or fully competition-ready.

Sources checked 10/25/2026:
- Meta API reference: https://dev.meta.ai/docs/api-reference/responses/create-response — current documented Responses endpoint, model example and bearer authentication match the preserved adapter.
- Browser recognition behavior/availability: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/continuous

The complete master prompt is included for traceability; requirements are not automatically marked complete because they appear in that file. See REQUIREMENTS_STATUS.md for the delivery boundary.
