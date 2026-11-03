import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { restoreMeta, hasMetaKey } from './restore-meta.mjs';
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'bridgevoice restore test '));
try {
 const current=path.join(tmp,'bridgevoice current'),previous=path.join(tmp,'bridgevoice previous');
 fs.mkdirSync(current);fs.mkdirSync(previous);
 fs.writeFileSync(path.join(previous,'package.json'),JSON.stringify({name:'bridgevoice-2'}));
 assert.equal(hasMetaKey('META_API_KEY=your_key_here'),false);
 assert.match(restoreMeta(current),/No previous/);
 fs.writeFileSync(path.join(previous,'.env.local'),'MODEL_API_KEY="fixture-not-a-real-key"\nBRIDGEVOICE_ACCESS_TOKEN=old-setting\nAZURE_SPEECH_REGION=westus\n');
 fs.writeFileSync(path.join(current,'.env.local'),'MODEL_API_KEY=\nBRIDGEVOICE_ACCESS_TOKEN=keep-current-setting\n');
 assert.match(restoreMeta(current),/restored/);
 const env=path.join(current,'.env.local');assert.equal(fs.statSync(env).mode&0o777,0o600);
 const unchanged=fs.readFileSync(env,'utf8');assert(unchanged.includes('keep-current-setting'));assert(!unchanged.includes('old-setting'));
 assert(unchanged.includes('AZURE_SPEECH_REGION=westus'));
 assert.match(restoreMeta(current),/preserved/);assert.equal(fs.readFileSync(env,'utf8'),unchanged);
 const backups=fs.readdirSync(current).filter(n=>n.startsWith('.env.local.backup-'));assert.equal(backups.length,1);assert.equal(fs.statSync(path.join(current,backups[0])).mode&0o777,0o600);
 const other=path.join(tmp,'bridgevoice other');fs.mkdirSync(other);fs.writeFileSync(path.join(other,'package.json'),' {"name":"bridgevoice-2"}');fs.writeFileSync(path.join(other,'.env.local'),'META_API_KEY=second-fixture-key\n');
 fs.writeFileSync(env,'MODEL_API_KEY=\n');assert.match(restoreMeta(current),/Different Meta keys/);assert.equal(fs.readFileSync(env,'utf8'),'MODEL_API_KEY=\n');
 console.log('PASS: placeholder rejection; no donor; selective recovery; unrelated settings preserved; private file/backup permissions; existing key preserved; ambiguous keys cause no mutation; path containing spaces. No real credentials used.');
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
