"use client";
import Link from "next/link";
import {
  Plus,
  BookOpen,
  Play,
  Settings,
  Info,
  MessageSquare,
  Trash2,
  PanelLeftClose,
} from "lucide-react";
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
}: {
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
  return (
    <>
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}
      <aside className={"chat-sidebar " + (open ? "open" : "")}>
        <div className="sidebar-brand">
          <Link href="/" aria-label="BridgeVoice home">
            <Brand />
          </Link>
          <button
            className="mobile-only tool-icon"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <PanelLeftClose size={18} />
          </button>
        </div>
        <button className="new-chat" onClick={onNew}>
          <Plus size={18} />
          {t.newChat}
          <kbd>＋</kbd>
        </button>
        <nav>
          <Link href="/glossary">
            <BookOpen size={18} />
            {t.glossary}
          </Link>
          <Link href="/demo">
            <Play size={18} />
            {t.demo}
          </Link>
        </nav>
        <div className="recent-chats">
          <span>{t.recent}</span>
          {historyEnabled ? (
            history.length ? (
              history.map((chat) => (
                <div key={chat.id}>
                  <button onClick={() => onOpen(chat)}>
                    <MessageSquare size={15} />
                    <span>{chat.title}</span>
                  </button>
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
              <small>No saved conversations yet.</small>
            )
          ) : (
            <div className="history-off">
              <MessageSquare size={20} />
              <p>History is off</p>
              <small>
                Conversations stay in this session unless you enable history.
              </small>
            </div>
          )}
        </div>
        <div className="sidebar-bottom">
          <Link href="/settings">
            <Settings size={17} />
            {t.settings}
          </Link>
          <Link href="/about">
            <Info size={17} />
            {t.about}
          </Link>
          <div className="sidebar-mission">
            <span className="mission-dot" /> People. Languages. Opportunities.
          </div>
        </div>
      </aside>
    </>
  );
}
