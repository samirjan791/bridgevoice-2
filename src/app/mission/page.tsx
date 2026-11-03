"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
type Stage = {id:string;label:string;output:string;warnings:string[]};
export default function MissionPage(){
 const [goal,setGoal]=useState(""); const [documentText,setDocumentText]=useState("");
 const [language,setLanguage]=useState<"en"|"ps"|"fa-AF"|"es-US">("en");
 const [stages,setStages]=useState<Stage[]>([]);const [busy,setBusy]=useState(false);
 const [error,setError]=useState(""); const [complete,setComplete]=useState(false);
 const abort=useRef<AbortController|null>(null);
 async function run(){
  abort.current?.abort();const ctrl=new AbortController();abort.current=ctrl;
  setStages([]);setError("");setComplete(false);setBusy(true);
  try {
   const res=await fetch("/api/mission",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({goal,documentText,language}),signal:ctrl.signal});
   if(!res.ok){const json=await res.json();throw new Error(json.error||"Mission unavailable");}
   if(!res.body)throw new Error("Streaming unavailable");
   const reader=res.body.getReader();const decoder=new TextDecoder();let buffer="";
   while(true){const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});const parts=buffer.split("\n\n");buffer=parts.pop()||"";
    for(const part of parts){const line=part.split("\n").find(x=>x.startsWith("data: "));if(!line)continue;const event=JSON.parse(line.slice(6));if(event.type==="stage")setStages(old=>[...old,event.stage]);if(event.type==="done")setComplete(true);if(event.type==="error")setError(event.error);}
   }
  }catch(e){if(!ctrl.signal.aborted)setError(e instanceof Error?e.message:"Mission failed");}
  finally{setBusy(false);}
 }
 return <main style={{maxWidth:880,margin:"0 auto",padding:"32px 20px 100px",lineHeight:1.6}}>
 <Link href="/app">← Back to BridgeVoice chat</Link>
 <h1 style={{fontSize:32,fontWeight:750,marginTop:24}}>BridgeMission <span style={{fontSize:15,fontWeight:400}}>Ω Preview</span></h1>
 <p>One goal. Four verified stages. Uses your existing Meta API configuration. No external actions are performed.</p>
 <label htmlFor="mission-goal" style={{display:"block",fontWeight:600,marginTop:20}}>What do you want to accomplish?</label>
 <textarea id="mission-goal" value={goal} onChange={e=>setGoal(e.target.value)} maxLength={6000} rows={4} placeholder="Explain this English document in Pashto, identify deadlines, and draft a response..." style={{width:"100%",padding:14,border:"1px solid #aaa",borderRadius:12,background:"transparent",color:"inherit"}}/>
 <label htmlFor="mission-doc" style={{display:"block",fontWeight:600,marginTop:12}}>Reference text (optional)</label>
 <textarea id="mission-doc" value={documentText} onChange={e=>setDocumentText(e.target.value)} maxLength={16000} rows={4} placeholder="Paste document text here. Documents are treated as evidence, not instructions." style={{width:"100%",padding:14,border:"1px solid #aaa",borderRadius:12,background:"transparent",color:"inherit"}}/>
 <label htmlFor="mission-language" style={{display:"block",fontWeight:600,marginTop:12}}>Response language</label>
 <select id="mission-language" value={language} onChange={e=>setLanguage(e.target.value as typeof language)} style={{padding:12,borderRadius:9,background:"transparent",color:"inherit",border:"1px solid #aaa"}}><option value="en">English</option><option value="ps">Pashto</option><option value="fa-AF">Dari</option><option value="es-US">Spanish</option></select>
 <div style={{display:"flex",gap:10,marginTop:20}}><button onClick={run} disabled={busy||goal.trim().length<5} style={{background:"#1864d9",color:"white",border:0,borderRadius:20,padding:"11px 22px",opacity:busy?0.6:1}}>{busy?"Working...":"Run mission"}</button>{busy&&<button onClick={()=>abort.current?.abort()} style={{border:"1px solid #aaa",borderRadius:20,padding:"10px 20px"}}>Cancel</button>}</div>
 <p role="status">{busy?`Processing stage ${Math.min(stages.length+1,4)} of 4...`:complete?"Mission completed. Review all outputs before taking action.":""}</p>
 {error&&<p role="alert" style={{color:"#c44"}}>{error}</p>}
 {stages.map((s,i)=><section key={s.id} style={{border:"1px solid #ccc",borderRadius:14,padding:20,marginTop:18}}><h2 style={{fontSize:19,fontWeight:700}}>{i+1}. {s.label}</h2><div style={{overflowWrap:"anywhere"}}><ReactMarkdown remarkPlugins={[remarkGfm]}>{s.output}</ReactMarkdown></div>{s.warnings.length>0&&<details><summary>Review notes ({s.warnings.length})</summary><ul>{s.warnings.map((w,j)=><li key={j}>{w}</li>)}</ul></details>}</section>)}
 <p style={{marginTop:30,fontSize:13,opacity:.7}}>Preview limitation: No external web browsing, emails, bookings, background jobs or phone calls. Verify critical facts independently.</p>
 </main>;
}
