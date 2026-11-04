#!/usr/bin/env node
// Offline preflight: does not contact production or read secret values.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const read = p => readFileSync(join(root,p),'utf8');
const checks = [
 ['Version 4.4',()=>JSON.parse(read('package.json')).version==='4.4.0'],
 ['Versioned settings',()=>read('src/components/providers.tsx').includes('bridgevoice.settings.v3')],
 ['Dari agreement defaults OFF',()=>/allowPersian:\s*false/.test(read('src/components/providers.tsx'))],
 ['Agent follows translation language',()=>read('src/app/agent/page.tsx').includes('settings.agentLanguage || settings.target')],
 ['Dari speech requires consent',()=>read('src/app/api/speech/route.ts').includes('!data.data.allowPersian')],
 ['Agent dark mode styling',()=>read('src/app/agent/agent.css').includes('html[data-theme="dark"] .agent-page')],
 ['Access-test uses deployment gate secret',()=>read('src/app/api/access-test/route.ts').includes('process.env.BRIDGEVOICE_ACCESS_TOKEN')],
 ['Access-test timing safe compare',()=>read('src/app/api/access-test/route.ts').includes('timingSafeEqual')],
 ['Robots disallow',()=>existsSync(join(root,'src/app/robots.ts'))||existsSync(join(root,'public/robots.txt'))],
 ['No private .env.local in project',()=>!existsSync(join(root,'.env.local'))],
];
let failures=0;
for(const [name,test] of checks){let ok=false;try{ok=!!test()}catch{};console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failures++;}
console.log(`\n${checks.length-failures}/${checks.length} offline checks passed. This is NOT a build, integration, browser, or security audit.`);
process.exitCode=failures?1:0;
