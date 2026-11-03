#!/bin/bash
set -e
cd "$(dirname "$0")"
command -v node >/dev/null || { echo 'Install Node.js 24.15 or newer first.'; exit 1; }
node -e '
const fs=require("fs"),path=require("path");
const [major,minor]=process.versions.node.split(".").map(Number);
if(major<24||(major===24&&minor<15)){console.error("Node.js 24.15 or newer is required.");process.exit(1);}
const target=path.join(process.cwd(),".env.local"),downloads=path.join(process.env.HOME,"Downloads");
function configured(file){try{return fs.readFileSync(file,"utf8").split(/\r?\n/).some(line=>{const m=line.match(/^\s*(?:MODEL_API_KEY|META_API_KEY)\s*=\s*(.*)$/);return m&&m[1].replace(/["\x27]/g,"").replace(/\s+#.*$/,"").trim().length>0;});}catch{return false;}}
if(configured(target)){console.log("Preserving existing Meta configuration.");}
else {
const candidates=fs.readdirSync(downloads).filter(n=>/bridgevoice/i.test(n)).map(n=>path.join(downloads,n,".env.local")).filter(f=>f!==target&&configured(f)).sort((a,b)=>fs.statSync(b).mtimeMs-fs.statSync(a).mtimeMs);
if(!candidates.length){console.error("Copy .env.local from your working BridgeVoice folder into this folder, then run again. Do not share your key.");process.exit(1);}
if(fs.existsSync(target))fs.copyFileSync(target,target+".backup-"+Date.now());
fs.copyFileSync(candidates[0],target);fs.chmodSync(target,384);console.log("Configuration copied from "+path.dirname(candidates[0]));
}
'
npm ci
echo 'Open http://127.0.0.1:3002 once the server says Ready. Keep Terminal open.'
npm run dev -- --port 3002
