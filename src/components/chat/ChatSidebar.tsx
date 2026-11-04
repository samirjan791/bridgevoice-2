"use client";
import { APP_NAME } from "@/lib/brand";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Plus,
  BookOpen,
  Play,
  Settings,
  Pin,
  Languages,
  MessageSquare,
  Trash2,
  Search,
  PanelLeftClose,
} from "lucide-react";
import { lockModalScroll } from "@/lib/modal-scroll";
import { HistorySearch } from "./HistorySearch";
import { Brand } from "../brand/Brand";
import { StoredChat } from "@/lib/chat/schema";
import { ui } from "@/lib/ui-text";
import { Language } from "@/lib/languages";
export function ChatSidebar({
  open,
  onClose,
  onNew,
  history,
  onOpen,
  onDelete,
  historyEnabled,
  language,
  onPin,
  onCollapse,
  tools,
}: {
  tools?: React.ReactNode;
  onPin?: (id:string)=>void;
  onCollapse?: ()=>void;
  open: boolean;
  onClose: () => void;
  onNew: () => void;
  history: StoredChat[];
  onOpen: (chat: StoredChat) => void;
  onDelete: (id: string) => void;
  historyEnabled: boolean;
  language: Language;
}) {
  const t = ui[language];
  const [filter,setFilter]=useState("all");
  const filtered = history.filter(c => filter !== "pinned" || c.pinned).sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned)||b.updated-a.updated);
  const panel=useRef<HTMLElement>(null);
  const close=useRef(onClose);close.current=onClose;
  const searching=useRef(false);
  const [searchOpen, setSearchOpen] = useState(false);
  searching.current=searchOpen;
  useEffect(() => {
    if(!open)return;
    const before=document.activeElement as HTMLElement|null;
    const unlock=lockModalScroll();
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const key=(e:KeyboardEvent)=>{
      if(searching.current)return;
      if(e.key==='Escape'){e.preventDefault();close.current();}
      if(e.key!=='Tab')return;
      const nodes=[...(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input,select')||[])];
      if(e.shiftKey&&document.activeElement===nodes[0]){e.preventDefault();nodes.at(-1)?.focus();}
      else if(!e.shiftKey&&document.activeElement===nodes.at(-1)){e.preventDefault();nodes[0]?.focus();}
    };
    window.addEventListener('keydown',key);
    return ()=>{unlock();window.removeEventListener('keydown',key);before?.focus();};
  },[open]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault();setSearchOpen(true); } };
    window.addEventListener("keydown",key);
    return () => window.removeEventListener("keydown",key);
  }, []);
  return (
    <>
      {searchOpen && <HistorySearch history={history} enabled={historyEnabled} onOpen={onOpen} onClose={() => setSearchOpen(false)} />}
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}
      <aside ref={panel} aria-label="Conversation navigation" className={"chat-sidebar " + (open ? "open" : "")}>
        <div className="sidebar-brand">
          <Link href="/" aria-label={"" + APP_NAME + " home"}>
            <Brand />
          </Link>
          <button className="sidebar-search-button" aria-label="Search chats" title="Search chats (Command/Ctrl + K)" onClick={() => setSearchOpen(true)}><Search size={19}/></button>
          <button
            className="tool-icon"
            aria-label={open ? "Close navigation" : "Hide sidebar"}
            onClick={open ? onClose : onCollapse}
          >
            <PanelLeftClose size={20} />
          </button>
        </div>
        <button className="new-chat" onClick={onNew}>
          <Plus size={18} />
          {t.newChat}
        </button>
        <div className="recent-chats">
          <div className="recents-heading"><span>{t.recent}</span>{historyEnabled && history.length > 0 && <select aria-label="Filter chats" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All chats</option><option value="pinned">Pinned</option></select>}</div>
          {historyEnabled ? (
            filtered.length ? (
              filtered.map((chat) => (
                <div key={chat.id}>
                  <button onClick={() => onOpen(chat)}>
                    <MessageSquare size={15} />
                    <span>{chat.title}</span>
                  </button>
                  {onPin && <button className="pin-chat" aria-label={(chat.pinned ? "Unpin " : "Pin ")+chat.title} aria-pressed={!!chat.pinned} onClick={()=>onPin(chat.id)}><Pin size={14}/></button>}
                  <button
                    className="delete-chat"
                    aria-label={"Delete " + chat.title}
                    onClick={() => onDelete(chat.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            ) : (
              <small>{language === "ps" ? "تر اوسه خبرې نه دي خوندي شوي." : language === "fa-AF" ? "هنوز گفتگویی ذخیره نشده است." : language === "es-US" ? "Todavía no hay conversaciones guardadas." : "No saved conversations yet."}</small>
            )
          ) : (
            <div className="history-off">
              <MessageSquare size={20} />
              <p>{language === "ps" ? "تاریخچه بنده ده" : language === "fa-AF" ? "تاریخچه خاموش است" : language === "es-US" ? "El historial está desactivado" : "History is off"}</p>
              <small>
                {t.private}
              </small>
            </div>
          )}
        </div>
        <nav>
          {tools}
          <Link href="/glossary">
            <BookOpen size={18} />
            {t.glossary}
          </Link>
          <Link href="/languages">
            <Languages size={18} />
            {language === "ps" ? "ژبې" : language === "fa-AF" ? "زبان‌ها" : language === "es-US" ? "Idiomas" : "Languages"}
          </Link>
          <Link href="/demo">
            <Play size={18} />
            {t.demo}
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <Link href="/settings">
            <Settings size={17} />
            {t.settings}
          </Link>
        </div>
      </aside>
    </>
  );
}
