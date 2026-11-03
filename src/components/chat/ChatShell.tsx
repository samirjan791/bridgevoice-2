"use client";
import { useChatViewport } from "@/lib/use-chat-viewport";
import { ChatOptions } from "./ChatOptions";
import { MeaningMirror } from "./MeaningMirror";
import { APP_NAME } from "@/lib/brand";
import { ChatTopbar } from "./ChatTopbar";
import { motionTiming, motionEase } from "@/lib/motion";
import ReactMarkdown from "react-markdown";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ShieldCheck,
  Languages,
  SlidersHorizontal,
  X,
  Pause,
  Square,
  Play,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { usePreferences } from "../providers";
import { ChatSidebar } from "./ChatSidebar";
import { RotatingWelcome } from "./RotatingWelcome";
import { ChatComposer } from "./ChatComposer";
import { MeaningReview } from "./MeaningCheck";
import { VoiceConversation } from "./VoiceConversation";
import { ChatMessage } from "./ChatMessage";
import { BridgeMode } from "./BridgeMode";
import { DemoPanel } from "./DemoPanel";
import { useConversation } from "@/lib/chat/use-conversation";
import { useSpeech } from "@/lib/use-speech";
import { speechLocale } from "@/lib/speech-capabilities";
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
import { readHistory, persistChat, removeChat, toggleChatPin } from "@/lib/chat/history";
import { readSaved, saveEntry, download } from "@/lib/storage";
import { demos } from "@/data/demos";
export function ChatShell({ demo = false }: { demo?: boolean }) {
  useChatViewport();
  const { settings, update, notify } = usePreferences(),
    t = ui[settings.uiLanguage],
    reduced = useReducedMotion();
  const documentInput=useRef<HTMLInputElement>(null);
  const [dismissedSuggestions,setDismissedSuggestions]=useState<string[]>([]);
  const chat = useConversation(notify);
  const provider = "meta" as const;
  const [speaker,setSpeaker]=useState<"Person A"|"Person B">("Person A");
  const [speakInterpretation,setSpeakInterpretation]=useState(false);
  const interpreted=useRef<string|undefined>(undefined);
  const [voiceOpen,setVoiceOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [text, setText] = useState(""),
    [sidebar, setSidebar] = useState(false),
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
    [uploadingName,setUploadingName] = useState(""),
    [photo, setPhoto] = useState<
      { name: string; dataUrl: string } | undefined
    >(),
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
  useEffect(()=>{
    const last=chat.messages.at(-1);
    if(!bridge||paused||!speakInterpretation||chat.busy||last?.role!=="assistant"||!last.result?.translation||interpreted.current===last.id)return;
    interpreted.current=last.id;
    if(voice.canSpeakLanguage(last.result.targetLanguage))void voice.speak(last.result.translation,last.result.targetLanguage);
    else notify("No matching output voice. Read the displayed translation instead.");
  },[chat.messages,chat.busy,bridge,paused,speakInterpretation,voice,notify]);
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
    setVoiceOpen(false);
    chat.reset();
    speech.stop();
    voice.stop();
    cancelUpload();
    setText("");
    setDocument(undefined);
    setPhoto(undefined);
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
  async function send(value = text, inputSource: Language = source) {
    const message =
      value.trim() || (photo ? "Please describe and analyze this photo." : document ? "Please summarize this document." : "");
    if (!message || chat.busy || uploading) return false;
    if (bridge && paused) {
      notify("Resume Bridge Mode before sending a segment.");
      return false;
    }
    const selectedLanguage = bridge?settings.target:(detectLanguage(message) || settings.target);
    if (!bridge && detectLanguage(message)) update({ target: selectedLanguage });
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
    const ok = await chat.send(
      {
        message,
        speaker: bridge?speaker:undefined,
        language: selectedLanguage,
        sourceLanguage: inputSource,
        task: bridge ? "bridge" : mirror ? "compare" : task,
        level: /simpler|shorter/i.test(message)
          ? "simple"
          : /explain more/i.test(message)
            ? "detailed"
            : level,
        original: mirror ? original : bridge ? message : "",
        proposed: mirror ? proposed : "",
        document,
        image: photo,
      },
      provider,
    );
    if (ok) {
      setText((current) => (current === value ? "" : current));
      setPhoto(undefined);
    }
    return ok;
  }
  const reviewMeaning: MeaningReview = (passage, answer, from, to) => {
    if (chat.busy) return;
    void chat.send({ message: "Review my explanation against the original. Identify possible changes in meaning, omissions, conditions and uncertainty. Do not give medical or legal advice. Suggest questions for the original speaker. Do not claim that a matching explanation is safe or certified.", original: passage, proposed: answer, sourceLanguage: from, language: to, task: "compare", level: "standard" }, "meta");
  };
  sendRef.current = send;
  async function attach(file: File) {
    if (/^image\/(jpeg|png|webp)$/.test(file.type)) {
      if (file.size > 2.5 * 1024 * 1024) {
        notify("Choose a JPG, PNG, or WebP photo under 2.5 MB.");
        return;
      }
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("Could not read photo"));
          reader.readAsDataURL(file);
        });
        setPhoto({ name: file.name.slice(0, 120), dataUrl });
        notify(
          "Photo attached. Send a question. Image analysis requires model vision support.",
        );
      } catch {
        notify("Could not attach this photo.");
      }
      return;
    }
    if (file.size > 4 * 1024 * 1024 || !/[.](pdf|docx|txt)$/i.test(file.name)) {
      notify("Choose a PDF, DOCX or TXT file under 4 MB.");
      return;
    }
    if (
      !window.confirm(
        "Extract this document on the " + APP_NAME + " server? It is not saved. When you send a message, its attached text is sent to Meta.",
      )
    )
      return;
    cancelUpload();
    const run = uploadGeneration.current;
    uploadAbort.current = new AbortController();
    setUploadingName(file.name);
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
    if (speech.listening) speech.finish();
    else if (
      window.confirm(
        "Start microphone input? Language recognition depends on your device and browser. Browser speech services may process audio externally. Obtain permission from everyone involved.",
      )
    )
      speech.start(speechLocale[source]);
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
  return (
    <>
    <div
      className={
        "chat-app" + (sidebarCollapsed ? " sidebar-collapsed" : "") +
        (!chat.messages.length && !bridge && !mirror && !demo
          ? " chat-empty"
          : "")
      }
      dir={packs[settings.uiLanguage].dir}
    >
      {voiceOpen && <VoiceConversation onTarget={l=>update({target:l})} onClose={() => {setVoiceOpen(false);chat.stop();}} onSend={send} onStop={chat.stop} busy={chat.busy} language={settings.target} volume={settings.volume} error={chat.error} live={provider === "meta"} canConverse={true} answer={(() => {const m=chat.messages.findLast(m=>m.role === "assistant");return m ? {id:m.id,text:m.result?.translation || m.content,language:m.result?.targetLanguage || settings.target} : undefined;})()} />}
      <ChatSidebar
        tools={<><button onClick={()=>{setMirror(!mirror);setBridge(false);setTask(mirror?"auto":"compare");setSidebar(false);}}><ShieldCheck size={18}/><span>Meaning Mirror</span></button><button onClick={()=>{startBridge();setSidebar(false);}}><Languages size={18}/><span>Interpret a conversation</span></button><button onClick={()=>{setOptions(!options);setSidebar(false);}}><SlidersHorizontal size={18}/><span>Response options</span></button></>}
        open={sidebar}
        onClose={() => setSidebar(false)}
        onNew={newChat}
        onCollapse={()=>setSidebarCollapsed(true)}
        onPin={chatId=>{try{toggleChatPin(chatId);setHistory(readHistory());}catch{notify("Could not save pin.");}}}
        history={history}
        historyEnabled={settings.history}
        language={settings.uiLanguage}
        onOpen={(c) => {
          chat.reset(c.messages);
          cancelUpload();
          setDocument(undefined);
          setPhoto(undefined);
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
      <main className="chat-main" id="main" inert={sidebar}>
        <ChatTopbar {...{setSidebar,sidebarCollapsed,setSidebarCollapsed,settings,update}} connection={chat.connection} />
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
                disabled={chat.busy}
              />
            )}
            {chat.messages.map((message, i) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduced || !settings.motion ? 0 : motionTiming.fast, ease: motionEase }}
              >
                <ChatMessage
                  message={message}
                  onMeaningReview={reviewMeaning}
                  busy={chat.busy}
                  canSpeak={voice.canSpeakLanguage(message.result?.targetLanguage || "en")}
                  onSpeak={(s, l) => {
                    setVoiceLanguage(l);
                    voice.speak(s, l);
                  }}
                  onFeedback={(v) => chat.feedback(message.id, v)}
                  onFollow={(s) => void send(s)}
                  onRetry={() => {
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
                    /* Edit is handled inline by ChatMessage. */
                  }}
                  onSaveEdit={(content) =>
                    chat.updateMessage(message.id, content)
                  }
                  onDelete={() => chat.deleteMessage(message.id)}
                />
              </motion.div>
            ))}
            {chat.busy && (
              <section className="streaming-message" aria-busy="true">
                <span className="sr-only" role="status">
                  {chat.draft ? "Writing response" : "Waiting for response"}
                </span>
                {chat.draft ? (
                  <>
                    <div className="markdown streaming-text" dir="auto">
                      <ReactMarkdown components={{ img: () => null }}>
                        {chat.draft}
                      </ReactMarkdown>
                    </div>
                    <small className="draft-note">
                      Draft · still generating
                    </small>
                  </>
                ) : (
                  <span className="thinking-dot" aria-hidden="true" />
                )}
              </section>
            )}
            {chat.error && (
              <div className="chat-error" role="alert">
                <p>{chat.error}</p>
                <button
                  disabled={chat.busy}
                  onClick={() => {
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
            {!chat.messages.length && !bridge && !mirror && <div className="plain-greeting"><RotatingWelcome language={settings.uiLanguage} animate={settings.motion && !reduced} paused={!!text}/></div>}
            {chat.messages.length>0&&<p className="chat-disclaimer">BridgeVoice can make mistakes. Check important meaning.</p>}

            {showJump && (
              <button
                className="jump-latest"
                onClick={() => {
                  stick.current = true;
                  bottom.current?.scrollIntoView?.({ behavior: reduced || !settings.motion ? "instant" : "smooth" });
                }}
              >
                <ArrowDown size={15} />
                Latest message
              </button>
            )}
            {bridge && (
              <><BridgeMode
                speaker={speaker}
                onSpeaker={p=>{if(p===speaker)return;speech.stop();voice.stop();chat.stop();setText("");setPaused(false);setSpeaker(p);const previous=source;setSource(settings.target);update({target:previous});}}
                source={source}
                target={settings.target}
                onSource={setSource}
                onTarget={(l) => update({ target: l })}
                listening={speech.listening}
                paused={paused}
                onPause={() => {
                  voice.stop();
                  setPaused(!paused);
                  speech.stop();
                  setPlaying(false);
                  chat.stop();
                }}
                onStop={() => {
                  voice.stop();
                  setPaused(true);
                  speech.stop();
                  chat.stop();
                  setPlaying(false);
                }}
                onReturn={() => {
                  voice.stop();
                  chat.stop();
                  setBridge(false);
                  setTask("auto");
                  setPaused(false);
                  speech.stop();
                }}
                onMic={microphone}
                micSupported={settings.dictation && speech.supported}
              /><label className="interpret-output"><input type="checkbox" checked={speakInterpretation} onChange={e=>{interpreted.current=chat.messages.at(-1)?.id;setSpeakInterpretation(e.target.checked);if(!e.target.checked)voice.stop();}}/>Speak new translations when a matching voice is available</label></>
            )}
            {mirror && <MeaningMirror {...{setMirror,setTask,original,setOriginal,proposed,setProposed,source,setSource,chat,send}} />}
            {options && <ChatOptions {...{task,setTask,setMirror,startBridge,level,setLevel,voiceLanguage,setVoiceLanguage,voice,settings,update,chat,newChat}} />}
            {(voice.speaking || voice.loading) && (
              <div className="speech-playback">
                <span>{voice.loading ? "Preparing audio…" : voice.label}</span>
                <button onClick={voice.togglePause} disabled={voice.loading}>
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
            <ChatComposer
              text={text}
              onVoice={() => {speech.stop();voice.stop();setPlaying(false);setVoiceOpen(true);}}
              setText={setText}
              onSend={() => void send()}
              busy={chat.busy || uploading}
              onStop={() => {
                chat.stop();
                cancelUpload();
                setPlaying(false);
              }}
              onAttach={attach}
              photoName={photo?.name}
              photoUrl={photo?.dataUrl}
              documentAttachment={document}
              onClearDocument={()=>{setDocument(undefined);if(task==="document")setTask("auto");}}
              uploadingName={uploading?uploadingName:undefined}
              onCancelUpload={cancelUpload}
              onClearPhoto={() => setPhoto(undefined)}
              listening={speech.listening}
              onMic={microphone}
              micSupported={settings.dictation && speech.supported}
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
            {!chat.messages.length && !bridge && !mirror && <div className="suggestion-rows">{[
              {id:"translate",label:t.translate,action:()=>void send("Translate into Pashto: Please bring your passport to your appointment tomorrow at 9 AM. Keep the time and document name accurate.", "en")},
              {id:"explain",label:t.understand,action:()=>void send("Explain the term deductible in health insurance using simple English and one concrete example with a $500 deductible. Explain how it differs from a copay.", "en")},
              {id:"document",label:"Upload a document",action:()=>documentInput.current?.click()},
            ].filter(s=>!dismissedSuggestions.includes(s.id)).map(s=><div key={s.id}><button onClick={s.action}>{s.label}</button><button aria-label={"Dismiss "+s.label} onClick={()=>setDismissedSuggestions([...dismissedSuggestions,s.id])}><X size={15}/></button></div>)}</div>}
            <input ref={documentInput} type="file" hidden accept=".pdf,.docx,.txt" aria-label="Suggestion document upload" onChange={e=>{const file=e.target.files?.[0];if(file)void attach(file);e.target.value="";}}/>

          </div>
        </div>
      </main>
    </div>
    </>
  );
}
