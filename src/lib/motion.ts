/**
 * Shared motion layer. CSS variables in src/app/motion.css mirror these values.
 * Nothing else in the app should hard-code durations or easings.
 */
export const duration = { instant: 0.09, fast: 0.15, base: 0.22, slow: 0.36 } as const;
export const ease = {
  out: [0.22, 0.61, 0.36, 1] as [number, number, number, number],
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
};
export const spring = { type: "spring", stiffness: 380, damping: 32, mass: 0.9 } as const;

type ViewTransitionDocument = Document & {
  startViewTransition?: (cb: () => void) => unknown;
};

/**
 * Runs `change` with a circular reveal from (x, y) using the View Transitions
 * API. Falls back to running `change` immediately when the API is missing or
 * the user prefers reduced motion — the change itself is never delayed.
 */
export function withReveal(change: () => void, origin?: { x: number; y: number }) {
  const doc = typeof document === "undefined" ? undefined : (document as ViewTransitionDocument);
  const reduced =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!doc || typeof doc.startViewTransition !== "function" || reduced) {
    change();
    return;
  }
  const x = origin?.x ?? window.innerWidth - 40;
  const y = origin?.y ?? 40;
  doc.documentElement.style.setProperty("--reveal-x", x + "px");
  doc.documentElement.style.setProperty("--reveal-y", y + "px");
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  doc.documentElement.style.setProperty("--reveal-r", Math.ceil(r) + "px");
  try {
    doc.startViewTransition(change);
  } catch {
    change();
  }
}

export const motionTiming = { enter: duration.base, fast: duration.fast, base: duration.base, slow: duration.slow };
export const motionEase = ease.out;
