"use client";
import { useEffect, useState } from "react";
import { Language } from "./languages";
export function useVoiceOutput(language: Language, volume: number) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]),
    [speaking, setSpeaking] = useState(false),
    [paused, setPaused] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.speechSynthesis.cancel();
    };
  }, []);
  const voice = voices.find((v) =>
    language === "fa-AF"
      ? v.lang.toLowerCase() === "fa-af"
      : v.lang.toLowerCase().startsWith(language),
  );
  function stop() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setPaused(false);
  }
  function speak(text: string) {
    if (!voice) {
      setError("No matching voice is installed for this language.");
      return;
    }
    stop();
    const utterance = new SpeechSynthesisUtterance(
      text.replace(/[#*_`]/g, "").slice(0, 12000),
    );
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.volume = volume;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => {
      setSpeaking(false);
      setError("Read aloud could not complete.");
    };
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }
  function togglePause() {
    if (paused) window.speechSynthesis.resume();
    else window.speechSynthesis.pause();
    setPaused(!paused);
  }
  return {
    supported: !!voice,
    speak,
    stop,
    speaking,
    paused,
    togglePause,
    error,
  };
}
