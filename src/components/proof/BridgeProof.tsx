"use client";
import {useEffect,useRef,useState} from "react";
import type {Language} from "@/lib/languages";
import {bridgeProof} from "@/lib/proof/check";
export function BridgeProof({source,translation,from,to}:{source:string;translation:string;from:Language;to:Language}) {
 const report=bridgeProof(source,translation,from,to);
 const [semantic,setSemantic]=useState<string[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(""),[handoff,setHandoff]=useState(false),[copied,setCopied]=useState(false);
 const [semanticStatus,setSemanticStatus]=useState("");
 const controller=useRef<AbortController|null>(null),generation=useRef(0);
 useEffect(()=>{generation.current++;controller.current?.abort();setSemantic([]);setSemanticStatus("");setCopied(false);setError("");setBusy(false);setHandoff(false);return()=>{controller.current?.abort();};},[source,translation,from,to]);
 async function review(){controller.current?.abort();controller.current=new AbortController();const run=++generation.current;setBusy(true);setError("");try{
 const response=await fetch('/api/proof',{method:'POST',headers:{'Content-Type':'application/json','x-bridgevoice-access':sessionStorage.getItem('bridgevoice.access')||''},body:JSON.stringify({source,translation,from,to}),signal:controller.current.signal});
 const data=await response.json();if(!response.ok)throw Error(data.error||'Semantic review failed.');if(run===generation.current&&!controller.current.signal.aborted){setSemantic([data.summary,...data.findings]);setSemanticStatus(data.reviewStatus||"Review recommended");}
 }catch(e){if(run===generation.current)setError(e instanceof Error?e.message:'Review unavailable.');}finally{if(run===generation.current)setBusy(false);}}
 const status=semanticStatus==="Human review required"?semanticStatus:report.status==="No issue detected"&&semanticStatus==="Review recommended"?semanticStatus:report.status;
 const summary=`BridgeVoice human review request (not a certification)\n${from} → ${to}\nOriginal: ${source}\nTranslation: ${translation}\n${status}\n${report.issues.map(i=>i.message).join('\n')}\nModel review: ${semantic.join('\n')||'Not requested'}\nNo interpreter has been contacted.`;
 return <section className="bridge-proof" aria-label="BridgeProof meaning verification"><h3>BridgeProof · {status}</h3><p>{report.limits}</p>
 {report.issues.map(i=><details key={i.id}><summary>{i.message}</summary><blockquote dir="auto">{i.sourceText}</blockquote><p dir="auto">Compared with: {i.translationText}</p><p>{i.question}</p></details>)}
 {report.questions.length>0&&<details><summary>Questions to clarify</summary><ul>{report.questions.map(q=><li key={q}>{q}</li>)}</ul></details>}
 <div className="proof-actions"><button disabled={busy||!source.trim()||!translation.trim()} onClick={()=>void review()}>{busy?'Reviewing with Meta…':'Separate Meta semantic review'}</button>{busy&&<button onClick={()=>{generation.current++;controller.current?.abort();setBusy(false);}}>Cancel review</button>}<button onClick={()=>setHandoff(!handoff)}>{handoff?'Close handoff summary':'Prepare human handoff'}</button></div>
 {error&&<p role="alert">{error}</p>}{semantic.length>0&&<div><b>Separate Meta review · fallible, not independent proof</b>{semantic.map((s,i)=><p key={i} dir="auto">{s}</p>)}</div>}
 {handoff&&<div><p>No interpreter is connected. Pause consequential decisions and arrange a qualified interpreter through your organization. Nothing is sent by this action.</p><textarea aria-label="Human handoff summary" readOnly value={summary} rows={6}/><button onClick={()=>void navigator.clipboard.writeText(summary).then(()=>setCopied(true)).catch(()=>setError('Copy unavailable. Select the summary and copy manually.'))}>{copied?'Copied':'Copy handoff summary'}</button></div>}
 </section>;
}
