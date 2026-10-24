"use client";
import { AudioLines, Pause, Play, Square, ArrowLeft, Mic } from "lucide-react";
import { Language, packs } from "@/lib/languages";
export function BridgeMode({
  source,
  target,
  onSource,
  onTarget,
  listening,
  paused,
  onPause,
  onStop,
  onReturn,
  onMic,
  micSupported,
}: {
  source: Language;
  target: Language;
  onSource: (l: Language) => void;
  onTarget: (l: Language) => void;
  listening: boolean;
  paused: boolean;
  onPause: () => void;
  onStop: () => void;
  onReturn: () => void;
  onMic: () => void;
  micSupported: boolean;
}) {
  return (
    <section className="bridge-mode-panel">
      <div className="bridge-mode-title">
        <AudioLines size={20} />
        <div>
          <b>Bridge Mode</b>
          <small>
            {listening
              ? "Microphone listening · English"
              : paused
                ? "Paused"
                : "Ready for a spoken or typed segment"}
          </small>
        </div>
        <button className="quiet-button" onClick={onReturn}>
          <ArrowLeft size={15} />
          Return to chat
        </button>
      </div>
      <div className="bridge-mode-controls">
        <label>
          From
          <select
            aria-label="Source language"
            value={source}
            onChange={(e) => onSource(e.target.value as Language)}
            disabled={listening}
          >
            {Object.values(packs).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <span>→</span>
        <label>
          To
          <select
            aria-label="Bridge target language"
            value={target}
            onChange={(e) => onTarget(e.target.value as Language)}
          >
            {Object.values(packs).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <button
          className={"bridge-mic " + (listening ? "active-mic" : "")}
          disabled={!micSupported || source !== "en" || paused}
          aria-label={
            listening ? "Stop bridge microphone" : "Start bridge microphone"
          }
          onClick={onMic}
        >
          <Mic size={23} />
        </button>
        <button onClick={onPause}>
          {paused ? <Play size={15} /> : <Pause size={15} />}{" "}
          {paused ? "Resume" : "Pause"}
        </button>
        <button onClick={onStop}>
          <Square size={15} />
          Stop
        </button>
      </div>
      <small>
        English speech is browser-dependent. Pashto and Dari use typed input.
        Nothing is automatically spoken or forwarded.
      </small>
    </section>
  );
}
