# Private prototype deployment

1. Use a Node hosting environment compatible with Next.js 16 and the project's Node >=24.15 requirement. Run `npm ci`, all checks, then `npm run build` and `npm start`.
2. Set credentials through the host's secret manager; configure `BRIDGEVOICE_ACCESS_TOKEN`. Do not expose a public unmetered Meta proxy. Keep `ENABLE_BRIDGE_CALLS=false`.
3. Serve HTTPS. Browser microphone input needs a secure origin (localhost is a development exception). Ensure the proxy forwards streaming responses without buffering and preserves cancellation.
4. Confirm origin handling behind the actual proxy; do not weaken origin validation to solve deployment mismatches. Test missing/invalid access codes, payload limits, provider errors and cancellation.
5. Validate a fictional live translation, semantic review and each intended language/voice on the actual browser/device. Test headset interruption, denied permission, offline recovery and rapid start/stop.
6. For multiple instances, add shared rate/concurrency enforcement, real user access controls, usage/billing monitoring and retention policy. Current in-memory limits are per process, not a fleet-wide budget.
7. Perform manual mobile/RTL/light/dark and accessibility checks before publishing. Preserve previous deployment for rollback.

No deployment was performed in this run. This does not establish HIPAA compliance, language-access compliance or qualified-interpreter equivalence. Healthcare use remains a controlled prototype pending the required reviews and contracts. Do not record or retain sensitive content by default.
