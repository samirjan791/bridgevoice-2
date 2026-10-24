"use client";
import { useState } from "react";
import { values } from "@/lib/guard";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Copy,
  Bookmark,
  RotateCcw,
  ThumbsUp,
  Flag,
  Volume2,
  Pencil,
  Check,
} from "lucide-react";
import { ChatMessage as Message } from "@/lib/chat/schema";
import { MeaningGuardCard } from "./MeaningGuardCard";
import { saveEntry } from "@/lib/storage";
import { usePreferences } from "../providers";
import { packs, Language } from "@/lib/languages";
export function ChatMessage({
  message,
  onFollow,
  onRetry,
  onEdit,
  onFeedback,
  onSpeak,
  canSpeak,
  busy,
}: {
  message: Message;
  onFollow: (s: string) => void;
  onRetry: () => void;
  onEdit: () => void;
  onFeedback: (value: "helpful" | "needs-review") => void;
  onSpeak: (text: string, language: Language) => void;
  canSpeak: boolean;
  busy: boolean;
}) {
  const { notify } = usePreferences();
  const [copied, setCopied] = useState(false);
  const result = message.result;
  const [dismissed, setDismissed] = useState(false);
  if (dismissed)
    return (
      <div className="dismissed-answer">
        Suggestion dismissed.{" "}
        <button onClick={() => setDismissed(false)}>Restore</button>
      </div>
    );
  if (message.role === "user")
    return (
      <article className="chat-message user">
        <div dir="auto">{message.content}</div>
        <button
          className="quiet-button"
          onClick={onEdit}
          disabled={busy}
          aria-label="Edit and resend message"
        >
          <Pencil size={14} />
        </button>
      </article>
    );
  return (
    <article className="chat-message assistant">
      <div className="assistant-label">
        <span className="assistant-symbol">⌁</span>
        <b>BridgeVoice</b>
        <small>{result?.provider || "Local action"}</small>
      </div>
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
          {message.content}
        </ReactMarkdown>
      </div>
      {result?.sourcePassage && values(result.sourcePassage).length > 0 && (
        <details className="critical-values">
          <summary>Important values · verify against the original</summary>
          <div>
            {values(result.sourcePassage).map((v, i) => (
              <span key={i} dir="auto">
                {v.sourceText}
              </span>
            ))}
          </div>
          <small>
            Matching values alone does not establish equivalent meaning.
          </small>
        </details>
      )}
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
          aria-label="Dismiss suggestion"
          onClick={() => setDismissed(true)}
        >
          Dismiss
        </button>
        <button
          aria-label="Copy answer"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                message.content +
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
        <button
          aria-label="Read aloud"
          disabled={!canSpeak}
          title={
            canSpeak
              ? "Read aloud using a supported browser voice"
              : "No matching browser voice is installed"
          }
          onClick={() =>
            onSpeak(
              result?.translation || message.content,
              result?.targetLanguage || "en",
            )
          }
        >
          <Volume2 size={15} />
        </button>
        <button
          aria-label="Helpful answer"
          aria-pressed={message.feedback === "helpful"}
          onClick={() => onFeedback("helpful")}
        >
          <ThumbsUp size={15} />
        </button>
        <button
          aria-label="Mark answer for review"
          aria-pressed={message.feedback === "needs-review"}
          onClick={() => onFeedback("needs-review")}
        >
          <Flag size={15} />
        </button>
        {result && (
          <small>
            {result.latencyMs} ms ·{" "}
            {result.usage
              ? `${result.usage.input_tokens + result.usage.output_tokens} tokens`
              : result.provider.startsWith("Meta")
                ? "usage unavailable"
                : "local processing"}
          </small>
        )}
      </div>
      {message.feedback && (
        <small className="feedback-note">
          {message.feedback === "helpful"
            ? "Marked helpful"
            : "Marked for your review"}{" "}
          · no feedback sent externally
        </small>
      )}
      {result?.followUps.length ? (
        <div className="followups">
          {result.followUps.map((q) => (
            <button key={q} disabled={busy} onClick={() => onFollow(q)}>
              {q}
            </button>
          ))}
        </div>
      ) : null}
    </article>
  );
}
