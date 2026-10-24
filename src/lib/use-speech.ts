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
export function useSpeech(onFinal: (text: string) => void) {
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
        recognition.current.onend = null;
        recognition.current.abort();
      }
    };
  }, []);
  function stop() {
    recognition.current?.abort();
    recognition.current = null;
    setListening(false);
    setInterim("");
  }
  function start() {
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
    r.lang = "en-US";
    r.continuous = true;
    r.interimResults = true;
    r.onstart = () => {
      setListening(true);
      setError("");
    };
    r.onend = () => {
      setListening(false);
      recognition.current = null;
      setInterim("");
    };
    r.onerror = (e) => {
      setError(
        e.error === "not-allowed"
          ? "Microphone permission denied. Allow microphone access or use text input."
          : "Speech recognition stopped: " +
              e.error +
              ". You can restart or type.",
      );
    };
    r.onresult = (e) => {
      let partial = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) callback.current(result[0].transcript);
        else partial += result[0].transcript;
      }
      setInterim(partial);
    };
    recognition.current = r;
    try {
      r.start();
    } catch {
      stop();
      setError("Microphone could not start. Use text input or retry.");
    }
  }
  return { listening, interim, error, supported, start, stop };
}
