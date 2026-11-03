# BridgeVoice Brand Update

This is a **non-destructive visual update** to the uploaded Next.js project.

- Replaced the small sidebar/header symbol with a crop of the supplied official BridgeVoice artwork.
- Updated the browser favicon and Apple touch icon to the same identity.
- Retained the complete original logo for the welcome screen and social previews.
- Added subtle hover refinement respecting reduced-motion preferences.
- Kept API routes, application features, tests, scripts, dependencies, and original bridge-symbol.svg intact.
- Added a 1024px iOS icon asset for future Xcode packaging. This archive is **not yet an Xcode project**.

## Run

```bash
cd ~/Downloads/bridgevoice-2
npm install
npm run dev
```

Use a separate folder or back up your current folder before replacing files. The existing `tests/ui.test.tsx` expects the original full-brand image path, which is retained. No build/test execution is claimed here.
