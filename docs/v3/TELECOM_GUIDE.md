# BridgeCall integration — experimental and disabled

## What exists

`/bridge-call` is a local fictional routing/lifecycle demonstration. It does not translate its payload, process audio or call a number. `session.ts` tests consent, recipient isolation, duplicate/generated-output rejection, handoff pause, failure and timeout. This is application logic, not acoustic echo cancellation.

`TelephoneProvider` defines create/end operations. `TwilioAdapter` implements an injectable REST transport with explicit authorization, both caller consent assertions, destination allowlist, up to two participants, two creation attempts/minute, <=120-second duration, timeout and estimated reserved-budget checks. All executions in this delivery used mocked transport. In-memory reservations are not an exact provider bill or distributed spending cap. An uncertain provider timeout requires reconciliation before retry; the adapter cannot guarantee no remote call was created.

`/api/calls` rejects creation with the flag off, requires deployment authentication when enabled, and then returns 501 because the media gateway is missing. `/api/calls/webhook` checks bounded form data and a canonical URL signature, but valid events still return 503 until a durable registry and consumer exist. It must not be configured as a production webhook yet.

## Provider evaluation and required architecture

Twilio offers bidirectional Media Streams and call-leg lifecycle APIs. Telnyx offers bidirectional streaming as an alternative. The current adapter targets Twilio REST only; no Telnyx adapter is implemented. A normal mixed conference stream is insufficient evidence that each person receives only their intended translated audio.

Use two isolated telephone legs, each attached to an authenticated WSS gateway. Bind every stream SID/call SID to an authorized participant. Decode the provider's negotiated codec, run validated language-capable STT, send text through the existing Meta adapter, synthesize in the recipient language, encode the required output format and send only to the opposite leg. Do not feed generated output into the source-input bus. Track sequence IDs and generation epochs. Implement provider clear/mark acknowledgements for interruption; validate acoustic echo handling rather than relying only on labels. Explicit turn-taking is an acceptable initial limitation.

Before activation:

1. Obtain provider test credentials, approved caller IDs and two authorized test endpoints. Use fictional conversations. Obtain explicit user authorization before placing any real call.
2. Build the WSS gateway, call registry and verified lifecycle consumer. Authenticate HTTP and WebSocket handshakes. Validate exact public URL signatures using the provider's supported SDK or verified equivalent. Current helper handles only unique form fields, not JSON/body hashes or all webhook formats.
3. Add persistent idempotency, per-account limits, billing reconciliation, server-enforced deadline/hangup and auditable events that omit conversation content by default. Verify failure cleanup for both legs.
4. Integrate and externally verify STT/TTS in each intended language; do not infer Pashto support from available output voices.
5. Test who hears what with two actual phones, including silence, simultaneous speech, interruption, generated-audio echo, duplicated callbacks, provider outage, disconnect and emergency termination.
6. Integrate actual human dispatch if desired. Until then, handoff means pause plus a local summary, not a connected interpreter.
7. Complete consent/telecom/vendor/legal reviews and only then replace the 501 guard through a reviewed implementation. Keep the feature off until acceptance evidence exists.

## Provider references

- https://www.twilio.com/docs/voice/media-streams
- https://www.twilio.com/docs/usage/security
- https://www.twilio.com/docs/voice/api/call-resource
- https://developers.telnyx.com/docs/voice/programmable-voice/media-streaming

The future customer endpoint can be a normal telephone without an app, but that experience is not working in this build.
