"use client";
import { BridgeProof } from "../proof/BridgeProof";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { ChatResult } from "@/lib/chat/schema";
export function MeaningGuardCard({
  result,
  onExplain,
}: {
  result: ChatResult;
  onExplain: (text: string) => void;
}) {
  const [state, setState] = useState<Record<string, string>>({}),
    [correction, setCorrection] = useState("");
  const items = [
    ...result.checks.map((w) => ({
      id: w.id,
      message: w.message,
      priority: w.priority === "critical" ? "critical" : "review",
    })),
    ...result.warnings.map((w, i) => ({ ...w, id: "semantic-" + i })),
  ];
  const reviewedTranslation=result.reviewedTranslation??result.translation;
  const proof=result.sourcePassage && reviewedTranslation ? <BridgeProof source={result.sourcePassage} translation={reviewedTranslation} from={result.sourceLanguage} to={result.targetLanguage}/> : null;
  if (!items.length) return proof;
  return (
    <>{proof}<details
      className="meaningguard"
      open={items.some((w) => w.priority === "critical")}
    >
      <summary>
        <ShieldCheck size={17} /> MeaningGuard{" "}
        <span>{items.length} checks for human review</span>
      </summary>
      <div className="guard-inner">
        {result.sourcePassage && (
          <blockquote dir="auto">{result.sourcePassage}</blockquote>
        )}
        {items.map((w) => (
          <div className={"meaning-check " + w.priority} key={w.id}>
            <div>
              <b>
                {w.priority === "critical"
                  ? "Critical ambiguity"
                  : w.priority === "informational"
                    ? "For your information"
                    : "Needs review"}
              </b>
              <p>{w.message}</p>
            </div>
            <select
              aria-label={"Review " + w.id}
              value={state[w.id] || "flagged"}
              onChange={(e) => setState({ ...state, [w.id]: e.target.value })}
            >
              <option value="flagged">Needs review</option>
              <option value="reviewed">Reviewed</option>
              <option
                value="resolved"
                disabled={!["reviewed", "resolved"].includes(state[w.id])}
              >
                Resolved
              </option>
              <option value="dismissed">Dismissed</option>
            </select>
            <button
              onClick={() =>
                onExplain("Explain this possible issue: " + w.message)
              }
            >
              Explain
            </button>
          </div>
        ))}
        <label>
          Your correction or review note
          <textarea
            value={correction}
            onChange={(e) => setCorrection(e.target.value)}
            placeholder="Your judgment remains final. Notes stay in this session."
          />
        </label>
        <small>
          These are potential issues, not a certification. Notes and review
          states are session-only.
        </small>
      </div>
    </details></>
  );
}
