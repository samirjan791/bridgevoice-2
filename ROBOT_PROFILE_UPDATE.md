# BridgeVoice 3.2: supplied robot profile

The shared Brand component and assistant-message avatars use the actual supplied robot screen recording, silently looping. This covers sidebar/navigation, the shared page shell, the About page, and assistant messages. Static app icons, social-preview imagery and favicons use a still frame from the same footage; browsers do not display these as video.

The complete 13.73-second supplied clip was cropped to the robot (440×440 at x36/y130), resized to 384×384, encoded H.264 at 24 fps, and stripped of audio. No robot imagery was generated. Phone/Pinterest chrome outside that crop is excluded. Any overlay already baked into the source footage within the crop remains; a clean original would be needed to remove it without altering the supplied pixels. The loop repeats the supplied recording, so its original cuts remain.

Playback is muted, inline and automatic when visible. Offscreen and hidden-tab videos pause. Reduced-motion and the Settings motion switch show the poster instead. A denied autoplay request or media error also leaves the poster visible. The avatar does not imply listening, speaking or API connectivity.

Profile and assistant labels include “Powered by Meta”, as requested. This attribution is separate from the real connection indicator.

The existing bridge intro, live voice visualization and Meta adapter are unchanged. No credentials are included in the ZIP. No new packages were added.

## Changed files
- src/components/brand/RobotAvatar.tsx (new shared playback component)
- src/components/brand/Brand.tsx
- src/components/chat/ChatMessage.tsx
- src/app/globals.css
- src/app/about/page.tsx
- public/brand/robot-avatar.mp4 and robot-poster.png (new)
- public/brand/bridgevoice-unified.png, bridgevoice-mark.png, bridgevoice-approved.jpeg, bridgevoice-app-icon.png, favicon.png, apple-touch-icon.png (robot stills)
- tests/robot-avatar.test.tsx, tests/ui.test.tsx, tests/layout-controls.test.tsx
- package.json and package-lock.json (3.2.0 version)
- README.md, ROBOT_PROFILE_UPDATE.md, evidence/robot-avatar/*

## Verification
See evidence/robot-avatar for actual check output. Automated tests cover silent looping, teardown, motion preference changes, reduced motion and media-error fallback. Media frames were inspected and the encoded stream checked. Browser/device visual testing and a real Meta request were not performed in this environment. Run the included launcher with your own existing configuration to verify the live connection.

Final automated results: lint passed; typecheck passed; 219 tests across 21 files passed; production build passed. Existing metadataBase build warning remains. The Meta adapter, chat/speech routes and launcher match the previous release byte-for-byte.
