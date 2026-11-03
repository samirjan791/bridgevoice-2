"use client";
import { lockModalScroll } from "@/lib/modal-scroll";
import { useEffect, useRef, useState } from "react";
import { Search, X, MessageSquare } from "lucide-react";
import type { StoredChat } from "@/lib/chat/schema";
export function HistorySearch({ history, enabled, onOpen, onClose }: {
  history: StoredChat[]; enabled: boolean; onOpen: (chat: StoredChat) => void; onClose: () => void;
}) {
  const [query,setQuery]=useState("");
  const panel=useRef<HTMLDivElement>(null);
  const close=useRef(onClose);close.current=onClose;
  const normalized=query.trim().normalize("NFKC").toLocaleLowerCase();
  const matches=enabled ? history.filter(c=>[c.title,...c.messages.map(m=>m.content)].some(t=>t.normalize("NFKC").toLocaleLowerCase().includes(normalized))) : [];
  useEffect(()=>{
    const before=document.activeElement as HTMLElement|null;
    const unlock=lockModalScroll();
    panel.current?.querySelector("input")?.focus();
    const key=(e:KeyboardEvent)=>{
      if(e.key==="Escape"){e.preventDefault();e.stopPropagation();close.current();}
      if(e.key!=="Tab")return;
      const nodes=[...(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input,a[href]')||[])];
      if(e.shiftKey&&document.activeElement===nodes[0]){e.preventDefault();nodes.at(-1)?.focus();}
      else if(!e.shiftKey&&document.activeElement===nodes.at(-1)){e.preventDefault();nodes[0]?.focus();}
    };
    document.addEventListener("keydown",key);
    return ()=>{unlock();document.removeEventListener("keydown",key);before?.focus();};
  },[]);
  return <div className="history-dialog-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div className="history-dialog" role="dialog" aria-modal="true" aria-labelledby="history-search-title" ref={panel}>
      <h2 className="sr-only" id="history-search-title">Search your conversations</h2>
      <div className="history-dialog-input"><Search size={21}/><input aria-label="Search chat history" placeholder="Search your chats" value={query} onChange={e=>setQuery(e.target.value)} maxLength={300}/><button aria-label="Close chat search" onClick={onClose}><X size={20}/></button></div>
      <div className="history-search-results"><p className="history-search-caption" role="status">{!enabled ? "History is off. Enable it in Settings to save future chats." : !history.length ? "No saved chats yet." : matches.length ? `${matches.length} ${query ? "matching" : "recent"} conversations` : "No chats found. Try another word."}</p>
        {matches.map(chat=><button className="history-search-result" key={chat.id} onClick={()=>{onOpen(chat);onClose();}}><MessageSquare size={18}/><span><b dir="auto">{chat.title}</b><small dir="auto">{(chat.messages.find(m=>normalized && m.content.toLocaleLowerCase().includes(normalized))?.content || chat.messages.at(-1)?.content || "").slice(0,160)}</small></span></button>)}
      </div><footer>Search stays on this device · Esc to close</footer>
    </div>
  </div>;
}
