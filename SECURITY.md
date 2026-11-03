BridgeVoice 3.0 update: consult README.md and docs/v3/IMPLEMENTATION_REPORT.md for current status. Live-service, hardware and telephone acceptance remain unverified. Prior notes below describe the original build, not current readiness.

# Security and privacy notes

Keep MODEL_API_KEY/META_API_KEY in private server environment variables. The client never receives them. .gitignore excludes local environment files. No application code logs conversations, documents or credentials.

API boundaries validate request data, cap request bodies, reject mismatched Origin headers, optionally require BRIDGEVOICE_ACCESS_TOKEN, and limit per-process concurrency and requests. Origin checks do not authenticate non-browser clients. A publicly reachable deployment needs stronger authentication/abuse protection and distributed limits. The access code is a separate private demo credential, never a Meta key; it is held in the browser tab's sessionStorage.

Documents are untrusted data, never system instructions. Prompt separation reduces risk but cannot guarantee prevention of semantic prompt injection. No model-controlled network/tool execution is exposed. PDF/DOCX extraction is in server memory, with byte/context/archive limits; no OCR or encrypted-file unlocking is promised. Malicious document parsing needs further isolation before public sensitive use.

Markdown raw HTML is disabled, links use safe rendering, images from model text are not loaded, JSON imports are schema-validated, and CSV export mitigates spreadsheet formula injection. Headers include nosniff, no-referrer, camera denial, self-only microphone and frame denial. A strict production Content Security Policy is not included and needs host-specific testing.

Optional history and saved glossary can contain sensitive content and are not encrypted at rest by this app. Use fictional data for demos, obtain consent for microphone and external model processing, and clear local data when appropriate. No HIPAA or professional certification is claimed.

Run `npm audit --omit=dev` and review dependencies before deployment. Audit results describe the registry response on the execution date, not a security guarantee. Deployment operators should publish their own security/contact process before a public service launch; this source distribution does not invent contact details.
