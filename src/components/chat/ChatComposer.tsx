"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Mic,
  Plus,
  FileText,
  Image as ImageIcon,
  Square,
  X,
  AudioLines,
} from "lucide-react";
import type { DocumentText } from "@/lib/chat/schema";
import { ui } from "@/lib/ui-text";
import { Language } from "@/lib/languages";

export function ChatComposer({
  text,
  setText,
  onSend,
  busy,
  onStop,
  onAttach,
  photoName,
  photoUrl,
  documentAttachment,
  onClearDocument,
  uploadingName,
  onCancelUpload,
  onClearPhoto,
  listening,
  onMic,
  micSupported,
  uiLanguage,
  interim,
  onVoice,
}: {
  onVoice?: () => void;
  text: string;
  setText: (v: string) => void;
  onSend: () => void;
  busy: boolean;
  onStop: () => void;
  onAttach: (file: File) => void;
  photoName?: string;
  photoUrl?: string;
  documentAttachment?: DocumentText;
  onClearDocument?: () => void;
  uploadingName?: string;
  onCancelUpload?: () => void;
  onClearPhoto?: () => void;
  listening: boolean;
  onMic: () => void;
  micSupported: boolean;
  uiLanguage: Language;
  onBridge: () => void;
  onMirror: () => void;
  onOptions: () => void;
  interim: string;
}) {
  const file = useRef<HTMLInputElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [menuOpen,setMenuOpen]=useState(false);
  const t=ui[uiLanguage];
  const [excerptOpen,setExcerptOpen]=useState(false);
  const hasAttachments=!!(photoName||documentAttachment||uploadingName);
  useEffect(()=>{ if(input.current){input.current.style.height="auto";input.current.style.height=Math.min(160,Math.max(44,input.current.scrollHeight))+"px";} },[text]);
  useEffect(()=>{
   if(!menuOpen)return;
   menu.current?.querySelector<HTMLButtonElement>('button')?.focus();
   const close=(e:KeyboardEvent)=>{if(e.key==="Escape"){setMenuOpen(false);trigger.current?.focus();}if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();const items=[...menu.current!.querySelectorAll<HTMLButtonElement>('button')];const i=items.indexOf(document.activeElement as HTMLButtonElement);items[(i+(e.key==="ArrowDown"?1:items.length-1))%items.length]?.focus();}};
   const outside=(e:PointerEvent)=>{if(!menu.current?.contains(e.target as Node)&&!trigger.current?.contains(e.target as Node))setMenuOpen(false);};
   window.addEventListener("keydown",close);window.addEventListener("pointerdown",outside);return()=>{window.removeEventListener("keydown",close);window.removeEventListener("pointerdown",outside);};
  },[menuOpen]);
  function upload(accept:string){if(file.current){file.current.accept=accept;file.current.click();}setMenuOpen(false);}
  return <div className="composer-wrap">
   {interim&&<p className="dictation-caption" dir="auto" role="status">{interim}</p>}
   <div className={"chat-composer"+(listening?" is-recording":"")+(hasAttachments?" has-attachments":"")}>
    {hasAttachments&&<div className="composer-attachments" aria-label="Attachments">
      {photoName&&<div className="attachment-card attachment-photo" title={photoName}>
        {/* Selected local image data stays in the existing upload flow. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {photoUrl?<img src={photoUrl} alt={photoName}/>:<ImageIcon size={30} aria-hidden="true"/>}
        <button type="button" className="attachment-remove" aria-label="Remove attached photo" onClick={onClearPhoto}><X size={16}/></button>
      </div>}
      {documentAttachment&&<div className="attachment-card attachment-document">
        <button type="button" className="attachment-document-open" aria-label={"Preview "+documentAttachment.name} aria-expanded={excerptOpen} onClick={()=>setExcerptOpen(!excerptOpen)}>
          <FileText size={24} aria-hidden="true"/><span dir="auto" title={documentAttachment.name}>{documentAttachment.name}</span><small>{documentAttachment.name.split('.').pop()?.toUpperCase()}{documentAttachment.truncated?" · Partial text":""}</small>
        </button>
        <button type="button" className="attachment-remove" aria-label="Remove document" onClick={()=>{setExcerptOpen(false);onClearDocument?.();}}><X size={16}/></button>
      </div>}
      {uploadingName&&<div className="attachment-card attachment-document attachment-loading"><FileText size={24}/><span dir="auto">{uploadingName}</span><small role="status">Extracting text…</small><button type="button" className="attachment-remove" aria-label="Cancel document upload" onClick={onCancelUpload}><X size={16}/></button></div>}
    </div>}
    {documentAttachment&&excerptOpen&&<div className="attachment-excerpt"><small>{documentAttachment.truncated?"Partial extraction: later content may be omitted.":"Extracted text is kept in this conversation session."} DOCX/TXT use extracted sections, not original page numbers.</small><pre dir="auto">{documentAttachment.pages[0]?.text.slice(0,2000)}</pre></div>}
    {listening&&<div className="composer-waveform"><span role="status" aria-label="Microphone listening">Listening…</span></div>}
    <input ref={file} type="file" accept=".pdf,.docx,.txt,image/jpeg,image/png,image/webp" className="sr-only" aria-label="Choose a document or photo" onChange={e=>{const f=e.target.files?.[0];if(f)onAttach(f);e.target.value="";}}/>
    <div className="composer-menu-anchor"><button ref={trigger} className="tool-icon" aria-label="Open tools" aria-haspopup="menu" aria-expanded={menuOpen} onClick={()=>setMenuOpen(!menuOpen)}><Plus size={22}/></button>{menuOpen&&<div ref={menu} className="composer-popover" role="menu"><button role="menuitem" onClick={()=>upload("image/jpeg,image/png,image/webp")}><ImageIcon size={17}/>Upload photo</button><button role="menuitem" onClick={()=>upload(".pdf,.docx,.txt")}><FileText size={17}/>Upload document</button></div>}</div>
    <label className="sr-only" htmlFor="chat-input">Message</label><textarea id="chat-input" ref={input} rows={1} dir="auto" value={text} maxLength={12000} placeholder="Ask BridgeVoice" onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.nativeEvent.isComposing&&!e.ctrlKey&&!e.altKey&&!e.metaKey){e.preventDefault();if(!busy&&(text.trim()||photoName||documentAttachment))onSend();}}}/>
    {micSupported&&<button className="tool-icon" aria-label={listening?"Stop microphone":"Dictate"} aria-pressed={listening} onClick={onMic}><Mic size={20}/></button>}
    {busy?<button className="send-button" aria-label={t.stop} onClick={onStop}><Square size={17}/></button>:text.trim()||photoName||documentAttachment?<button className="send-button" aria-label={t.send} onClick={onSend}><ArrowUp size={20}/></button>:onVoice&&<button className="voice-button" aria-label="Open voice conversation" onClick={onVoice}><AudioLines size={21}/></button>}
   </div>
  </div>;
}
