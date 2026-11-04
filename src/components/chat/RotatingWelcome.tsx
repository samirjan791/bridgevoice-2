"use client";
import { useEffect, useRef, useState } from "react";
import { ui } from "@/lib/ui-text";
import type { Language } from "@/lib/languages";

const ORDER: Language[] = ["en", "ps", "fa-AF", "es-US"];
const RTL: Language[] = ["ps", "fa-AF"];
const ROTATE_MS = 6000;
const FADE_MS = 240;
const WORD_STEP_MS = 150;

/**
 * The welcome question, typed in word by word on first appearance and on
 * every rotation through English, Pashto, Dari and Spanish. Every phrase
 * appends one whole word per step (~150ms), so all four languages reveal at
 * the same slow, deliberate pace, and Arabic-script letter joining never
 * breaks (words are never split). Lang and text are always set together
 * (never one inside the other's updater), so the phrase is never rendered
 * under the wrong language's font and direction. The rotation clock
 * restarts from zero every time a phrase finishes typing, so no rotation
 * can ever fire mid-typing: the first sentence always types to its full
 * final word and stays before any rotation happens, on any connection or
 * device speed.
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
  const rotationRef = useRef(0);
  const swapRef = useRef(0);
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

  const stopRotation = () => {
    window.clearInterval(rotationRef.current);
    rotationRef.current = 0;
    window.clearTimeout(swapRef.current);
    swapRef.current = 0;
  };

  // Restart the rotation clock from zero. Called every time a phrase
  // finishes typing, so a rotation tick can only ever fire a full ROTATE_MS
  // after a completed phrase — never while a phrase is still typing, on
  // any timing. Typing takes at most ~1.4s, far inside the 6s window.
  const restartRotation = () => {
    stopRotation();
    rotationRef.current = window.setInterval(() => {
      if (pausedRef.current || document.hidden) return;
      setFading(true);
      swapRef.current = window.setTimeout(() => {
        const next = ORDER[(ORDER.indexOf(langRef.current) + 1) % ORDER.length];
        applyLang(next);
        setFading(false);
        typePhrase(ui[next].welcome);
      }, FADE_MS);
    }, ROTATE_MS);
  };

  // Reveal a phrase from empty, one whole word per step, in every language.
  // Words are never split, so Arabic-script joining stays intact, and every
  // phrase takes roughly a second — a slow, readable pace, never a blur.
  // On completion the rotation clock restarts, guaranteeing the full phrase
  // stays on screen before any rotation.
  const typePhrase = (full: string) => {
    stopTyping();
    setShown("");
    const words = full.split(" ");
    let j = 0;
    typerRef.current = window.setInterval(() => {
      j += 1;
      setShown(words.slice(0, j).join(" "));
      if (j >= words.length) {
        stopTyping();
        restartRotation();
      }
    }, WORD_STEP_MS);
  };

  // Clear all timers on unmount.
  useEffect(
    () => () => {
      stopTyping();
      stopRotation();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Follow the interface language whenever the user changes it.
  useEffect(() => {
    applyLang(language);
    setShown(ui[language].welcome);
    setFading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Type the first line in, once, word by word. If the opening sequence is
  // still playing, wait until it has finished or been skipped. The rotation
  // clock restarts when this phrase finishes typing, so the full sentence
  // always appears before any rotation.
  useEffect(() => {
    if (!animate) return;
    const full = ui[language].welcome;
    const root = document.documentElement;
    let start = 0;
    let observer: MutationObserver | undefined;
    const begin = () => {
      start = window.setTimeout(() => typePhrase(full), 150);
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
      stopRotation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, language]);

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
