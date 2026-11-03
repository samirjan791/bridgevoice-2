"use client";
import Link from "next/link";
import { Play, Pause, RotateCcw, ChevronRight } from "lucide-react";
import { demos } from "@/data/demos";
export function DemoPanel({
  scenario,
  onScenario,
  playing,
  onPlay,
  onReset,
  onNext,
  index,
  disabled,
}: {
  scenario: number;
  onScenario: (n: number) => void;
  playing: boolean;
  onPlay: () => void;
  onReset: () => void;
  onNext: () => void;
  index: number;
  disabled: boolean;
}) {
  const d = demos[scenario];
  return (
    <section className="v2-demo-panel">
      <div>
        <span className="demo-label">FICTIONAL INPUT · LIVE META API REQUIRED</span>
        <select
          aria-label="Demo scenario"
          value={scenario}
          onChange={(e) => onScenario(Number(e.target.value))}
        >
          {demos.map((d, i) => (
            <option key={d.id} value={i}>
              {i + 1}. {d.title}
            </option>
          ))}
        </select>
        <p>{d.objective}</p><Link href="/bridge-call">BridgeCall lab · simulated telephone routing</Link>
      </div>
      <div className="demo-buttons">
        <button className="primary" onClick={onPlay} disabled={disabled}>
          {playing ? <Pause size={15} /> : <Play size={15} />}{" "}
          {playing ? "Pause" : index < 0 ? "Start demo" : "Resume"}
        </button>
        <button aria-label="Restart demo" onClick={onReset}>
          <RotateCcw size={15} />
        </button>
        <button
          aria-label="Next demo segment"
          disabled={disabled || index >= d.segments.length - 1}
          onClick={onNext}
        >
          <ChevronRight size={18} />
        </button>
        <small>
          {Math.max(0, index + 1)} / {d.segments.length}
        </small>
      </div>
    </section>
  );
}
