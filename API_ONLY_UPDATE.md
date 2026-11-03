# BridgeVoice — API-only update

The application has one AI provider: Meta. The mode selector, deterministic chat-answer provider, legacy demo provider, and standalone guided sample entry point have been removed. Fictional demo transcripts now go through the same Meta API pipeline as typed conversations. Missing key, lost internet or provider failures show errors; no fixture or fallback response is substituted.

Your logo, sidebar/history search, stored chats, glossary, deterministic safety checks, voice interface, uploads and API-key recovery are preserved. Saved data and safety validation still use local browser/application code; they are not alternate AI modes. Speech recognition/read-aloud retain the existing browser or configured speech providers.

## Run

Extract into Downloads. Stop the old server with Control+C, then:

```bash
cd "$HOME/Downloads/bridgevoice-api-only"
bash START_WITH_EXISTING_KEY.command
```

Keep older BridgeVoice folders in Downloads for configuration recovery. Existing keys are preserved. If one unambiguous prior key is found, the launcher restores provider fields with a private backup; it never prints credentials. No key is included in this ZIP. Use the same browser and localhost/127.0.0.1 address as before to access your existing saved data.

Open http://localhost:3000 after Ready (or http://127.0.0.1:3000 if that was your prior address). Confirm permission under Connection options. Internet, a valid Meta API key and model access are required to receive AI answers.

## Verification

See evidence/api-only for executed tests, lint, production build and process startup. Mocked API responses exist only in tests and are not imported into application code. No authenticated Meta request, physical voice-device check, browser visual QA or public deployment was performed here. Previous evidence folders and older release notes describe historical versions; this update takes precedence wherever they describe provider modes.
