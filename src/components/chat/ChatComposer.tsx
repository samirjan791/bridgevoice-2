"use client";
import { useRef } from "react";
import {
  ArrowUp,
  Mic,
  Paperclip,
  Square,
  X,
  AudioLines,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { ui } from "@/lib/ui-text";
import { Language } from "@/lib/languages";
import { VoiceMeter } from "./VoiceMeter";
export function ChatComposer({
  text,
  setText,
  onSend,
  busy,
  onStop,
  onAttach,
  listening,
  onMic,
  micSupported,
  uiLanguage,
  onBridge,
  onMirror,
  onOptions,
  interim,
}: {
  text: string;
  setText: (v: string) => void;
  onSend: () => void;
  busy: boolean;
  onStop: () => void;
  onAttach: (file: File) => void;
  listening: boolean;
  onMic: () => void;
  micSupported: boolean;
  uiLanguage: Language;
  onBridge: () => void;
  onMirror: () => void;
  onOptions: () => void;
  interim: string;
}) {
  const file = useRef<HTMLInputElement>(null);
  const t = ui[uiLanguage];
  return (
    <div className="composer-wrap">
      <VoiceMeter listening={listening} />
      {interim && (
        <p className="speech-interim" role="status">
          {interim}
        </p>
      )}
      <div className={"chat-composer " + (listening ? "listening" : "")}>
        <label className="sr-only" htmlFor="chat-input">
          Message
        </label>
        <textarea
          id="chat-input"
          dir="auto"
          value={text}
          maxLength={12000}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.placeholder}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing &&
              window.matchMedia("(min-width: 761px)").matches
            ) {
              e.preventDefault();
              if (!busy) onSend();
            }
          }}
        />
        <div className="composer-controls">
          <div>
            <input
              ref={file}
              type="file"
              accept=".pdf,.docx,.txt"
              className="sr-only"
              aria-label="Choose a document"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onAttach(f);
                e.target.value = "";
              }}
            />
            <button
              className="tool-icon"
              aria-label={t.attach}
              disabled={busy}
              onClick={() => file.current?.click()}
            >
              <Paperclip size={19} />
            </button>
            <button
              className={"tool-icon " + (listening ? "active-mic" : "")}
              aria-label={listening ? "Stop microphone" : t.voice}
              title={
                micSupported
                  ? "English speech input"
                  : "Speech input unavailable. Type instead."
              }
              disabled={!micSupported}
              onClick={onMic}
            >
              <Mic size={19} />
            </button>
            <button
              className="composer-tool"
              onClick={onBridge}
              disabled={busy}
            >
              <AudioLines size={16} />
              <span>{t.bridge}</span>
            </button>
            <button
              className="composer-tool"
              onClick={onMirror}
              disabled={busy}
            >
              <ShieldCheck size={16} />
              <span>{t.mirror}</span>
            </button>
          </div>
          <div>
            <button
              className="tool-icon"
              onClick={onOptions}
              aria-label="Response options"
            >
              <SlidersHorizontal size={17} />
            </button>
            {text && (
              <button
                className="tool-icon"
                aria-label={t.clear}
                onClick={() => setText("")}
              >
                <X size={16} />
              </button>
            )}
            {busy ? (
              <button
                className="send-button"
                aria-label={t.stop}
                onClick={onStop}
              >
                <Square size={17} />
              </button>
            ) : (
              <button
                className="send-button"
                aria-label={t.send}
                disabled={!text.trim()}
                onClick={onSend}
              >
                <ArrowUp size={21} />
              </button>
            )}
          </div>
        </div>
      </div>
      <small className="composer-caption">{t.review}</small>
    </div>
  );
}
