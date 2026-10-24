"use client";
import { useState } from "react";
import { Bookmark, Copy, ChevronDown, Check, X, Flag } from "lucide-react";
import { Entry } from "@/lib/schema";
import { saveEntry } from "@/lib/storage";
import { usePreferences } from "./providers";
import { packs, Language } from "@/lib/languages";
export function TermCard({
  entry,
  target = "ps",
}: {
  entry: Entry;
  target?: Language;
}) {
  const [expanded, setExpanded] = useState(false),
    [state, setState] = useState("Review required"),
    [hidden, hide] = useState(false);
  const { notify } = usePreferences();
  if (hidden) return null;
  return (
    <article className="term-card">
      <div className="row">
        <span className="eyebrow">{entry.domain} · Important</span>
        <button
          className="icon-button"
          aria-label={"Dismiss " + entry.en}
          onClick={() => hide(true)}
        >
          <X size={16} />
        </button>
      </div>
      <h3>{entry.en}</h3>
      <p className="translation" dir={packs[target].dir} lang={target}>
        {entry[target] || "Translation pending review"}
      </p>
      <p>{entry.explanation}</p>
      <div className="term-meta">
        <span className="dot amber" />
        {state} ·{" "}
        {entry.reviewStatus === "user_corrected"
          ? "User correction"
          : "Unreviewed draft"}
      </div>
      <div className="card-actions">
        <button
          onClick={() => {
            try {
              saveEntry(entry);
              notify("Term saved to My glossary.");
            } catch {
              notify("Unable to save. Browser storage is unavailable.");
            }
          }}
        >
          <Bookmark size={15} /> Save
        </button>
        <button
          aria-label={"Copy " + entry.en}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(entry[target] || entry.en);
              notify("Copied.");
            } catch {
              notify("Copy unavailable. Select the text and copy manually.");
            }
          }}
        >
          <Copy size={15} />
        </button>
        <button
          aria-label={"Expand " + entry.en}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          <ChevronDown size={15} />
        </button>
        <button onClick={() => setState("Interpreter accepted")}>
          <Check size={15} /> Accept
        </button>
      </div>
      {expanded && (
        <div className="expanded">
          <p>
            <b>Example:</b> {entry.example}
          </p>
          <p dir="rtl" lang="ps">
            پښتو: {entry.ps || "—"}
          </p>
          <p dir="rtl" lang="fa-AF">
            دری: {entry["fa-AF"] || "—"}
          </p>
          <small>{entry.source}</small>
          <button
            onClick={() => {
              setState("Reported uncertain");
              notify(
                "Marked uncertain in this session. Save and edit the entry in My glossary to retain your correction.",
              );
            }}
          >
            <Flag size={14} /> Report incorrect / uncertain
          </button>
        </div>
      )}
    </article>
  );
}
