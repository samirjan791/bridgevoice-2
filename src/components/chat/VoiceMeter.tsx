"use client";
import { useEffect, useRef, useState } from "react";
import { usePreferences } from "@/components/providers";

/** Optional visual-only meter. Never fabricates microphone activity. */
export function VoiceMeter({ listening }: { listening: boolean }) {
  const { settings } = usePreferences();
  const pathRef = useRef<SVGPathElement | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "unavailable">("loading");
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const refresh = () => setReduced(Boolean(media?.matches));
    refresh(); media?.addEventListener?.("change", refresh);
    return () => media?.removeEventListener?.("change", refresh);
  }, []);
  const motionOff = !settings.motion || reduced;
  useEffect(() => {
    if (!listening || motionOff) return;
    let cancelled = false, frame = 0;
    let stream: MediaStream | undefined, context: AudioContext | undefined;
    setState("loading"); pathRef.current?.setAttribute("d", "M0 20H240");
    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia || !window.AudioContext) throw new Error("Meter unavailable");
        const captured = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) { captured.getTracks().forEach(t => t.stop()); return; }
        stream = captured;
        context = new AudioContext();
        const source = context.createMediaStreamSource(stream);
        const analyser = context.createAnalyser(); analyser.fftSize = 512;
        source.connect(analyser);
        const samples = new Uint8Array(analyser.fftSize);
        setState("ready");
        const draw = () => {
          if (cancelled) return;
          analyser.getByteTimeDomainData(samples);
          const points: string[] = [];
          for (let i = 0; i < 60; i++) {
            const sample = samples[Math.floor(i * samples.length / 60)];
            const y = 20 + (sample - 128) / 128 * 17;
            points.push(`${i === 0 ? "M" : "L"}${(i * 240 / 59).toFixed(1)} ${y.toFixed(1)}`);
          }
          pathRef.current?.setAttribute("d", points.join(""));
          frame = requestAnimationFrame(draw);
        };
        frame = requestAnimationFrame(draw);
      } catch {
        if (!cancelled) { setState("unavailable"); pathRef.current?.setAttribute("d", "M0 20H240"); }
      }
    };
    void start();
    return () => {
      cancelled = true; cancelAnimationFrame(frame);
      stream?.getTracks().forEach(t => t.stop());
      if (context) void context.close().catch(() => {});
    };
  }, [listening, motionOff]);
  if (!listening) return null;
  const label = motionOff ? "Microphone listening (motion off)" : state === "ready" ? "Live microphone waveform" : state === "unavailable" ? "Microphone meter unavailable" : "Microphone meter starting";
  return <div className="voice-meter" role="img" aria-label={label}><svg viewBox="0 0 240 40" preserveAspectRatio="none" aria-hidden="true"><path ref={pathRef} key={state + (motionOff ? "-off" : "")} d="M0 20H240" stroke="currentColor" fill="none" strokeWidth="1.8" /></svg></div>;
}
