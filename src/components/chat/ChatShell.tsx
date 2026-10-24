"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Menu,
  ChevronDown,
  ArrowDown,
  Languages,
  Lightbulb,
  FileText,
  AudioLines,
  ShieldCheck,
  X,
  Download,
  Trash2,
  Pause,
  Square,
  Play,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { usePreferences } from "../providers";
import { Brand, LivingBridge } from "../brand/Brand";
import { ChatSidebar } from "./ChatSidebar";
import { ChatComposer } from "./ChatComposer";
import { ChatMessage } from "./ChatMessage";
import { BridgeMode } from "./BridgeMode";
import { DemoPanel } from "./DemoPanel";
import { useConversation } from "@/lib/chat/use-conversation";
import { useSpeech } from "@/lib/use-speech";
import { useVoiceOutput } from "@/lib/use-voice-output";
import { Language, packs } from "@/lib/languages";
import { ui } from "@/lib/ui-text";
import {
  Task,
  DocumentText,
  StoredChat,
  documentSchema,
} from "@/lib/chat/schema";
import {
  detectTask,
  detectLanguage,
  detectLocalAction,
} from "@/lib/chat/router";
import { readHistory, persistChat, removeChat } from "@/lib/chat/history";
import { readSaved, saveEntry, download } from "@/lib/storage";
import { demos } from "@/data/demos";
export function ChatShell({ demo = false }: { demo?: boolean }) {
  const { settings, update, notify } = usePreferences(),
    t = ui[settings.uiLanguage],
    reduced = useReducedMotion();
  const chat = useConversation(notify);
  const [text, setText] = useState(""),
    [sidebar, setSidebar] = useState(false),
    [provider, setProvider] = useState<"offline" | "meta">("offline"),
    [configured, setConfigured] = useState(false),
    [consent, setConsent] = useState(false),
    [options, setOptions] = useState(false),
    [task, setTask] = useState<Task>("auto"),
    [level, setLevel] = useState<"simple" | "standard" | "detailed">(
      "standard",
    ),
    [bridge, setBridge] = useState(false),
    [paused, setPaused] = useState(false),
    [mirror, setMirror] = useState(false),
    [original, setOriginal] = useState(""),
    [proposed, setProposed] = useState(""),
    [source, setSource] = useState<Language>("en"),
    [document, setDocument] = useState<DocumentText | undefined>(),
    [uploading, setUploading] = useState(false),
    [history, setHistory] = useState<StoredChat[]>([]),
    [id, setId] = useState(""),
    [scenario, setScenario] = useState(0),
    [playing, setPlaying] = useState(false),
    [index, setIndex] = useState(-1),
    [showJump, setShowJump] = useState(false),
    [voiceLanguage, setVoiceLanguage] = useState<Language>("en");
  const scroll = useRef<HTMLDivElement>(null),
    bottom = useRef<HTMLDivElement>(null),
    stick = useRef(true),
    uploadAbort = useRef<AbortController | null>(null),
    uploadGeneration = useRef(0);
  const voice = useVoiceOutput(voiceLanguage, settings.volume);
  const sendRef = useRef<(s?: string) => Promise<boolean>>(async () => false);
  const speech = useSpeech((value) => {
    if (bridge && settings.automatic && !paused && !chat.busy)
      void sendRef.current(value);
    else {
      setText((old) => (old + " " + value).trim().slice(0, 12000));
      if (chat.busy)
        notify("New speech kept in the input while this answer finishes.");
    }
  });
  useEffect(() => {
    setId(crypto.randomUUID());
    fetch("/api/status")
      .then((r) => r.json())
      .then((s) => setConfigured(!!s.configured))
      .catch(() => setConfigured(false));
    return () => uploadAbort.current?.abort();
  }, []);
  useEffect(() => {
    try {
      setHistory(settings.history ? readHistory() : []);
    } catch {
      notify(
        "Saved chats could not be read. Export available content before clearing storage.",
      );
    }
  }, [settings.history, notify]);
  useEffect(() => {
    if (!settings.history) {
      setHistory([]);
      return;
    }
    if (!id || !chat.messages.length || chat.busy) return;
    try {
      persistChat({
        id,
        title:
          chat.messages.find((m) => m.role === "user")?.content.slice(0, 65) ||
          "Conversation",
        updated: Date.now(),
        messages: chat.messages,
      });
      setHistory(readHistory());
    } catch {
      notify(
        "Chat history could not be saved. Export this conversation to keep a copy.",
      );
    }
  }, [chat.messages, chat.busy, settings.history, id, notify]);
  useEffect(() => {
    if (stick.current)
      bottom.current?.scrollIntoView?.({
        behavior: reduced || !settings.motion ? "instant" : "smooth",
        block: "end",
      });
  }, [chat.messages, chat.draft, reduced, settings.motion]);
  useEffect(() => {
    function escape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        speech.stop();
        voice.stop();
        chat.stop();
        setPlaying(false);
        setSidebar(false);
      }
    }
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  });
  function cancelUpload() {
    uploadGeneration.current++;
    uploadAbort.current?.abort();
    setUploading(false);
  }
  function newChat() {
    chat.reset();
    speech.stop();
    voice.stop();
    cancelUpload();
    setText("");
    setDocument(undefined);
    setOriginal("");
    setProposed("");
    setBridge(false);
    setMirror(false);
    setTask("auto");
    setPlaying(false);
    setIndex(-1);
    setId(crypto.randomUUID());
    setSidebar(false);
  }
  function startBridge() {
    setBridge(true);
    setMirror(false);
    setPaused(false);
    setTask("bridge");
    if (settings.target === "en") update({ target: "ps" });
  }
  async function send(value = text) {
    const message = value.trim();
    if (!message || chat.busy || uploading) return false;
    if (bridge && paused) {
      notify("Resume Bridge Mode before sending a segment.");
      return false;
    }
    const selectedLanguage = detectLanguage(message) || settings.target;
    if (detectLanguage(message)) update({ target: selectedLanguage });
    if (/make it simpler|make it shorter/i.test(message)) setLevel("simple");
    if (/explain more|more detail/i.test(message)) setLevel("detailed");
    const local = detectLocalAction(message);
    if (local === "save") {
      const term = chat.messages
        .filter((m) => m.result?.termsSaved.length)
        .at(-1)?.result?.termsSaved[0];
      if (term) {
        try {
          saveEntry(term);
          chat.localReply(
            message,
            "Saved **" +
              term.en +
              "** to your glossary. The entry remains marked unreviewed.",
          );
          setText("");
        } catch {
          notify("Could not save. Browser storage is unavailable.");
        }
      } else
        chat.localReply(
          message,
          "There is no extracted term to save yet. Ask about a word, or add it in your glossary.",
        );
      return true;
    }
    if (local === "saved") {
      try {
        const words = readSaved();
        const domain = message.match(/saved\s+(\w+)\s+words/i)?.[1];
        const filtered = domain
          ? words.filter((e) =>
              e.domain.toLowerCase().includes(domain.toLowerCase()),
            )
          : words;
        chat.localReply(
          message,
          filtered.length
            ? filtered
                .map(
                  (e) =>
                    "- **" +
                    e.en +
                    "** — " +
                    (e[selectedLanguage] || e.explanation),
                )
                .join("\n")
            : "No saved terms match yet.",
        );
        setText("");
      } catch {
        notify("Saved glossary could not be read.");
      }
      return true;
    }
    const detected = task === "auto" ? detectTask(message, !!document) : task;
    if (detected === "bridge" && !bridge) {
      startBridge();
      chat.localReply(
        message,
        "Bridge Mode is ready. Choose a language pair, then speak in supported English or type a segment. All suggestions remain under your control.",
      );
      setText("");
      return true;
    }
    if (detected === "compare" && !original && !proposed) {
      setMirror(true);
      setTask("compare");
      chat.localReply(
        message,
        "Add the original text and your translation in Meaning Mirror below. I’ll help you check potential differences.",
      );
      setText("");
      return true;
    }
    if (provider === "meta" && !consent) {
      chat.setError(
        "Confirm that you have permission to send this conversation and any attached text to Meta.",
      );
      return false;
    }
    const ok = await chat.send(
      {
        message,
        language: selectedLanguage,
        sourceLanguage: source,
        task: bridge ? "bridge" : mirror ? "compare" : task,
        level: /simpler|shorter/i.test(message)
          ? "simple"
          : /explain more/i.test(message)
            ? "detailed"
            : level,
        original: mirror ? original : bridge ? message : "",
        proposed: mirror ? proposed : "",
        document,
      },
      provider,
    );
    if (ok) setText((current) => (current === value ? "" : current));
    return ok;
  }
  sendRef.current = send;
  async function attach(file: File) {
    if (file.size > 4 * 1024 * 1024 || !/[.](pdf|docx|txt)$/i.test(file.name)) {
      notify("Choose a PDF, DOCX or TXT file under 4 MB.");
      return;
    }
    if (
      !window.confirm(
        "Extract this document on the BridgeVoice server? It is not saved. Sending its extracted text to Meta requires Live Meta mode and your consent.",
      )
    )
      return;
    cancelUpload();
    const run = uploadGeneration.current;
    uploadAbort.current = new AbortController();
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/document", {
        method: "POST",
        headers: {
          "x-bridgevoice-access":
            sessionStorage.getItem("bridgevoice.access") || "",
        },
        body: form,
        signal: uploadAbort.current.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (run !== uploadGeneration.current) return;
      setDocument(documentSchema.parse(data));
      setTask("document");
      notify("Text extracted. Ask a question or review the excerpt first.");
    } catch (e) {
      if (run === uploadGeneration.current)
        notify(e instanceof Error ? e.message : "Unable to read document.");
    } finally {
      if (run === uploadGeneration.current) setUploading(false);
    }
  }
  function microphone() {
    if (speech.listening) speech.stop();
    else if (source !== "en")
      notify(
        "Only English speech input is enabled. Type Pashto or Dari instead.",
      );
    else if (
      window.confirm(
        "Start English microphone input? Browser speech services may process audio externally. Obtain permission from everyone involved.",
      )
    )
      speech.start();
  }
  const current = demos[scenario];
  useEffect(() => {
    if (!playing || chat.busy || paused) return;
    const timer = setTimeout(
      () => {
        if (index >= current.segments.length - 1) {
          setPlaying(false);
          return;
        }
        const next = index + 1;
        setIndex(next);
        void sendRef.current(current.segments[next]).then((ok) => {
          if (!ok) setPlaying(false);
        });
      },
      index < 0 ? 100 : 5000,
    );
    return () => clearTimeout(timer);
  }, [playing, chat.busy, paused, index, current]);
  function demoNext() {
    setPlaying(false);
    const next = index + 1;
    if (next < current.segments.length) {
      setIndex(next);
      void send(current.segments[next]);
    }
  }
  const prompts = [
    {
      icon: Languages,
      title: t.translate,
      text: "Translate this into Pashto: ",
    },
    { icon: Lightbulb, title: t.understand, text: "What does dosage mean?" },
    {
      icon: AudioLines,
      title: t.practice,
      text: "Help me interpret a doctor’s conversation.",
    },
    {
      icon: FileText,
      title: t.document,
      text: "Help me understand a document.",
    },
  ];
  return (
    <div className="chat-app" dir={packs[settings.uiLanguage].dir}>
      <ChatSidebar
        open={sidebar}
        onClose={() => setSidebar(false)}
        onNew={newChat}
        history={history}
        historyEnabled={settings.history}
        language={settings.uiLanguage}
        onOpen={(c) => {
          chat.reset(c.messages);
          cancelUpload();
          setDocument(undefined);
          speech.stop();
          voice.stop();
          setId(c.id);
          setText("");
          setPlaying(false);
          setBridge(false);
          setMirror(false);
          setTask("auto");
          setSidebar(false);
        }}
        onDelete={(chatId) => {
          if (window.confirm("Delete this saved chat?")) {
            try {
              removeChat(chatId);
              setHistory(readHistory());
              if (chatId === id) newChat();
            } catch {
              notify("Unable to delete saved chat.");
            }
          }
        }}
      />
      <main className="chat-main" id="main">
        <header className="chat-topbar">
          <div>
            <button
              className="mobile-only tool-icon"
              aria-label="Open navigation"
              onClick={() => setSidebar(true)}
            >
              <Menu size={20} />
            </button>
            <span className="desktop-only topbar-label">
              Your space for understanding <ChevronDown size={13} />
            </span>
            <span className="mobile-only">
              <Brand />
            </span>
          </div>
          <div className="topbar-right">
            <span
              className={
                "connection " +
                (provider === "meta" && chat.connection === "Connected"
                  ? "connected"
                  : "")
              }
            >
              <i />
              {provider === "offline" ? "Demo mode" : chat.connection}
            </span>
            <label className="sr-only" htmlFor="language-select">
              Response and interface language
            </label>
            <select
              id="language-select"
              value={settings.target}
              onChange={(e) => {
                const language = e.target.value as Language;
                update({ target: language, uiLanguage: language });
              }}
            >
              <option value="en">English</option>
              <option value="ps">پښتو</option>
              <option value="fa-AF">دری</option>
            </select>
          </div>
        </header>
        <div
          className="conversation-scroll"
          ref={scroll}
          onScroll={() => {
            const el = scroll.current;
            if (!el) return;
            stick.current =
              el.scrollHeight - el.scrollTop - el.clientHeight < 130;
            setShowJump(!stick.current);
          }}
        >
          <div
            className={
              "conversation-column " +
              (!chat.messages.length ? "empty-conversation" : "")
            }
          >
            {demo && (
              <DemoPanel
                scenario={scenario}
                onScenario={(n) => {
                  newChat();
                  setScenario(n);
                }}
                playing={playing}
                onPlay={() => {
                  if (index >= current.segments.length - 1) setIndex(-1);
                  setPlaying(!playing);
                }}
                onReset={() => {
                  chat.reset();
                  setIndex(-1);
                  setPlaying(false);
                }}
                onNext={demoNext}
                index={index}
                disabled={chat.busy || (provider === "meta" && !consent)}
              />
            )}
            {!chat.messages.length && !bridge && (
              <section className="chat-welcome">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduced || !settings.motion ? 0 : 0.35,
                  }}
                >
                  <Brand full />
                  <span className="welcome-eyebrow">
                    THE HUMAN CONNECTION ENGINE
                  </span>
                  <h1>{t.welcome}</h1>
                  <p>{t.subtitle}</p>
                </motion.div>
                <div className="prompt-cards">
                  {prompts.map(({ icon: Icon, title, text: prompt }) => (
                    <button
                      key={title}
                      onClick={() => {
                        if (title === t.document) {
                          setOptions(true);
                          notify(
                            "Use the paperclip to attach a PDF, DOCX or TXT.",
                          );
                        }
                        setText(prompt);
                      }}
                    >
                      <Icon size={21} />
                      <span>{title}</span>
                      <span className="card-arrow">↗</span>
                    </button>
                  ))}
                </div>
                <div className="welcome-trust">
                  <ShieldCheck size={14} />
                  <span>
                    {settings.history
                      ? "Chat history is saved on this device"
                      : t.private}
                  </span>
                </div>
              </section>
            )}
            {chat.messages.map((message, i) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduced || !settings.motion ? 0 : 0.2 }}
              >
                <ChatMessage
                  message={message}
                  busy={chat.busy}
                  canSpeak={
                    voice.supported &&
                    (!message.result ||
                      message.result.targetLanguage === voiceLanguage)
                  }
                  onSpeak={(s, l) => {
                    setVoiceLanguage(l);
                    voice.speak(s);
                  }}
                  onFeedback={(v) => chat.feedback(message.id, v)}
                  onFollow={(s) => void send(s)}
                  onRetry={() => {
                    if (provider === "meta" && !consent) {
                      notify("Confirm permission before sending to Meta.");
                      return;
                    }
                    const user = chat.messages
                      .slice(0, i)
                      .findLast((m) => m.role === "user");
                    if (user) {
                      const base = chat.messages.slice(
                        0,
                        chat.messages.indexOf(user),
                      );
                      void chat.send(
                        {
                          message: user.content,
                          language: settings.target,
                          sourceLanguage: source,
                          task: message.result?.task || "auto",
                          level,
                          original: message.result?.sourcePassage || "",
                          proposed: "",
                          document,
                        },
                        provider,
                        base,
                      );
                    }
                  }}
                  onEdit={() => {
                    speech.stop();
                    chat.reset(chat.messages.slice(0, i));
                    setText(message.content);
                  }}
                />
              </motion.div>
            ))}
            {chat.busy && (
              <section className="streaming-message" aria-live="polite">
                <LivingBridge busy />
                {chat.draft ? (
                  <>
                    <small>Streaming draft · awaiting validation</small>
                    <p dir="auto">{chat.draft}</p>
                  </>
                ) : (
                  <p>Connecting words with meaning…</p>
                )}
              </section>
            )}
            {chat.error && (
              <div className="chat-error" role="alert">
                <p>{chat.error}</p>
                <button
                  disabled={chat.busy}
                  onClick={() => {
                    if (provider === "meta" && !consent) {
                      notify("Confirm permission first.");
                      return;
                    }
                    void chat.retry();
                  }}
                >
                  Retry response
                </button>
              </div>
            )}
            {speech.error && (
              <p className="chat-error" role="alert">
                {speech.error}
              </p>
            )}
            <div ref={bottom} />
          </div>
        </div>
        <div className="chat-bottom">
          <div className="composer-column">
            {showJump && (
              <button
                className="jump-latest"
                onClick={() => {
                  stick.current = true;
                  bottom.current?.scrollIntoView?.({ behavior: "smooth" });
                }}
              >
                <ArrowDown size={15} />
                Latest message
              </button>
            )}
            {bridge && (
              <BridgeMode
                source={source}
                target={settings.target}
                onSource={setSource}
                onTarget={(l) => update({ target: l })}
                listening={speech.listening}
                paused={paused}
                onPause={() => {
                  setPaused(!paused);
                  speech.stop();
                  setPlaying(false);
                  chat.stop();
                }}
                onStop={() => {
                  setPaused(true);
                  speech.stop();
                  chat.stop();
                  setPlaying(false);
                }}
                onReturn={() => {
                  setBridge(false);
                  setTask("auto");
                  setPaused(false);
                  speech.stop();
                }}
                onMic={microphone}
                micSupported={speech.supported}
              />
            )}
            {mirror && (
              <section className="mirror-panel">
                <div>
                  <b>
                    <ShieldCheck size={17} /> Meaning Mirror
                  </b>
                  <button
                    className="tool-icon"
                    aria-label="Close Meaning Mirror"
                    onClick={() => {
                      setMirror(false);
                      setTask("auto");
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="mirror-fields">
                  <label>
                    Original text
                    <textarea
                      aria-label="Original text"
                      value={original}
                      dir="auto"
                      maxLength={12000}
                      onChange={(e) => setOriginal(e.target.value)}
                    />
                  </label>
                  <label>
                    Your translation
                    <textarea
                      aria-label="Proposed translation"
                      value={proposed}
                      dir="auto"
                      maxLength={12000}
                      onChange={(e) => setProposed(e.target.value)}
                    />
                  </label>
                </div>
                <div className="mirror-controls">
                  <label>
                    Source language
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value as Language)}
                    >
                      {Object.values(packs).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="primary"
                    disabled={!original.trim() || !proposed.trim() || chat.busy}
                    onClick={() =>
                      void send(
                        "Check whether this translation changes the original meaning.",
                      )
                    }
                  >
                    Compare meaning
                  </button>
                </div>
              </section>
            )}
            {document && (
              <details className="document-chip">
                <summary>
                  <FileText size={16} />
                  {document.name}
                  <span>{document.pages.length} extracted sections</span>
                  <button
                    className="tool-icon"
                    aria-label="Remove document"
                    onClick={(e) => {
                      e.preventDefault();
                      setDocument(undefined);
                      if (task === "document") setTask("auto");
                    }}
                  >
                    <X size={15} />
                  </button>
                </summary>
                <small>
                  {document.truncated
                    ? "Partial extraction: first 30 pages / 24,000 characters. Answers may omit later content."
                    : "The extracted text is kept only in this conversation session."}{" "}
                  DOCX/TXT use section 1, not original page numbering.
                </small>
                <pre dir="auto">{document.pages[0]?.text.slice(0, 2000)}</pre>
              </details>
            )}
            {uploading && (
              <div className="document-chip" role="status">
                Extracting document text…
                <button onClick={cancelUpload}>Cancel</button>
              </div>
            )}
            {options && (
              <section className="chat-options">
                <div>
                  <label>
                    Task
                    <select
                      value={task}
                      onChange={(e) => {
                        setTask(e.target.value as Task);
                        if (e.target.value === "compare") setMirror(true);
                        if (e.target.value === "bridge") startBridge();
                      }}
                    >
                      {[
                        ["auto", "Automatic"],
                        ["chat", "Conversation"],
                        ["translate", "Translation"],
                        ["explain", "Explanation"],
                        ["simplify", "Simplify"],
                        ["compare", "Compare translations"],
                        ["terms", "Terminology"],
                        ["document", "Document"],
                        ["bridge", "Interpretation"],
                      ].map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Explanation
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as typeof level)}
                    >
                      <option value="simple">Simple</option>
                      <option value="standard">Standard</option>
                      <option value="detailed">Detailed</option>
                    </select>
                  </label>
                  <label>
                    Read-aloud language
                    <select
                      value={voiceLanguage}
                      onChange={(e) => {
                        voice.stop();
                        setVoiceLanguage(e.target.value as Language);
                      }}
                    >
                      {Object.values(packs).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Volume
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.volume}
                      onChange={(e) =>
                        update({ volume: Number(e.target.value) })
                      }
                    />
                  </label>
                </div>
                <div className="option-actions">
                  <button
                    disabled={!chat.messages.length}
                    onClick={() =>
                      download(
                        "bridgevoice-chat.json",
                        JSON.stringify(
                          {
                            exportedAt: new Date().toISOString(),
                            messages: chat.messages,
                          },
                          null,
                          2,
                        ),
                        "application/json",
                      )
                    }
                  >
                    <Download size={14} />
                    Export chat
                  </button>
                  <button onClick={newChat}>
                    <Trash2 size={14} />
                    Clear session
                  </button>
                  <small>
                    {voice.supported
                      ? "A matching read-aloud voice is available."
                      : "No matching read-aloud voice installed for this selection."}
                  </small>
                </div>
              </section>
            )}
            {voice.speaking && (
              <div className="speech-playback">
                <span>Reading aloud · browser voice</span>
                <button onClick={voice.togglePause}>
                  {voice.paused ? <Play size={14} /> : <Pause size={14} />}
                  {voice.paused ? "Resume" : "Pause"}
                </button>
                <button onClick={voice.stop}>
                  <Square size={14} />
                  Stop / mute
                </button>
              </div>
            )}
            {voice.error && <small role="alert">{voice.error}</small>}
            <div className="provider-row">
              <div className="provider-switch">
                <button
                  aria-pressed={provider === "offline"}
                  onClick={() => {
                    chat.stop();
                    chat.setError("");
                    setProvider("offline");
                    setPlaying(false);
                  }}
                >
                  {t.offline}
                </button>
                <button
                  aria-pressed={provider === "meta"}
                  onClick={() => {
                    chat.stop();
                    chat.setError("");
                    setProvider("meta");
                    setPlaying(false);
                  }}
                >
                  {t.live}
                </button>
              </div>
              <small>
                {provider === "offline"
                  ? "Local tools · no live AI"
                  : configured
                    ? "Key configured · connection verified only after a successful request"
                    : "Meta key needed · see Settings"}
              </small>
            </div>
            {provider === "meta" && (
              <label className="chat-consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (!e.target.checked) {
                      chat.stop();
                      setPlaying(false);
                    }
                  }}
                />
                I have permission to send this conversation and attached text to
                Meta. Provider terms apply.
              </label>
            )}
            <ChatComposer
              text={text}
              setText={setText}
              onSend={() => void send()}
              busy={chat.busy || uploading}
              onStop={() => {
                chat.stop();
                cancelUpload();
                setPlaying(false);
              }}
              onAttach={attach}
              listening={speech.listening}
              onMic={microphone}
              micSupported={speech.supported && source === "en"}
              uiLanguage={settings.uiLanguage}
              onBridge={() =>
                bridge
                  ? (setBridge(false), setTask("auto"), speech.stop())
                  : startBridge()
              }
              onMirror={() => {
                setMirror(!mirror);
                setBridge(false);
                speech.stop();
                setTask(mirror ? "auto" : "compare");
              }}
              onOptions={() => setOptions(!options)}
              interim={speech.interim}
            />
          </div>
        </div>
        <div className="chat-legal">
          <Link href="/privacy">Privacy</Link>
          <span>·</span>
          <Link href="/terms">Terms</Link>
          <span>·</span>
          <span>Every voice deserves to be understood.</span>
        </div>
      </main>
    </div>
  );
}
