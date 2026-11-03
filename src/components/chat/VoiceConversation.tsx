"use client";
import {useRef,useState} from "react";
import {Volume2,VolumeX,X,Keyboard,RotateCcw,SlidersHorizontal,ArrowLeft} from "lucide-react";
import {RobotAvatar} from "../brand/RobotAvatar";
import {VoiceBridge} from "./VoiceBridge";

import {useLiveConversation,VoiceProps} from "@/lib/use-live-conversation";
import {Language,packs} from "@/lib/languages";
import {APP_NAME} from "@/lib/brand";
export function VoiceConversation(props:VoiceProps){
 const {language,error,onTarget}=props;
 const {configured,active,muted,setMuted,mutedRef,verified,speech,voice,notice,state,panel,close,begin,input,capabilities,changeInput}=useLiveConversation(props);
 const [options,setOptions]=useState(false);
 const optionsButton=useRef<HTMLButtonElement>(null);
 const failure=notice||speech.error||voice.error||error;
 const status=configured===null?"Connecting…":!configured?"Meta connection required":!speech.supported?"Speech input unavailable":muted?"Replies muted":state;
 const hideOptions=()=>{setOptions(false);optionsButton.current?.focus();};
 return <div className="voice-overlay live-voice voice-focus" role="dialog" aria-modal="true" aria-labelledby="voice-title" ref={panel} onKeyDown={e=>{if(e.key==='Escape'&&options){e.stopPropagation();hideOptions();}}}>
   <header><button aria-label="Return to chat" onClick={close}><ArrowLeft/></button><span id="voice-title" className="voice-brand-identity"><RobotAvatar size={36}/><span>{APP_NAME}<small className="robot-meta-label">Powered by Meta</small></span></span><button ref={optionsButton} aria-label="Voice settings" aria-expanded={options} aria-controls="voice-settings" onClick={()=>setOptions(!options)}><SlidersHorizontal/></button></header>
   <div className="voice-stage">
    <VoiceBridge meter={false} state={muted?"muted":state==="Error"?"error":voice.speaking?"speaking":voice.loading?"processing":state==="Translating"?"translating":state==="Processing"?"processing":speech.listening?"listening":"ready"}/>
    <h2 aria-live="polite">{status}</h2>
    {failure&&<p className="voice-error" role="status">{failure}</p>}
    {!active&&configured&&speech.supported&&<button className="voice-retry" onClick={begin}><RotateCcw size={16}/>Retry voice</button>}
   </div>
   {options&&<section id="voice-settings" className="voice-settings-sheet" aria-label="Voice settings"><div className="voice-settings-heading"><h3>Voice settings</h3><button aria-label="Close voice settings" onClick={hideOptions}><X size={20}/></button></div>
    <div className="voice-language-pair"><label>Spoken input<select value={input} onChange={e=>changeInput(e.target.value as Language)}>{Object.values(packs).filter(p=>p.id===input||capabilities.find(c=>c.language===p.id)?.status==='available').map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>{onTarget&&<label>Reply language<select value={language} onChange={e=>onTarget(e.target.value as Language)}>{Object.values(packs).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}</div>
    <p>{active&&verified?"Live Meta · session active":configured?"Meta configured · verified after a successful reply":"Meta connection required"}</p>
    <details><summary>Speech availability and privacy</summary>{capabilities.map(c=><p key={c.language}>{packs[c.language].name}: {c.status} — {c.detail}</p>)}<p>Speak to interrupt. Headphones reduce echo. Recognition depends on your browser and language; Type instead is always available. Replies use installed voices or configured Azure Speech; Dari may use Persian pronunciation. BridgeVoice does not save audio. Your browser speech service may process it remotely.</p></details>
   </section>}
   <footer className="voice-bottom-controls">
    <div className="voice-input-pill"><button onClick={close}><Keyboard size={20}/><span>Type instead</span></button><span role="status">{speech.listening?"Listening…":"Microphone ready"}</span></div>
    <button className="voice-round" aria-label={muted?"Unmute replies":"Mute replies"} aria-pressed={muted} onClick={()=>{mutedRef.current=!muted;setMuted(!muted);if(!muted)voice.stop();}}>{muted?<VolumeX/>:<Volume2/>}</button>
    <button className="voice-round voice-end" aria-label="End voice session" onClick={close}><X/></button>
   </footer>
 </div>;
}
