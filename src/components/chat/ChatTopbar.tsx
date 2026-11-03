"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, PanelLeft, Circle } from "lucide-react";
import { Language, packs } from "@/lib/languages";
export function ChatTopbar({setSidebar,sidebarCollapsed,setSidebarCollapsed,settings,update,connection}:{
 setSidebar:(v:boolean)=>void;sidebarCollapsed:boolean;setSidebarCollapsed:(v:boolean)=>void;
 settings:{theme:"dark"|"light"|"system";target:Language;uiLanguage:Language};update:(v:{theme?:"dark"|"light"|"system";target?:Language;uiLanguage?:Language;autoLanguage?:boolean})=>void;connection:string;
}) {
 const [status,setStatus]=useState("Checking configuration");
 useEffect(()=>{const c=new AbortController();fetch("/api/status",{signal:c.signal}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(s=>setStatus(s.configured ? "Meta key configured; no request verified yet" : "Meta key missing")).catch(()=>{if(!c.signal.aborted)setStatus("Status unavailable");});return()=>c.abort();},[]);
 const label=connection==="Connected" ? "Meta connected — last request succeeded" : connection==="Not verified" ? status : connection;
 return <div className="chat-topbar"><div><button className="mobile-only tool-icon" aria-label="Open navigation" onClick={()=>setSidebar(true)}><Menu size={20}/></button><button className="desktop-only tool-icon" aria-label={sidebarCollapsed?"Show sidebar":"Hide sidebar"} aria-expanded={!sidebarCollapsed} onClick={()=>setSidebarCollapsed(!sidebarCollapsed)}><PanelLeft size={20}/></button></div>
 <div className="topbar-right"><select aria-label="Theme" value={settings.theme} onChange={e=>update({theme:e.target.value as "system"|"light"|"dark"})}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select><select aria-label="Interface language" value={settings.uiLanguage} onChange={e=>update({target:e.target.value as Language,uiLanguage:e.target.value as Language,autoLanguage:false})}>{Object.values(packs).map(p=><option key={p.id} value={p.id}>{p.native}</option>)}</select><Link className="meta-indicator" href="/settings#meta" title={label} aria-label={label}><Circle size={10}/> <span>Meta</span></Link></div></div>;
}
