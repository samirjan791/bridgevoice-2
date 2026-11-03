# Compact mobile composer — 3.4.1

The focused mobile composer previously forced a 66px text area, 12px outer padding and 8px gap. It now uses a 40px CSS minimum, 8px vertical padding and 4px gap; the existing content autosizer still controls actual text height. The empty focused composer is approximately 104px tall instead of 138px. It expands for longer text and attachments.

Removed the legacy blue focus halo in mobile layout; a neutral focus border remains. Individual keyboard controls retain their focus styles. Bottom viewport positioning and attachment previews are preserved.

Changed files: src/styles/mobile-composer.css, package.json, package-lock.json, README.md, COMPACT_COMPOSER_UPDATE.md; verification logs in evidence/compact-composer.

Meta API routes, credentials handling, speech engine and exact original robot video are unchanged. No live API or microphone test was performed. Real iPhone Safari visual verification is still required. Safari's native address and keyboard accessory bars are controlled by the browser and cannot be matched to a native app by CSS.

Verification: npm run lint, npm run typecheck, npm run test and npm run build each exited 0. Logs are included in evidence/compact-composer. The test log includes jsdom media/navigation limitations; no real-device or live API validation is claimed.
