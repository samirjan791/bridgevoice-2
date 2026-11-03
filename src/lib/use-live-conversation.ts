"use client";
import {useEffect,useRef,useState} from "react";
import {useSpeech} from "@/lib/use-speech";
import {useVoiceOutput} from "@/lib/use-voice-output";
import {lockModalScroll} from "@/lib/modal-scroll";
import {detectSpeechInputs,speechLocale,InputCapability} from "@/lib/speech-capabilities";
import type {Language} from "@/lib/languages";
export type VoiceProps={onClose:()=>void;onSend:(text:string,language:Language)=>Promise<boolean>;onStop:()=>void;busy:boolean;answer?:{id:string;text:string;language:Language};language:Language;volume:number;error:string;live?:boolean;canConverse?:boolean;onEnableLive?:()=>void;onTarget?:(language:Language)=>void};
export function useLiveConversation({onClose,onSend,onStop,busy,answer,language,volume,error}:VoiceProps){
 const [configured,setConfigured]=useState<boolean|null>(null);
 const [active,setActive]=useState(false),[muted,setMuted]=useState(false),[notice,setNotice]=useState("");
 const [verified,setVerified]=useState(false),[lastTurn,setLastTurn]=useState("");
 const [input,setInput]=useState<Language>("en");
 const inputLanguage=speechLocale[input];
 const [capabilities,setCapabilities]=useState<InputCapability[]>([]);
 useEffect(()=>{let valid=true;const w=window as unknown as {SpeechRecognition?:Parameters<typeof detectSpeechInputs>[0];webkitSpeechRecognition?:Parameters<typeof detectSpeechInputs>[0]};void detectSpeechInputs(w.SpeechRecognition||w.webkitSpeechRecognition).then(c=>{if(valid)setCapabilities(c);});return()=>{valid=false;};},[]);
 const running=useRef(false), started=useRef(false), mutedRef=useRef(false);
 const pending=useRef(""), epoch=useRef(0), inFlight=useRef(false), waiting=useRef(false);
 const previous=useRef(answer?.id), output=useRef("");
 const timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const restart=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const activity=useRef<(text:string)=>void>(()=>{}), final=useRef<(text:string)=>void>(()=>{}), ended=useRef<(failed:boolean)=>void>(()=>{});
 const speech=useSpeech(text=>final.current(text),failed=>ended.current(failed),text=>activity.current(text));
 const voice=useVoiceOutput(language,volume,true);
 const latest=useRef({speech,voice,onSend,onStop,onClose,inputLanguage,input,answer});
 latest.current={speech,voice,onSend,onStop,onClose,inputLanguage,input,answer};
 const panel=useRef<HTMLDivElement>(null);
 function stop(){
   running.current=false;epoch.current++;waiting.current=false;inFlight.current=false;
   clearTimeout(timer.current);clearTimeout(restart.current);pending.current="";
   latest.current.speech.stop();latest.current.voice.stop();latest.current.onStop();setActive(false);
 }
 function begin(){
   stop();setVerified(false);setNotice("");running.current=true;setActive(true);
   latest.current.speech.start(latest.current.inputLanguage);
 }
 function close(){stop();latest.current.onClose();}
 // Ignore recognizable playback echoes. A headset is still recommended because
 // browser recognition implementations differ in their acoustic echo handling.
 function isEcho(text:string){
   const normalize=(s:string)=>s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,"").replace(/\s+/g," ").trim();
   return latest.current.voice.speaking && normalize(text).length>2 && normalize(output.current).includes(normalize(text));
 }
 activity.current=text=>{
   if(!running.current||isEcho(text))return;
   if(latest.current.voice.speaking||latest.current.voice.loading||inFlight.current||waiting.current){
     epoch.current++;waiting.current=false;inFlight.current=false;
     latest.current.voice.stop();latest.current.onStop();
   }
   clearTimeout(timer.current);
 };
 async function submit(){
   const text=pending.current.trim();if(!running.current||!text||inFlight.current)return;
   pending.current="";setLastTurn(text);const run=++epoch.current;
   inFlight.current=true;waiting.current=true;previous.current=latest.current.answer?.id;
   try{
     const ok=await latest.current.onSend(text,latest.current.input);
     if(run!==epoch.current)return;
     if(ok)setVerified(true);
     else{stop();setNotice("This voice turn could not be completed. Check the connection, then retry.");}
   }catch{if(run===epoch.current){stop();setNotice("Connection interrupted. Retry voice or type instead.");}}
   finally{if(run===epoch.current)inFlight.current=false;}
 }
 final.current=text=>{
   if(!running.current||isEcho(text))return;
   pending.current=(pending.current+" "+text).trim().slice(0,12000);
   clearTimeout(timer.current);timer.current=setTimeout(()=>void submit(),650);
 };
 ended.current=failed=>{
   if(!running.current)return;
   if(failed){stop();setNotice("Listening stopped. Check microphone permission and retry.");return;}
   if(pending.current.trim()){clearTimeout(timer.current);timer.current=setTimeout(()=>void submit(),250);}
   clearTimeout(restart.current);
   restart.current=setTimeout(()=>{if(running.current)latest.current.speech.start(latest.current.inputLanguage);},300);
 };
 useEffect(()=>{
   const controller=new AbortController();
   fetch("/api/status",{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error();return r.json();}).then(r=>setConfigured(!!r.configured)).catch(()=>{if(!controller.signal.aborted){setConfigured(false);setNotice("Could not check the Meta connection.");}});
   return()=>controller.abort();
 },[]);
 useEffect(()=>{
   if(configured&&speech.supported&&!started.current){started.current=true;running.current=true;setActive(true);latest.current.speech.start(latest.current.inputLanguage);}
 },[configured,speech.supported,input]);
 useEffect(()=>{
   if(running.current&&waiting.current&&!busy&&answer&&answer.id!==previous.current){
     waiting.current=false;previous.current=answer.id;output.current=answer.text;
     if(!mutedRef.current)void latest.current.voice.speak(answer.text,answer.language);
   }
 },[answer,busy]);
 useEffect(()=>{
   const before=document.activeElement as HTMLElement|null,unlock=lockModalScroll();
   panel.current?.querySelector<HTMLButtonElement>("button")?.focus();
   function cleanup(){running.current=false;epoch.current++;clearTimeout(timer.current);clearTimeout(restart.current);latest.current.speech.stop();latest.current.voice.stop();latest.current.onStop();}
   const key=(e:KeyboardEvent)=>{
     if(e.key==="Escape"){e.preventDefault();cleanup();latest.current.onClose();}
     if(e.key!=="Tab")return;
     const nodes=[...(panel.current?.querySelectorAll<HTMLElement>('button,select')||[])];
     if(e.shiftKey&&document.activeElement===nodes[0]){e.preventDefault();nodes.at(-1)?.focus();}
     else if(!e.shiftKey&&document.activeElement===nodes.at(-1)){e.preventDefault();nodes[0]?.focus();}
   };
   const visibility=()=>{if(document.hidden){cleanup();setActive(false);setNotice("Voice stopped when the app moved to the background. Retry to resume.");}};
   window.addEventListener("keydown",key);document.addEventListener("visibilitychange",visibility);
   return()=>{cleanup();unlock();window.removeEventListener("keydown",key);document.removeEventListener("visibilitychange",visibility);before?.focus();};
 },[]);
 const state=(speech.error||voice.error||error||notice)?"Error":voice.speaking?"Speaking":voice.loading?"Processing":busy?(input!==language?"Translating":"Processing"):speech.listening?"Listening":"Ready when you are";
 function changeInput(next:Language){stop();setInput(next);setNotice("");started.current=false;}
 useEffect(()=>{const offline=()=>{stop();setNotice("Internet disconnected. Reconnect and retry voice; the transcript is preserved.");};window.addEventListener("offline",offline);return()=>window.removeEventListener("offline",offline);},[]);
 return {configured,active,muted,setMuted,mutedRef,verified,lastTurn,speech,voice,notice,state,panel,close,begin,input,capabilities,changeInput};
}
