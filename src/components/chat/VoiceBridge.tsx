"use client";
import { useEffect, useRef, useState } from "react";
import { usePreferences } from "@/components/providers";
import "./voice-bridge.css";

export type VoiceBridgeState = "ready" | "listening" | "thinking" | "speaking" | "muted" | "processing" | "translating" | "error";
// Same four paths as the intro's bridge; no replacement brand artwork.
export const BRIDGE_PATHS = [
  "M12 38c10-24 30-24 40 0",
  "M12 43h40",
  "M24 31v11M32 26v17M40 31v11",
  "M8 27v8M56 27v8",
] as const;

export function VoiceBridge({state,meter=true}: {state: VoiceBridgeState;meter?:boolean}) {
  const {settings}=usePreferences();
  const [reduced,setReduced]=useState(true);
  const svg=useRef<SVGSVGElement>(null);
  useEffect(()=>{
    if(typeof window.matchMedia!=="function")return;
    const query=window.matchMedia("(prefers-reduced-motion: reduce)");
    const update=()=>setReduced(query.matches);update();
    query.addEventListener("change",update);
    return()=>query.removeEventListener("change",update);
  },[]);
  const motion=settings.motion&&!reduced;
  useEffect(()=>{
    const element=svg.current;
    element?.style.setProperty("--bridge-ripple","1");
    if(!meter||state!=="listening"||!motion||!navigator.mediaDevices?.getUserMedia)return;
    // Optional visual-only meter. Never sends audio, drives a voice turn or
    // connects to the audio destination. Recognition remains wholly separate.
    let disposed=false,frame=0;
    let stream:MediaStream|undefined,context:AudioContext|undefined;
    const release=()=>{stream?.getTracks().forEach(track=>track.stop());if(context&&context.state!=="closed")void context.close().catch(()=>{});};
    void navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}}).then(async acquired=>{
      if(disposed){acquired.getTracks().forEach(track=>track.stop());return;}
      stream=acquired;context=new AudioContext();await context.resume();
      if(disposed){release();return;}
      const analyser=context.createAnalyser();analyser.fftSize=256;
      context.createMediaStreamSource(stream).connect(analyser);
      const samples=new Uint8Array(analyser.fftSize);let smoothed=0;
      const sample=()=>{
        if(disposed)return;
        analyser.getByteTimeDomainData(samples);
        const rms=Math.sqrt(samples.reduce((sum,value)=>sum+((value-128)/128)**2,0)/samples.length);
        smoothed=smoothed*.7+Math.min(1,rms*5)*.3;
        element?.style.setProperty("--bridge-ripple",String(1+smoothed*.16));
        frame=requestAnimationFrame(sample);
      };sample();
    }).catch(()=>{release();});
    return()=>{disposed=true;cancelAnimationFrame(frame);release();element?.style.setProperty("--bridge-ripple","1");};
  },[state,motion,meter]);
  return <div className="voice-bridge" data-state={state} data-motion={motion?"on":"off"} aria-hidden="true">
    <svg ref={svg} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" focusable="false">
      <g className="bridge-ripple"><path d={BRIDGE_PATHS[0]}/><path d={BRIDGE_PATHS[0]} className="bridge-ripple-outer"/></g>
      <g className="bridge-structure">{BRIDGE_PATHS.map((d,i)=><path key={d} d={d} pathLength="1" className={`bridge-stroke bridge-stroke-${i}`}/>)}</g>
      <path className="bridge-center-light" d={BRIDGE_PATHS[0]} pathLength="1"/>
      <path className="bridge-deck-light" d={BRIDGE_PATHS[1]} pathLength="1"/>
    </svg>
  </div>;
}
