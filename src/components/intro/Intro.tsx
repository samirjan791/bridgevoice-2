"use client";
import { useEffect, useState } from "react";
import { WORDMARK_GLYPHS, WORDMARK_TEXT, WORDMARK_VIEWBOX } from "./wordmark-paths";

/**
 * Opening sequence: two greetings cross a bridge that draws itself, the
 * BridgeVoice wordmark is written stroke by stroke, and the tagline types in.
 *
 * - The overlay is server-rendered but hidden by CSS unless the inline boot
 *   script (see src/lib/intro-boot.ts) sets <html data-intro="play">.
 * - It plays once per browser session, never under prefers-reduced-motion,
 *   and can be switched off in Settings.
 * - Click, tap, Escape, Enter or Space skips it at any time.
 * - Only transform, opacity and SVG stroke-dashoffset are animated.
 * - Arabic-script text is never split per letter (it would break joining).
 */
export const INTRO_TAGLINE = "Every Voice Deserves to Be Understood.";
const TOTAL_MS = 3100;
const TYPE_START_MS = 1850;
const TYPE_STEP_MS = 22;

export function Intro() {
  const [active, setActive] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [typed, setTyped] = useState("");

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
      window.clearInterval(typer);
      window.removeEventListener("keydown", onKey, true);
      setLeaving(true);
      timers.push(
        window.setTimeout(() => {
          root.dataset.intro = "done";
          setActive(false);
        }, 320),
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
    let i = 0;
    let typer = 0;
    timers.push(
      window.setTimeout(() => {
        typer = window.setInterval(() => {
          i += 1;
          setTyped(INTRO_TAGLINE.slice(0, i));
          if (i >= INTRO_TAGLINE.length) window.clearInterval(typer);
        }, TYPE_STEP_MS);
      }, TYPE_START_MS),
    );
    timers.push(window.setTimeout(finish, TOTAL_MS));
    return () => {
      finished = true;
      timers.forEach((id) => window.clearTimeout(id));
      window.clearInterval(typer);
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
      <div className="intro-stage">
        <div className="intro-bridge-wrap">
          <span className="intro-greet intro-greet-a">
            <span className="g-from" lang="en">
              Hello
            </span>
            <span className="g-to" lang="fa-AF" dir="rtl">
              سلام
            </span>
          </span>
          <span className="intro-greet intro-greet-b">
            <span className="g-from" lang="fa-AF" dir="rtl">
              سلام
            </span>
            <span className="g-to" lang="en">
              Hello
            </span>
          </span>
          <svg
            className="intro-bridge"
            viewBox="0 0 64 64"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path className="b-arch" pathLength={1} d="M12 38c10-24 30-24 40 0" />
            <path className="b-deck" pathLength={1} d="M12 43h40" />
            <path className="b-pillars" pathLength={1} d="M24 31v11M32 26v17M40 31v11" />
            <path className="b-ends" pathLength={1} d="M8 27v8M56 27v8" />
            <path className="intro-light-trace" pathLength={1} d="M12 38c10-24 30-24 40 0" />
          </svg>
        </div>
        <svg
          className="intro-wordmark"
          viewBox={WORDMARK_VIEWBOX}
          role="presentation"
          fill="currentColor"
          stroke="currentColor"
        >
          <title>{WORDMARK_TEXT}</title>
          {WORDMARK_GLYPHS.map((d, i) => (
            <path
              key={i}
              d={d}
              pathLength={1}
              className="w-glyph"
              style={{ ["--i" as string]: i }}
            />
          ))}
        </svg>
        <p className="intro-tagline">
          <span>{typed}</span>
          <i className="intro-caret" />
        </p>
      </div>
      <button className="intro-skip" tabIndex={-1} type="button">
        Skip
      </button>
    </div>
  );
}
