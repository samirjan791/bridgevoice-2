"use client";
import { useEffect, useRef, useState } from "react";
import { ui } from "@/lib/ui-text";
import type { Language } from "@/lib/languages";

const ORDER: Language[] = ["en", "ps", "fa-AF", "es-US"];
const RTL: Language[] = ["ps", "fa-AF"];
const ROTATE_MS = 6000;
const FADE_MS = 240;
const TYPE_STEP_MS = 24;
const WORD_STEP_MS = 110;

/**
 * The welcome question, typed in on first appearance and on every rotation
 * through English, Pashto, Dari and Spanish. Latin text types letter by
 * letter; Arabic-script text types word by word, appending whole words, so
 * letter joining never breaks. Lang and text are always set together (never
 * one inside the other's updater), so the phrase is never rendered under the
 * wrong language's font and direction.
 * Pauses rotation while the user is typing; does nothing when `animate` is
 * false.
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
  const langRef = useRef<Language>(language);
  const typerRef = useRef(0);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Lang and text are a pair: update the ref and the state together, as two
  // separate calls, so they can never disagree mid-render.
  const applyLang = (next: Language) => {
    langRef.current = next;
    setLang(next);
  };

  const stopTyping = () => {
    window.clearInterval(typerRef.current);
    typerRef.current = 0;
  };

  // Reveal a phrase from empty: Latin letter by letter, Arabic-script word
  // by word (whole words only, so joining stays intact).
  const typePhrase = (full: string, rtl: boolean) => {
    stopTyping();
    setShown("");
    if (rtl) {
      const words = full.split(" ");
      let j = 0;
      typerRef.current = window.setInterval(() => {
        j += 1;
        setShown(words.slice(0, j).join(" "));
        if (j >= words.length) stopTyping();
      }, WORD_STEP_MS);
    } else {
      let i = 0;
      typerRef.current = window.setInterval(() => {
        i += 1;
        setShown(full.slice(0, i));
        if (i >= full.length) stopTyping();
      }, TYPE_STEP_MS);
    }
  };

  // Follow the interface language whenever the user changes it.
  useEffect(() => {
    applyLang(language);
    setShown(ui[language].welcome);
    setFading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Type the first line in, once. If the opening sequence is still playing,
  // wait until it has finished or been skipped.
  useEffect(() => {
    if (!animate) return;
    const full = ui[language].welcome;
    const rtl = RTL.includes(language);
    const root = document.documentElement;
    let start = 0;
    let observer: MutationObserver | undefined;
    const begin = () => {
      start = window.setTimeout(() => typePhrase(full, rtl), 150);
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
      stopTyping();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, language]);

  // Rotate through the four languages, typing each new phrase in. The next
  // language comes from the ref, and lang + text are set as two separate
  // calls, so a rotated phrase can never render under the old language.
  useEffect(() => {
    if (!animate) return;
    let swap = 0;
    const id = window.setInterval(() => {
      if (pausedRef.current || document.hidden) return;
      setFading(true);
      swap = window.setTimeout(() => {
        const next = ORDER[(ORDER.indexOf(langRef.current) + 1) % ORDER.length];
        applyLang(next);
        setFading(false);
        typePhrase(ui[next].welcome, RTL.includes(next));
      }, FADE_MS);
    }, ROTATE_MS);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(swap);
      stopTyping();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      {animate && shown.length < ui[lang].welcome.length && (
        <i className="welcome-caret" aria-hidden="true" />
      )}
    </h1>
  );
}
