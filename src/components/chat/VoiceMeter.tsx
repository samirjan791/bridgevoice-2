"use client";
import { useEffect, useRef, useState } from "react";
export function VoiceMeter({ listening }: { listening: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null),
    [active, setActive] = useState(false);
  useEffect(() => {
    if (!listening) return;
    let disposed = false,
      stream: MediaStream | undefined,
      context: AudioContext | undefined,
      frame = 0;
    setActive(false);
    void navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then(async (s) => {
        if (disposed) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        context = new AudioContext();
        await context.resume();
        if (disposed) {
          s.getTracks().forEach((t) => t.stop());
          void context.close();
          return;
        }
        const analyser = context.createAnalyser();
        analyser.fftSize = 256;
        context.createMediaStreamSource(s).connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        setActive(true);
        function draw() {
          if (disposed) return;
          analyser.getByteTimeDomainData(data);
          const ctx = canvas.current?.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, 220, 42);
            ctx.beginPath();
            ctx.strokeStyle = "#0787c1";
            ctx.lineWidth = 2;
            data.forEach((v, i) => {
              const x = (i / data.length) * 220,
                y = (v / 255) * 42;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            });
            ctx.stroke();
          }
          frame = requestAnimationFrame(draw);
        }
        draw();
      })
      .catch(() => setActive(false));
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((t) => t.stop());
      void context?.close();
    };
  }, [listening]);
  if (!listening) return null;
  return (
    <div className="voice-meter">
      <canvas
        ref={canvas}
        width={220}
        height={42}
        aria-label="Live microphone amplitude"
      />
      <small>
        {active
          ? "Live microphone amplitude"
          : "Listening indicator · audio meter unavailable"}
      </small>
    </div>
  );
}
