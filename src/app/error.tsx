"use client";
import { useEffect } from "react";

/** Route-level error boundary: one failing section never leaves a blank screen. */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Keep a local trace for the developer console only; nothing is sent anywhere.
    console.error(error);
  }, [error]);
  return (
    <main className="app-error" id="main" role="alert">
      <h1>Something went wrong</h1>
      <p>
        BridgeVoice hit an unexpected problem. Your saved glossary and chats on
        this device were not changed.
      </p>
      <button className="primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
