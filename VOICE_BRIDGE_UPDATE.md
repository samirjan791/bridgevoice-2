# Voice center animation only

The center orb is replaced by SVG using the exact four bridge paths from the existing intro. No new dependencies, images or video assets were added. The voice engine, transcript/history integration, controls, center footprint, surrounding layout and other screens are unchanged.

States:
- Ready: complete bridge with a slow CSS glow pulse.
- Listening: ripple arcs, with strength driven by a local visual-only microphone amplitude analyser. It does not connect to speakers or send/save audio; permission failure falls back to the gentle state ripple. Its stream is released when leaving listening, muting, disabling motion or unmounting.
- Thinking/preparing audio: staggered stroke redraw.
- Speaking: light flows across the deck only during playback. The existing voice engine exposes speaking state, not output waveform/timing, so this is a paced CSS sweep and is NOT beat- or phoneme-synchronized to reply audio. Achieving exact rhythm synchronization would require an engine-interface change, which this update deliberately does not make.
- Muted: grey, dim and still; the existing text state remains visible with “Replies muted”.

Both system reduced motion and the Settings motion switch disable all bridge animation and visual metering. State text remains available and the engine continues normally.

Validation: typecheck, lint, 171 unit/component tests and production build. Automated tests cover bridge paths, states, motion preferences, live microphone amplitude sampling/cleanup with simulated audio, and all existing voice tests. Real microphone/acoustic performance, actual Meta replies and browser visual click-through remain unverified in this environment; no new claim of ChatGPT-equivalent voice behavior is made.
