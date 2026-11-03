# BridgeVoice local API connection fix

Fixed `Cross-origin request blocked` when the browser uses `localhost:3000` and the Next.js server internally uses `127.0.0.1:3000`. Only loopback hosts with the same protocol and port are treated as equivalent; unrelated origins remain blocked. Added regression tests.

## Install without losing your secret

Your existing `.env.local` stays on your Mac and is NOT included in this ZIP. Before replacing the old project folder, copy `.env.local` into the new extracted `bridgevoice-2` folder. Do not share or upload that file.

Restart with `npm install` and `npm run dev`, then test Live Meta mode. The API key, model access, billing, endpoint, and full response behavior still require live verification.
