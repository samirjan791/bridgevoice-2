"use client";
import {
  AudioLines,
  ScanText,
  Sparkles,
  UserRoundCheck,
  ArrowRight,
} from "lucide-react";
export function Bridge({ busy = false }: { busy?: boolean }) {
  return (
    <div
      className={"bridge " + (busy ? "processing" : "")}
      aria-label={
        busy ? "Processing transcript" : "Application processing pipeline"
      }
    >
      {[
        [AudioLines, "Voice"],
        [ScanText, "Context"],
        [Sparkles, "Intelligence"],
        [UserRoundCheck, "Understanding"],
      ].map(([Icon, label], i) => (
        <div key={String(label)}>
          <span>{typeof Icon !== "string" && <Icon size={20} />}</span>
          <small>{String(label)}</small>
          {i < 3 && <ArrowRight className="bridge-arrow" size={16} />}
        </div>
      ))}
    </div>
  );
}
