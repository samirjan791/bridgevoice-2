// Verifies process startup only. It does not perform browser or HTTP UI testing.
import { spawn } from 'node:child_process';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '0'], { env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore','pipe','pipe'] });
let ready = false;
const timer = setTimeout(() => { console.error('Startup timed out'); server.kill('SIGTERM'); process.exitCode=1; }, 15000);
server.stdout.on('data', chunk => { const text=chunk.toString(); process.stdout.write(text); if (/Ready in/.test(text)) { ready=true; clearTimeout(timer); console.log('Production process startup verified; no browser requests performed.'); server.kill('SIGTERM'); } });
server.stderr.on('data',chunk=>process.stderr.write(chunk));
server.on('exit',code=>{clearTimeout(timer);if(!ready){console.error('Server did not report ready. Exit:',code);process.exitCode=1;}});
