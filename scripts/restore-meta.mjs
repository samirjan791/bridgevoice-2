// Reads only nearby BridgeVoice project configuration. Never executes environment files.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const allowed=['MODEL_API_KEY','META_API_KEY','META_MODEL_ID','META_API_BASE_URL','AZURE_SPEECH_KEY','AZURE_SPEECH_REGION'];
function assignments(text){
 const result=new Map();
 for(const line of text.split(/\r?\n/)){
  const m=line.match(/^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
  if(!m)continue;
  const raw=m[2];const quoted=raw.match(/^(["'])(.*?)\1\s*(?:#.*)?$/);
  const value=(quoted?quoted[2]:raw.replace(/\s+#.*$/,'')).trim();
  // Variable interpolation and multiline values require manual migration.
  if(!/[$\r\n]/.test(value))result.set(m[1],{value,line:m[1]+'='+raw});
 }
 return result;
}
const valid=value=>!!value&&value.length>8&&!/^(your|paste|replace|example|change|xxx|<)/i.test(value);
export function hasMetaKey(text){const a=assignments(text);return valid(a.get('MODEL_API_KEY')?.value)||valid(a.get('META_API_KEY')?.value);}
export function restoreMeta(root){
 const target=path.join(root,'.env.local');
 if(fs.existsSync(target)&&fs.lstatSync(target).isSymbolicLink())throw new Error('Configuration is a symlink; automatic migration skipped.');
 const current=fs.existsSync(target)?fs.readFileSync(target,'utf8'):'';
 if(hasMetaKey(current))return 'Existing Meta configuration preserved. No values were changed.';
 const candidates=[];
 function inspect(dir,depth){
  if(path.resolve(dir)===path.resolve(root))return;
  try{
   const pkg=JSON.parse(fs.readFileSync(path.join(dir,'package.json'),'utf8'));const env=path.join(dir,'.env.local');
   if(/bridgevoice/i.test(pkg.name||'')&&fs.existsSync(env)&&!fs.lstatSync(env).isSymbolicLink()&&fs.statSync(env).size<100000){
    const text=fs.readFileSync(env,'utf8');if(hasMetaKey(text))candidates.push({env,text,time:fs.statSync(env).mtimeMs});
   }
  }catch{}
  if(depth>0)try{for(const entry of fs.readdirSync(dir,{withFileTypes:true}))if(entry.isDirectory()&&!entry.name.startsWith('.')&&!['node_modules','dist','build'].includes(entry.name))inspect(path.join(dir,entry.name),depth-1);}catch{}
 }
 for(const entry of fs.readdirSync(path.dirname(root),{withFileTypes:true}))if(entry.isDirectory()&&/bridgevoice/i.test(entry.name))inspect(path.join(path.dirname(root),entry.name),2);
 candidates.sort((a,b)=>b.time-a.time);
 if(!candidates.length)return 'No previous Meta key found in nearby BridgeVoice folders. Internet and a Meta key are required for chat. Configure .env.local privately.';
 const identities=new Set(candidates.map(c=>{const a=assignments(c.text);return valid(a.get('MODEL_API_KEY')?.value)?a.get('MODEL_API_KEY').value:a.get('META_API_KEY').value;}));
 if(identities.size>1)return 'Different Meta keys were found in older projects. Nothing was changed. Copy the .env.local from your working BridgeVoice project into this folder privately, then restart.';
 const donor=assignments(candidates[0].text),existing=assignments(current),changes=new Map();
 for(const key of allowed){
  const item=donor.get(key);if(!item?.value)continue;
  if(key==='MODEL_API_KEY'||key==='META_API_KEY'){if(valid(item.value))changes.set(key,item.line);}
  else if(!existing.get(key)?.value)changes.set(key,item.line);
 }
 // A placeholder primary key must not shadow a recovered alias.
 if(!changes.has('MODEL_API_KEY')&&changes.has('META_API_KEY'))changes.set('MODEL_API_KEY','MODEL_API_KEY=');
 const merged=current.split(/\r?\n/).filter(line=>{const m=line.match(/^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)\s*=/);return !m||!changes.has(m[1]);}).join('\n').replace(/\n*$/,'')+'\n'+[...changes.values()].join('\n')+'\n';
 if(fs.existsSync(target)){const backup=target+'.backup-'+Date.now();fs.writeFileSync(backup,current,{mode:0o600,flag:'wx'});}
 const temp=target+'.migration-'+process.pid;
 try{fs.writeFileSync(temp,merged,{mode:0o600,flag:'wx'});fs.renameSync(temp,target);}finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}
 return 'Previous BridgeVoice provider configuration restored privately; unrelated current settings preserved. A live request is still needed to verify it.';
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{console.log(restoreMeta(path.resolve(fileURLToPath(new URL('..',import.meta.url)))));}catch{console.error('Configuration could not be migrated safely. Configure .env.local privately; no key values were printed.');process.exitCode=1;}
}
