"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePreferences } from "./providers";
import { STORAGE_KEY } from "@/lib/storage";
import { HISTORY_KEY } from "@/lib/chat/history";
import { Language, packs } from "@/lib/languages";
export function Settings() {
  const { settings, update, notify } = usePreferences();
  const [configured, setConfigured] = useState(false),
    [code, setCode] = useState("");
  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((s) => setConfigured(!!s.configured))
      .catch(() => {});
    try {
      setCode(sessionStorage.getItem("bridgevoice.access") || "");
    } catch {
      notify("Session storage is unavailable.");
    }
  }, [notify]);
  return (
    <div className="page-wrap narrow">
      <span className="eyebrow">YOUR LANGUAGE. YOUR CONTROL.</span>
      <h1>Preferences & privacy</h1>
      <p>Preferences stay in this browser. Chat history is off by default.</p>
      <section className="settings-panel">
        <h2>Language & voice</h2>
        <label>
          Interface language
          <select
            value={settings.uiLanguage}
            onChange={(e) => update({ uiLanguage: e.target.value as Language })}
          >
            {Object.values(packs).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Response language
          <select
            value={settings.target}
            onChange={(e) => update({ target: e.target.value as Language })}
          >
            {Object.values(packs).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.automatic}
            onChange={(e) => update({ automatic: e.target.checked })}
          />
          Automatically send finalized English speech in Bridge Mode
        </label>
        <p className="muted">
          Outside Bridge Mode, speech fills the input for you to correct and
          send. English recognition depends on browser support. Pashto and Dari
          speech input is not enabled. Choose the default microphone in browser
          or operating-system settings.
        </p>
        <label>
          Read-aloud volume
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.volume}
            onChange={(e) => update({ volume: Number(e.target.value) })}
          />
        </label>
      </section>
      <section className="settings-panel">
        <h2>Appearance & accessibility</h2>
        <label>
          Theme
          <select
            value={settings.theme}
            onChange={(e) =>
              update({ theme: e.target.value as "light" | "dark" })
            }
          >
            <option value="light">Soft ivory</option>
            <option value="dark">Midnight</option>
          </select>
        </label>
        <label>
          Reading size
          <select
            value={settings.font}
            onChange={(e) =>
              update({ font: e.target.value as "normal" | "large" })
            }
          >
            <option value="normal">Standard</option>
            <option value="large">Large</option>
          </select>
        </label>
        {(
          [
            [
              "motion",
              "Enable motion (system reduced-motion takes precedence)",
            ],
            ["contrast", "High contrast"],
          ] as const
        ).map(([key, label]) => (
          <label className="toggle" key={key}>
            <input
              type="checkbox"
              checked={settings[key]}
              onChange={(e) => update({ [key]: e.target.checked })}
            />
            {label}
          </label>
        ))}
      </section>
      <section className="settings-panel">
        <h2>Conversation history</h2>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.history}
            onChange={(e) => update({ history: e.target.checked })}
          />
          Save non-sensitive conversations on this device
        </label>
        <p>
          Enabling history saves this chat and later chats, including answers
          and quoted excerpts. Anyone using this browser profile can access
          them. Keep this off for sensitive information. Up to 20 chats are
          kept. Disabling history stops future saves; delete existing history
          below.
        </p>
        <button
          onClick={() => {
            if (window.confirm("Permanently delete saved chat history?"))
              try {
                localStorage.removeItem(HISTORY_KEY);
                notify("Saved chat history deleted.");
              } catch {
                notify(
                  "Could not delete history. Use browser site-data controls.",
                );
              }
          }}
        >
          Delete saved chat history
        </button>
        <p>
          Use New chat to clear current context. Export chat in Response options
          creates a file only when you choose to download it.
        </p>
      </section>
      <section className="settings-panel">
        <h2>Meta connection</h2>
        <p>
          {configured
            ? "A server key is configured. A successful chat request is still required to verify connectivity."
            : "No server key detected. Guided offline tools are available."}
        </p>
        <p>
          Add MODEL_API_KEY to the private server .env.local file. Never enter
          an API key here. Live Meta mode requires permission to send your
          conversation and extracted document text externally.
        </p>
        <label>
          Private deployment access code (not your Meta API key)
          <input
            type="password"
            autoComplete="off"
            value={code}
            maxLength={200}
            onChange={(e) => setCode(e.target.value)}
          />
        </label>
        <button
          onClick={() => {
            try {
              sessionStorage.setItem("bridgevoice.access", code);
              notify("Access code saved for this tab.");
            } catch {
              notify("Session storage is unavailable.");
            }
          }}
        >
          Save access code for this tab
        </button>
        <p>
          <Link href="/">Open chat to test a real request →</Link>
        </p>
      </section>
      <section className="settings-panel">
        <h2>Keyboard & data controls</h2>
        <p>
          On desktop, Enter sends; Shift+Enter adds a line. On mobile, Enter
          adds a line. Escape stops generation and microphone capture. Tab moves
          between controls.
        </p>
        <button
          className="danger"
          onClick={() => {
            if (
              window.confirm(
                "Delete all saved chats, glossary and preferences? Export anything you want to keep first.",
              )
            ) {
              try {
                [STORAGE_KEY, HISTORY_KEY, "bridgevoice.settings.v2"].forEach(
                  (k) => localStorage.removeItem(k),
                );
                sessionStorage.removeItem("bridgevoice.access");
                window.location.reload();
              } catch {
                notify(
                  "Unable to clear storage. Use browser site-data controls.",
                );
              }
            }
          }}
        >
          Delete all BridgeVoice browser data
        </button>
      </section>
    </div>
  );
}
