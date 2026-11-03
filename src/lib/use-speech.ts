"use client";
import { useEffect, useRef, useState } from "react";
type RecognitionResult = {
  isFinal: boolean;
  0: { transcript: string; confidence: number };
};
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult:
    | ((e: {
        resultIndex: number;
        results: ArrayLike<RecognitionResult>;
      }) => void)
    | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};
export function useSpeech(onFinal: (text: string) => void, onTurnEnd?: (failed: boolean) => void, onActivity?: (text: string) => void) {
  const activity=useRef(onActivity);activity.current=onActivity;
  const ended = useRef(onTurnEnd); ended.current = onTurnEnd;
  const callback = useRef(onFinal);
  callback.current = onFinal;
  const recognition = useRef<Recognition | null>(null);
  const [listening, setListening] = useState(false),
    [interim, setInterim] = useState(""),
    [error, setError] = useState(""),
    [supported, setSupported] = useState(false);
  useEffect(() => {
    const w = window as SpeechWindow;
    setSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => {
      if (recognition.current) {
        const active = recognition.current;
        recognition.current = null;
        active.onend = null;
        active.abort();
      }
    };
  }, []);
  function stop() {
    const active = recognition.current;
    recognition.current = null;
    active?.abort();
    setListening(false);
    setInterim("");
  }
  function finish() { recognition.current?.stop(); }
  function start(language: string = "en-US", singleTurn = false) {
    if (recognition.current) return;
    const w = window as SpeechWindow,
      C = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!C) {
      setError(
        "Speech recognition is unavailable. Type your transcript instead.",
      );
      return;
    }
    const r = new C();
    r.lang = language;
    r.continuous = !singleTurn;
    let failed = false;
    const finalized = new Set<number>();
    r.interimResults = true;
    r.onstart = () => {
      if (recognition.current !== r) return;
      setListening(true);
      setError("");
    };
    r.onend = () => {
      if (recognition.current !== r) return;
      setListening(false);
      recognition.current = null;
      setInterim("");
      ended.current?.(failed);
    };
    r.onerror = (e) => {
      if (recognition.current !== r) return;
      if(e.error === "no-speech") return;
      failed = true;
      setError(
        e.error === "not-allowed"
          ? "Microphone permission denied. Allow microphone access or use text input."
          : "Speech recognition stopped: " +
              e.error +
              ". You can restart or type.",
      );
    };
    r.onresult = (e) => {
      if (recognition.current !== r) return;
      let partial = "";
      const heard=Array.from(e.results).slice(e.resultIndex).map(r=>r[0].transcript).join(" ");
      const fresh=Array.from(e.results).slice(e.resultIndex).some((r,i)=>!r.isFinal||!finalized.has(i+e.resultIndex));
      if(heard.trim()&&fresh)activity.current?.(heard);
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal && !finalized.has(i)) { finalized.add(i); callback.current(result[0].transcript); }
        else if (!result.isFinal) partial += result[0].transcript;
      }
      setInterim(partial);
    };
    recognition.current = r;
    try {
      r.start();
    } catch {
      stop();
      setError("Microphone could not start. Use text input or retry.");
      ended.current?.(true);
    }
  }
  return { listening, interim, error, supported, start, stop, finish };
}
