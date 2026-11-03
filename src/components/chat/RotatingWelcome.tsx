"use client";
import { useEffect, useRef, useState } from "react";
import { ui } from "@/lib/ui-text";
import type { Language } from "@/lib/languages";

const ORDER: Language[] = ["en", "ps", "fa-AF", "es-US"];
const RTL: Language[] = ["ps", "fa-AF"];
const ROTATE_MS = 6000;
const FADE_MS = 240;
const TYPE_STEP_MS = 24;

/**
 * The welcome question, written in on first appearance (Latin text only) and
 * then cross-faded between English, Pashto, Dari and Spanish.
 * Arabic-script text is never revealed letter by letter: that would break
 * letter joining. It only cross-fades as a whole.
 * Pauses while the user is typing; does nothing when `animate` is false.
 */
export function RotatingWelcome({
  language,
  animate,
  paused,
}: {
  language: Language;
  animate: boolean;
  paused: boolean;
}) {
  const [lang, setLang] = useState<Language>(language);
  const [shown, setShown] = useState(ui[language].welcome);
  const [fading, setFading] = useState(false);
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Follow the interface language whenever the user changes it.
  useEffect(() => {
    setLang(language);
    setShown(ui[language].welcome);
    setFading(false);
  }, [language]);

  // Write the first line in, once, for Latin-script languages. If the opening
  // sequence is still playing, wait until it has finished or been skipped.
  useEffect(() => {
    if (!animate || RTL.includes(language)) return;
    const full = ui[language].welcome;
    const root = document.documentElement;
    let i = 0;
    let typer = 0;
    let start = 0;
    let observer: MutationObserver | undefined;
    const begin = () => {
      start = window.setTimeout(() => {
        typer = window.setInterval(() => {
          i += 1;
          setShown(full.slice(0, i));
          if (i >= full.length) window.clearInterval(typer);
        }, TYPE_STEP_MS);
      }, 150);
    };
    setShown("");
    if (root.dataset.intro === "play") {
      observer = new MutationObserver(() => {
        if (root.dataset.intro !== "play") {
          observer?.disconnect();
          begin();
        }
      });
      observer.observe(root, { attributes: true, attributeFilter: ["data-intro"] });
    } else {
      begin();
    }
    return () => {
      observer?.disconnect();
      window.clearTimeout(start);
      window.clearInterval(typer);
      setShown(full);
    };
  }, [animate, language]);

  // Rotate through the four languages.
  useEffect(() => {
    if (!animate) return;
    let swap = 0;
    const id = window.setInterval(() => {
      if (pausedRef.current || document.hidden) return;
      setFading(true);
      swap = window.setTimeout(() => {
        setLang((cur) => {
          const next = ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length];
          setShown(ui[next].welcome);
          return next;
        });
        setFading(false);
      }, FADE_MS);
    }, ROTATE_MS);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(swap);
    };
  }, [animate]);

  return (
    <h1
      className="welcome-line"
      data-fading={fading ? "true" : undefined}
      lang={lang}
      dir={RTL.includes(lang) ? "rtl" : "ltr"}
      aria-label={ui[language].welcome}
    >
      <span aria-hidden="true">{shown}</span>
      {animate && !RTL.includes(lang) && shown.length < ui[lang].welcome.length && (
        <i className="welcome-caret" aria-hidden="true" />
      )}
    </h1>
  );
}
