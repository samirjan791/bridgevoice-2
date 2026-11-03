"use client";
import { useEffect } from "react";
/** Follow the visible viewport on mobile, including the software keyboard. */
export function useChatViewport() {
  useEffect(() => {
    const viewport = window.visualViewport;
    const root = document.documentElement;
    const update = () => {
      // Let pinch zoom work normally; do not resize the app around a zoomed view.
      if (viewport && viewport.scale !== 1) return;
      root.style.setProperty('--chat-viewport-height', `${viewport?.height ?? window.innerHeight}px`);
      root.style.setProperty('--chat-viewport-top', `${viewport?.offsetTop ?? 0}px`);
    };
    update();
    viewport?.addEventListener('resize', update);
    viewport?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      viewport?.removeEventListener('resize', update);
      viewport?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      root.style.removeProperty('--chat-viewport-height');
      root.style.removeProperty('--chat-viewport-top');
    };
  }, []);
}
