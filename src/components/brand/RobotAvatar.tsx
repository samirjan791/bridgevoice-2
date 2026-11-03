"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { usePreferences } from "../providers";

/** The supplied robot footage; never a voice/connection status indicator. */
export function RobotAvatar({ size = 28 }: { size?: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { settings } = usePreferences();
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    let visible = true;
    let disposed = false;
    let allowed = false;
    const sync = () => {
      allowed = settings.motion && !!reduced && !reduced.matches && visible && !document.hidden;
      if (allowed) {
        void video.play().catch(() => { if (!disposed) video.style.opacity = "0"; });
      } else {
        video.pause();
        video.style.opacity = "0";
      }
    };
    const playing = () => {
      if (allowed && !disposed) video.style.opacity = "1";
      else video.pause();
    };
    const failed = () => { video.style.opacity = "0"; };
    const observer = typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }) : null;
    observer?.observe(video);
    reduced?.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    video.addEventListener("playing", playing);
    video.addEventListener("error", failed);
    sync();
    return () => {
      disposed = true;
      observer?.disconnect();
      reduced?.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      video.removeEventListener("playing", playing);
      video.removeEventListener("error", failed);
      video.pause();
    };
  }, [settings.motion]);
  return <span className="robot-avatar robot-original-video" style={{ width: size, height: size }} aria-hidden="true">
    <Image src="/brand/robot-poster.png" alt="" width={size} height={size} />
    <video ref={videoRef} src="/brand/robot-original.mp4" poster="/brand/robot-poster.png"
      muted loop playsInline preload="metadata" tabIndex={-1} disablePictureInPicture />
  </span>;
}
