"use client";
import { userFollowUps } from "@/lib/chat/follow-ups";
import { LinkedMeaning } from "./LinkedMeaning";
import { useState } from "react";
import { MeaningCheck, MeaningReview } from "./MeaningCheck";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Copy,
  Bookmark,
  RotateCcw,
  Volume2,
  Pencil,
  Check,
} from "lucide-react";
import { ChatMessage as Message } from "@/lib/chat/schema";
import { extractWebsites, stripCodeBlocks } from "@/lib/website";
import { WebsitePreview } from "./WebsitePreview";
import { MeaningGuardCard } from "./MeaningGuardCard";
import { saveEntry } from "@/lib/storage";
import { usePreferences } from "../providers";
import { packs, Language } from "@/lib/languages";
export function ChatMessage({
  message,
  onFollow,
  onRetry,
  onSaveEdit,
  onSpeak,
  canSpeak,
  busy,
  onMeaningReview,
}: {
  message: Message;
  onMeaningReview?: MeaningReview;
  onFollow: (s: string) => void;
  onRetry: () => void;
  onEdit: () => void;
  onSaveEdit: (content: string) => void;
  onDelete: () => void;
  onFeedback: (value: "helpful" | "needs-review") => void;
  onSpeak: (text: string, language: Language) => void;
  canSpeak: boolean;
  busy: boolean;
}) {
  const { notify } = usePreferences();
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const result = message.result;
  if (message.role === "user")
    return (
      <article className="chat-message user" style={{ position: "relative" }}>
        {editing ? (
          <div className="user-message-editor">
            <textarea
              aria-label="Edit your message"
              value={editText}
              onChange={(event) => setEditText(event.target.value)}
              maxLength={12000}
              rows={3}
              autoFocus
            />
            <div className="user-message-editor-actions">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setEditText(message.content);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!editText.trim()}
                onClick={() => {
                  onSaveEdit(editText.trim());
                  setEditing(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div dir="auto">{message.speaker&&<small>{message.speaker} · original</small>}{message.content}</div>
        )}
        <div className="user-actions"><button aria-label="Copy message" onClick={async()=>{try{await navigator.clipboard.writeText(message.content);notify("Message copied.");}catch{notify("Unable to copy message.");}}}><Copy size={15}/></button><button aria-label="Edit message" onClick={()=>{setEditText(message.content);setEditing(true);}}><Pencil size={15}/></button></div>
      </article>
    );
  const { text: visibleText, sites } = extractWebsites(message.content);
  return (
    <article className="chat-message assistant">
      <div
        className="markdown"
        dir={result ? packs[result.targetLanguage].dir : "auto"}
        lang={result?.targetLanguage}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            img: () => null,
            a: ({ children, href }) => (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
          }}
        >
          {visibleText}
        </ReactMarkdown>
      </div>
      {sites.map((html, i) => (
        <WebsitePreview key={i} html={html} index={i} />
      ))}
      {result?.sourcePassage && <MeaningCheck source={result.sourcePassage} language={result.sourceLanguage} busy={busy} onReview={onMeaningReview} />}
      {result?.sourcePassage && result.translation && <LinkedMeaning source={result.sourcePassage} translation={result.translation} sourceLanguage={result.sourceLanguage} targetLanguage={result.targetLanguage} />}
      {result?.translation && (
        <section className="translation-answer">
          <span>Suggested translation · verify before use</span>
          <p
            dir={packs[result.targetLanguage].dir}
            lang={result.targetLanguage}
          >
            {result.translation}
          </p>
        </section>
      )}
      {result && <MeaningGuardCard result={result} onExplain={onFollow} />}
      {result?.sources.length ? (
        <section className="source-quotes">
          <b>From your document</b>
          {result.sources.map((s, i) => (
            <blockquote key={i}>
              <span>Extracted page / section {s.page}</span>
              <p dir="auto">{s.quote}</p>
            </blockquote>
          ))}
        </section>
      ) : null}
      {result?.termsSaved.length ? (
        <details className="message-terms">
          <summary>
            Useful terminology <span>{result.termsSaved.length}</span>
          </summary>
          {result.termsSaved.map((e) => (
            <div className="inline-term" key={e.id}>
              <div>
                <b>{e.en}</b>
                <p>{e.explanation}</p>
                <span dir="rtl">
                  {e.ps} · {e["fa-AF"]}
                </span>
                <small>Unreviewed draft</small>
              </div>
              <button
                aria-label={"Save " + e.en}
                onClick={() => {
                  try {
                    saveEntry(e);
                    notify("Saved to your glossary.");
                  } catch {
                    notify(
                      "Unable to save; browser storage may be full or blocked.",
                    );
                  }
                }}
              >
                <Bookmark size={16} />
              </button>
            </div>
          ))}
        </details>
      ) : null}
      <div className="message-actions">
        <button
          aria-label="Copy answer"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                visibleText +
                  (result?.translation ? "\n\n" + result.translation : ""),
              );
              setCopied(true);
              notify("Answer copied.");
            } catch {
              notify("Copy unavailable. Select and copy the text manually.");
            }
          }}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
        <button
          aria-label="Regenerate response"
          onClick={onRetry}
          disabled={busy}
        >
          <RotateCcw size={15} />
        </button>
        {canSpeak && <button
          aria-label="Read aloud or stop"
          disabled={!canSpeak}
          title={
            canSpeak
              ? "Read aloud with an installed voice or configured cloud speech"
              : "Read aloud is unavailable"
          }
          onClick={() =>
            onSpeak(
              result?.translation || stripCodeBlocks(message.content),
              result?.targetLanguage || "en",
            )
          }
        >
          <Volume2 size={15} />
        </button>}
      </div>
      {result?.followUps.length ? (
        <div className="followups">
          {userFollowUps(result.followUps,result.targetLanguage).map((q) => (
            <button key={q} disabled={busy} onClick={() => onFollow(q)}>
              {q}
            </button>
          ))}
        </div>
      ) : null}
    </article>
  );
}
