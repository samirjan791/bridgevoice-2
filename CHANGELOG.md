# Changelog

## 2.1.0 — Opening animation, motion system, command palette

### Added
- **Opening sequence** (`src/components/intro/Intro.tsx`, `src/app/intro.css`): two greetings (Hello / سلام) cross a bridge that draws itself from the real `bridge-symbol.svg` geometry, the **BridgeVoice wordmark is written stroke by stroke**, then the tagline types in. About 3.1 s. Skip with click, tap, Esc, Enter or Space. Plays once per browser session. Never plays under `prefers-reduced-motion` or when "Opening animation" / "Enable motion" is off in Settings. The chat UI is already rendered underneath; nothing waits on it.
- **Wordmark paths** generated from Inter SemiBold (SIL OFL) by `scripts/build-wordmark.py` into `src/components/intro/wordmark-paths.ts`. No fonts are parsed at runtime. Re-run the script to change the wordmark.
- **Boot script** (`src/lib/intro-boot.ts`, inlined in `<head>`): resolves the saved theme and the intro decision before first paint, so there is no wrong-theme flash. All storage access is in try/catch.
- **Living welcome line** (`RotatingWelcome.tsx`): written in once (Latin text only), then cross-fades English → Pashto → Dari → Spanish every 6 s with correct `lang`/`dir`. Pauses while typing. Arabic script is never animated per letter.
- **Command palette** (`CommandPalette.tsx`): Ctrl/Cmd+K. Ctrl/Cmd+B toggles the sidebar, Ctrl/Cmd+Shift+O starts a new chat.
- **Motion layer** (`src/lib/motion.ts`, `src/app/motion.css`): shared durations/easings, circular theme-switch reveal (View Transitions API with instant fallback), composer focus ring, send/stop pop, drawn-in Meaning Check highlights, toast animation, skeleton utility, one reduced-motion switch.
- Welcome shortcuts are now four quiet chips: Translate, Explain, Meaning Mirror (review meaning), Explain a document.
- Tab title shows "BridgeVoice · Writing…" while a reply is generating.
- Print stylesheet, `error.tsx` route error boundary, Twitter card metadata, light/dark `theme-color`.
- Single accent token `--bridge` (from the approved bridge symbol).

### Changed
- Settings load no longer lets default values overwrite the theme chosen by the boot script.
- Settings gains an "Opening animation" toggle (stored as `intro`, default on; older saved settings still load).

### Not changed
Meta-only AI path, all routes, env variable names, storage keys, glossary, history, voice, uploads and key-recovery scripts.

### Known gaps
- Meaning Lens span *pairing across languages* (hover a highlight in the original to see its match in the translation) is not built. It needs span alignment from the model. Highlights in Meaning Check are animated, not paired.
- `globals.css` was not rewritten; the new layer is loaded after it (`motion.css`). Consolidating the old overrides is still worth doing.
- `ChatShell.tsx` was extended, not split into smaller components.
