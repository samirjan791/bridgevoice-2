"use client";
import { useEffect, useState } from "react";

/**
 * Opening sequence (BridgeVoice intro animation, approved 2026-11-03):
 * sound ripples radiate while a bridge mark draws itself in fine lines,
 * the BridgeVoice wordmark wipes in, then the intro lifts and the app
 * is revealed underneath.
 *
 * Gating contract (unchanged, see src/lib/intro-boot.ts):
 * - The overlay is server-rendered but hidden by CSS unless the inline boot
 *   script sets <html data-intro="play">.
 * - It plays once per browser session, never under prefers-reduced-motion
 *   or when motion is off, and can be switched off in Settings.
 * - Click, tap, Escape, Enter or Space skips it at any time.
 * - Only transform, opacity, filter and SVG stroke-dashoffset are animated.
 */
const TOTAL_MS = 4300;
const LEAVE_MS = 900;

export function Intro() {
  const [active, setActive] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro !== "play") {
      setActive(false);
      return;
    }
    const timers: number[] = [];
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("bridgevoice:skip-intro", finish);
      setLeaving(true);
      timers.push(
        window.setTimeout(() => {
          root.dataset.intro = "done";
          setActive(false);
        }, LEAVE_MS),
      );
    };
    const onKey = (e: KeyboardEvent) => {
      if (["Escape", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("bridgevoice:skip-intro", finish);
    timers.push(window.setTimeout(finish, TOTAL_MS));
    return () => {
      finished = true;
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("bridgevoice:skip-intro", finish);
    };
  }, []);

  if (!active) return null;
  return (
    <div
      className="intro"
      data-leaving={leaving ? "true" : undefined}
      aria-hidden="true"
      onClick={() => window.dispatchEvent(new Event("bridgevoice:skip-intro"))}
    >
      <div className="intro-col">
        <div className="intro-markwrap">
          <i className="intro-rp" style={{ animationDelay: ".3s" }} />
          <i className="intro-rp" style={{ animationDelay: ".9s" }} />
          <i className="intro-rp" style={{ animationDelay: "1.5s" }} />
          <svg viewBox="0 0 400 400" aria-hidden="true">
            <defs>
              <linearGradient id="gBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#5ADCFF" />
                <stop offset="1" stopColor="#2D7BFF" />
              </linearGradient>
              <linearGradient id="gDeck" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#2FC9F5" />
                <stop offset=".6" stopColor="#2D7BFF" />
                <stop offset="1" stopColor="#7B6CF6" />
              </linearGradient>
              <linearGradient id="gRing" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#2FC9F5" />
                <stop offset=".55" stopColor="#2D7BFF" />
                <stop offset="1" stopColor="#7B6CF6" />
              </linearGradient>
            </defs>
            <circle className="intro-draw intro-ring" cx="200" cy="200" r="186" pathLength={1} style={{ animationDelay: ".9s", animationDuration: "1.5s" }} />
            <rect className="intro-bar" x="146" y="148" width="8" height="26" rx="4" style={{ animationDelay: ".3s" }} />
            <rect className="intro-bar" x="162" y="130" width="9" height="44" rx="4.5" style={{ animationDelay: ".37s" }} />
            <rect className="intro-bar" x="178" y="110" width="10" height="64" rx="5" style={{ animationDelay: ".44s" }} />
            <rect className="intro-bar" x="195" y="92" width="11" height="84" rx="5.5" style={{ animationDelay: ".51s" }} />
            <rect className="intro-bar" x="212" y="110" width="10" height="64" rx="5" style={{ animationDelay: ".44s" }} />
            <rect className="intro-bar" x="229" y="130" width="9" height="44" rx="4.5" style={{ animationDelay: ".37s" }} />
            <rect className="intro-bar" x="246" y="148" width="8" height="26" rx="4" style={{ animationDelay: ".3s" }} />
            <path className="intro-draw intro-deck" d="M48 236 Q200 184 352 236" pathLength={1} style={{ animationDelay: ".8s", animationDuration: "1.2s" }} />
            <path className="intro-draw intro-arch" d="M92 254 V244 a17 17 0 0 1 34 0 V254" pathLength={1} style={{ animationDelay: "1.4s", animationDuration: ".6s" }} />
            <path className="intro-draw intro-arch" d="M138 254 V238 a19 19 0 0 1 38 0 V254" pathLength={1} style={{ animationDelay: "1.5s", animationDuration: ".6s" }} />
            <path className="intro-draw intro-arch" d="M178 254 V230 a22 22 0 0 1 44 0 V254" pathLength={1} style={{ animationDelay: "1.6s", animationDuration: ".6s" }} />
            <path className="intro-draw intro-arch" d="M224 254 V238 a19 19 0 0 1 38 0 V254" pathLength={1} style={{ animationDelay: "1.7s", animationDuration: ".6s" }} />
            <path className="intro-draw intro-arch" d="M274 254 V244 a17 17 0 0 1 34 0 V254" pathLength={1} style={{ animationDelay: "1.8s", animationDuration: ".6s" }} />
            <path className="intro-draw intro-water" d="M70 256 H330" pathLength={1} style={{ animationDelay: "1.8s", animationDuration: ".9s" }} />
            <circle className="intro-lamp" cx="109" cy="254" r="2.8" style={{ animationDelay: "2.1s" }} />
            <circle className="intro-lamp" cx="157" cy="254" r="2.8" style={{ animationDelay: "2.15s" }} />
            <circle className="intro-lamp" cx="200" cy="254" r="3.2" style={{ animationDelay: "2.2s" }} />
            <circle className="intro-lamp" cx="243" cy="254" r="2.8" style={{ animationDelay: "2.25s" }} />
            <circle className="intro-lamp" cx="291" cy="254" r="2.8" style={{ animationDelay: "2.3s" }} />
          </svg>
        </div>
        <div className="intro-word" aria-label="BridgeVoice">
          <b>Bridge</b>
          <span>Voice</span>
        </div>
        <p className="intro-tag">AI Interpreter &amp; Translation Assistant</p>
        <div className="intro-mic" aria-hidden="true">
          <div className="intro-mic-line" />
          <svg viewBox="0 0 18 22" fill="none" stroke="#2D7BFF" strokeWidth="1.6" strokeLinecap="round">
            <rect x="6" y="1.5" width="6" height="11" rx="3" />
            <path d="M2.5 10.5a6.5 6.5 0 0 0 13 0M9 17v3.5M6 20.5h6" />
          </svg>
          <div className="intro-mic-line" />
        </div>
        <div className="intro-progress" aria-hidden="true">
          <i />
        </div>
      </div>
      <button className="intro-skip" tabIndex={-1} type="button">
        Skip intro
      </button>
    </div>
  );
}
