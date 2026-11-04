"use client";
import { useEffect, useRef, useState } from "react";
import type { Language } from "./languages";
import { selectVoice } from "./voice-support";
import { usePreferences } from "@/components/providers";
export function useVoiceOutput(language: Language, volume: number, liveSession = false) {
  const { settings } = usePreferences();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]),
    [cloud, setCloud] = useState(false),
    [speaking, setSpeaking] = useState(false),
    [paused, setPaused] = useState(false),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [label, setLabel] = useState("");
  const player = useRef<HTMLAudioElement | null>(null),
    url = useRef(""),
    request = useRef<AbortController | null>(null),
    generation = useRef(0);
  function dispose() {
    generation.current++;
    request.current?.abort();
    window.speechSynthesis?.cancel();
    if (player.current) {
      player.current.pause();
      player.current.removeAttribute("src");
      player.current.load();
      player.current = null;
    }
    if (url.current) {
      URL.revokeObjectURL(url.current);
      url.current = "";
    }
  }
  function stop() {
    dispose();
    setSpeaking(false);
    setPaused(false);
    setLoading(false);
  }
  useEffect(() => {
    const synth = window.speechSynthesis;
    const load = () => setVoices(synth?.getVoices() || []);
    load();
    synth?.addEventListener("voiceschanged", load);
    const controller = new AbortController();
    fetch("/api/speech", { signal: controller.signal })
      .then((r) => r.json())
      .then((r) => setCloud(!!r.configured))
      .catch(() => {});
    return () => {
      controller.abort();
      synth?.removeEventListener("voiceschanged", load);
      dispose();
    };
  }, []);
  useEffect(() => {
    if (player.current) player.current.volume = volume;
  }, [volume]);
  async function speak(text: string, requestedLanguage: Language = language) {
    stop();
    setError("");
    const cleaned = text.replace(/[#*_`]/g, "").trim();
    if (!cleaned) return;
    const allowedVoices = requestedLanguage === "fa-AF" && !settings.allowPersian ? voices.filter(v => ["fa-af","prs","prs-af"].includes(v.lang.toLowerCase())) : voices;
    const preferred = allowedVoices.find(v => v.voiceURI === settings.preferredVoices[requestedLanguage]);
    const exact = preferred || selectVoice(allowedVoices, requestedLanguage);
    const fallback =
      !exact && requestedLanguage === "fa-AF" && settings.allowPersian
        ? selectVoice(voices, requestedLanguage, true)
        : undefined;
    const selected = exact || fallback;
    if (selected) {
      if (
        fallback && !liveSession &&
        !window.confirm(
          "A native Dari voice is not installed. Read this text using a Persian (Iran) voice instead? Pronunciation may differ from Dari.",
        )
      )
        return;
      const run = generation.current;
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.voice = selected;
      utterance.lang = selected.lang;
      utterance.volume = volume;
      utterance.rate = settings.speechRate;
      utterance.onstart = () => {if(run===generation.current){setLoading(false);setSpeaking(true);}};
      utterance.onend = () => {
        if (run === generation.current) {
          setLoading(false);
          setSpeaking(false);
          setPaused(false);
        }
      };
      utterance.onerror = () => {
        if (run === generation.current) {
          setLoading(false);
          setSpeaking(false);
          setPaused(false);
          setError(
            "The browser voice could not finish. Try a shorter passage or another installed voice.",
          );
        }
      };
      setLabel(
        fallback
          ? "Persian pronunciation · browser voice"
          : "Browser voice · " + selected.lang,
      );
      setLoading(true);
      window.speechSynthesis.speak(utterance);
      return;
    }
    if (!cloud) {
      setError(
        "No matching voice is installed. Enable cloud speech with AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in the server .env.local. Pashto and Spanish are supported there; Dari uses an explicitly labeled Persian voice.",
      );
      return;
    }
    if (cleaned.length > 6000) {
      setError(
        "Cloud read-aloud supports up to 6,000 characters per request. Ask for a shorter answer.",
      );
      return;
    }
    const persian = requestedLanguage === "fa-AF";
    if (persian && !settings.allowPersian) { setError("Dari cloud speech requires explicit Persian-pronunciation agreement in Settings. No Persian voice was used."); return; }
    if (
      !liveSession && !window.confirm(
        (persian
          ? "This will use Persian (Iran) pronunciation, not a native Dari voice. "
          : "") +
          "Send this answer to Microsoft Azure Speech to generate audio? Provider processing and usage charges apply.",
      )
    )
      return;
    const run = generation.current;
    request.current = new AbortController();
    setLoading(true);
    setLabel(
      persian
        ? "Persian pronunciation · Azure Speech"
        : "Azure Speech · " + requestedLanguage,
    );
    try {
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-bridgevoice-access":
            sessionStorage.getItem("bridgevoice.access") || "",
        },
        body: JSON.stringify({
          text: cleaned,
          language: requestedLanguage,
          allowPersian: persian && settings.allowPersian,
          consent: true,
        }),
        signal: request.current.signal,
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Speech unavailable.");
      }
      const blob = await response.blob();
      if (run !== generation.current) return;
      url.current = URL.createObjectURL(blob);
      const audio = new Audio(url.current);
      player.current = audio;
      audio.volume = volume;
      audio.onended = () => {
        if (run === generation.current) stop();
      };
      audio.onerror = () => {
        if (run === generation.current) {
          stop();
          setError("Audio playback failed. Please try again.");
        }
      };
      await audio.play();
      if (run === generation.current) setSpeaking(true);
    } catch (e) {
      if (run === generation.current) {
        setSpeaking(false);
        setError(e instanceof Error ? e.message : "Unable to read aloud.");
      }
    } finally {
      if (run === generation.current) setLoading(false);
    }
  }
  function togglePause() {
    if (player.current) {
      if (paused)
        void player.current
          .play()
          .then(() => setPaused(false))
          .catch(() => setError("Press Read aloud again to start playback."));
      else {
        player.current.pause();
        setPaused(true);
      }
    } else {
      if (paused) window.speechSynthesis?.resume();
      else window.speechSynthesis?.pause();
      setPaused(!paused);
    }
  }
  return {
    canSpeakLanguage: (l: Language) => !!selectVoice(voices,l) || (l === "fa-AF" && !!selectVoice(voices,l,true)) || cloud,
    supported: !!selectVoice(voices, language) || cloud,
    speak,
    stop,
    speaking,
    paused,
    loading,
    togglePause,
    error,
    label,
  };
}
