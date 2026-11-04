"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePreferences } from "@/components/providers";
import "./agent.css";
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, Send } from "lucide-react";
import { extractWebsites, stripCodeBlocks } from "@/lib/website";
import { WebsitePreview } from "@/components/chat/WebsitePreview";
import { matchGlossary } from "@/lib/glossary";
import { detectLanguage } from "@/lib/chat/router";
import { captureClientTime, describeLocalDate, greetingForHour } from "@/lib/chat/time";
import type { Language } from "@/lib/languages";

type SpeechResultItem = { transcript: string };
type SpeechResultEntry = ArrayLike<SpeechResultItem> & { isFinal?: boolean };
type SpeechEvent = { results: ArrayLike<SpeechResultEntry>; resultIndex: number };
type Recognition = { lang: string; continuous: boolean; interimResults: boolean; onresult: ((e: SpeechEvent) => void) | null; onerror: ((e: { error: string }) => void) | null; onend: (() => void) | null; start: () => void; stop: () => void };
type SpeechWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
type Line = { role: "user" | "agent"; text: string };
type Status = "idle" | "listening" | "thinking" | "speaking";
const choices = [{ id: "en", label: "English", speech: "en-US" }, { id: "es-US", label: "Spanish", speech: "es-US" }, { id: "ps", label: "Pashto (device support required)", speech: "ps-AF" }, { id: "fa-AF", label: "Dari (device support required)", speech: "fa-AF" }] as const;
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF\s]/g, " ").replace(/\s+/g, " ").trim();
const LANG_LABELS = { en: "English", "es-US": "Spanish", ps: "Pashto", "fa-AF": "Dari" } as const;
const isImageRequest = (text: string) => /\b(draw|generate|create|make|design)\b[\s\S]{0,80}\b(image|picture|photo|illustration)\b/i.test(text);
const SUGGESTIONS = [
  { label: "Analyze a document", message: "Help me analyze a document" },
  { label: "Plan my day", message: "Help me plan my day" },
  { label: "Create a project", message: "Help me create a project plan" },
  { label: "Analyze data", message: "Help me analyze some data" },
] as const;
const USERNAME_KEY = "bridgevoice.userName.v1", NAME_ASKED_KEY = "bridgevoice.nameAsked.v1";
const NAME_VERB_START = new Set(["help", "plan", "analyze", "create", "make", "translate", "explain", "what", "how", "why", "when", "where", "write", "show", "tell", "give", "do", "can", "please", "hi", "hello", "hey"]);
const parseName = (raw: string): string | null => {
  let text = raw.trim().toLowerCase();
  for (const prefix of ["call me", "my name is", "i\'m", "i am", "just"]) {
    if (text.startsWith(prefix + " ")) text = text.slice(prefix.length).trim();
  }
  if (!text || text.length > 40) return null;
  const words = text.split(/\s+/);
  if (words.length < 1 || words.length > 3) return null;
  if (!/^[a-z\u0600-\u06FF\' \-]+$/.test(text)) return null;
  if (NAME_VERB_START.has(words[0])) return null;
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

export default function AgentPage() {
  const { settings, update } = usePreferences();
  const [active, setActive] = useState(false), [listening, setListening] = useState(false), [busy, setBusy] = useState(false), [speaking, setSpeaking] = useState(false), [muted, setMuted] = useState(false);
  const [language, setLanguage] = useState<(typeof choices)[number]["id"]>("en"), [name, setName] = useState("Boss"), [userName, setUserName] = useState<string | null>(null), [input, setInput] = useState(""), [lines, setLines] = useState<Line[]>([]), [interim, setInterim] = useState(""), [error, setError] = useState(""), [greeting, setGreeting] = useState("Good to see you");
  const recognition = useRef<Recognition | null>(null), controller = useRef<AbortController | null>(null);
  const awaitingNameRef = useRef(false);
  const activeRef = useRef(false), busyRef = useRef(false), mutedRef = useRef(false), speakingRef = useRef(false), langRef = useRef(language);
  const history = useRef<Line[]>([]), voiceEpoch = useRef(0), sendRef = useRef<(text: string) => void>(() => {});
  const speechQueue = useRef<string[]>([]), currentChunk = useRef("");

  useEffect(() => { setName(settings.agentTitle); const l = settings.agentLanguage || settings.target; setLanguage(l); langRef.current = l; }, [settings.agentTitle, settings.agentLanguage, settings.target]);
  useEffect(() => { try { const saved = localStorage.getItem(USERNAME_KEY); if (saved) setUserName(saved.slice(0, 40)); } catch { /* private mode */ } }, []);
  // Time-of-day greeting from the device clock, set after mount so the
  // server and first client render match (no hydration mismatch).
  useEffect(() => { setGreeting(greetingForHour(new Date().getHours())); }, []);
  const displayName = (() => { const t = name.trim(); return t && t !== "Boss" ? t : (userName || "Boss"); })();
  const maybeAsk = (mode: "voice" | "text"): boolean => {
    if (userName) return false;
    if (name.trim() !== "" && name.trim() !== "Boss") return false;
    try { if (localStorage.getItem(NAME_ASKED_KEY)) return false; } catch { /* private mode */ }
    try { localStorage.setItem(NAME_ASKED_KEY, "1"); } catch { /* private mode */ }
    awaitingNameRef.current = true;
    if (mode === "voice") speak("What do you want me to call you?");
    else { history.current = [...history.current, { role: "agent", text: "What do you want me to call you?" }]; setLines([...history.current]); }
    return true;
  };
  const stopSpeech = useCallback(() => {
    speechQueue.current = []; currentChunk.current = ""; speakingRef.current = false; setSpeaking(false);
    try { window.speechSynthesis?.cancel(); } catch { /* no synthesis */ }
  }, []);
  const playNext = useCallback(() => {
    if (!activeRef.current || mutedRef.current || speechQueue.current.length === 0) { speakingRef.current = false; setSpeaking(false); return; }
    if (typeof window === "undefined" || !window.speechSynthesis) { speakingRef.current = false; setSpeaking(false); return; }
    const chunk = speechQueue.current.shift()!; currentChunk.current = chunk; speakingRef.current = true; setSpeaking(true);
    const u = new SpeechSynthesisUtterance(chunk);
    u.lang = choices.find((x) => x.id === langRef.current)?.speech || "en-US"; u.rate = settings.speechRate; u.volume = settings.volume;
    const installed = window.speechSynthesis.getVoices();
    const target = langRef.current;
    const permitted = installed.filter(v => target !== "fa-AF" || settings.allowPersian || ["fa-af","prs","prs-af"].includes(v.lang.toLowerCase()));
    const chosen = permitted.find(v => v.voiceURI === settings.preferredVoices[target]) || permitted.find(v => target === "fa-AF" ? (["fa-af","prs","prs-af"].includes(v.lang.toLowerCase()) || (settings.allowPersian && v.lang.toLowerCase() === "fa-ir")) : v.lang.toLowerCase().startsWith(u.lang.toLowerCase().split("-")[0]));
    if (chosen) { u.voice = chosen; u.lang = chosen.lang; }
    else if (target === "fa-AF") { setError("No permitted Dari voice is installed. Speech skipped; text remains available."); speakingRef.current=false;setSpeaking(false);return; }
    u.onend = () => { currentChunk.current = ""; playNext(); };
    u.onerror = () => { currentChunk.current = ""; playNext(); };
    window.speechSynthesis.speak(u);
  }, [settings.speechRate, settings.volume, settings.preferredVoices, settings.allowPersian]);
  const speak = useCallback((text: string) => {
    if (mutedRef.current || !activeRef.current) return;
    stopSpeech();
    const stripped = stripCodeBlocks(text);
    const clean = (stripped ? stripped : "Your website is ready below.").slice(0, 3000);
    const parts = clean.match(/[^.!?]+[.!?]+["')\]]*\s*/g) || [clean];
    const chunks: string[] = [];
    for (const p of parts) {
      const piece = p.trim(); if (!piece) continue;
      const last = chunks[chunks.length - 1];
      if (last && (last.length + piece.length + 1) <= 900) chunks[chunks.length - 1] = `${last} ${piece}`;
      else chunks.push(piece.slice(0, 900));
    }
    speechQueue.current = chunks.length ? chunks : [clean];
    playNext();
  }, [playNext, stopSpeech]);

  const stopRecognition = useCallback(() => {
    voiceEpoch.current++;
    const r = recognition.current; recognition.current = null;
    if (r) { r.onend = null; r.onresult = null; r.onerror = null; try { r.stop(); } catch { /* already stopped */ } }
    setListening(false);
  }, []);
  const listen = useCallback(() => {
    if (!activeRef.current || recognition.current) return;
    const W = window as SpeechWindow;
    const R = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!R) { setError("Speech recognition is not available in this browser. You can still type below and hear replies where speech synthesis is supported."); return; }
    const epoch = ++voiceEpoch.current;
    const r = new R(); recognition.current = r;
    r.lang = choices.find((x) => x.id === langRef.current)?.speech || "en-US";
    r.continuous = true; r.interimResults = true;
    r.onresult = (e) => {
      let final = "", heard = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i]; const text = result[0]?.transcript || "";
        if (result.isFinal) final += text; else heard += text;
      }
      if (heard.trim()) setInterim(heard.trim());
      const message = final.trim();
      if (!message) return;
      setInterim("");
      // Ignore the agent's own voice echoing back through the microphone.
      if (speakingRef.current && currentChunk.current) {
        const said = norm(currentChunk.current), got = norm(message);
        if (got.length > 10 && (said.includes(got) || got.includes(said))) return;
      }
      sendRef.current(message);
    };
    r.onerror = (e) => {
      if (epoch !== voiceEpoch.current) return;
      if (e.error === "not-allowed" || e.error === "service-not-allowed") setError("Microphone permission was denied. Allow the microphone for this site, then press Start listening again.");
      else if (e.error === "audio-capture") setError("No microphone was found. You can still type below.");
      else if (e.error !== "aborted") setError(`Microphone: ${e.error}. Check permissions and language support.`);
    };
    r.onend = () => {
      if (epoch !== voiceEpoch.current) return;
      recognition.current = null; setListening(false);
      if (activeRef.current) window.setTimeout(() => { if (activeRef.current) listen(); }, 300);
    };
    try { r.start(); setListening(true); setError(""); } catch { recognition.current = null; setError("Unable to start the microphone. Check browser permissions."); }
  }, []);
  const stop = useCallback(() => {
    activeRef.current = false; setActive(false); awaitingNameRef.current = false;
    stopRecognition(); controller.current?.abort(); controller.current = null;
    busyRef.current = false; setBusy(false); stopSpeech(); setInterim("");
  }, [stopRecognition, stopSpeech]);
  useEffect(() => () => {
    activeRef.current = false; recognition.current?.stop(); controller.current?.abort();
    try { window.speechSynthesis?.cancel(); } catch { /* noop */ }
  }, []);

  const send = useCallback(async (text: string) => {
    const message = text.trim();
    if (!message || !activeRef.current) return;
    let askedThisSend = false;
    if (awaitingNameRef.current) {
      awaitingNameRef.current = false;
      const parsed = parseName(message);
      if (parsed) {
        try { localStorage.setItem(USERNAME_KEY, parsed); localStorage.setItem(NAME_ASKED_KEY, "1"); } catch { /* private mode */ }
        setUserName(parsed);
        const confirm = `Nice to meet you, ${parsed}.`;
        history.current = [...history.current, { role: "user", text: message }, { role: "agent", text: confirm }]; setLines([...history.current]);
        setInput(""); stopSpeech(); speak(confirm);
        return;
      }
    } else if (history.current.length === 0) {
      askedThisSend = maybeAsk("text");
    }
    controller.current?.abort(); stopSpeech();
    const abort = new AbortController(); controller.current = abort;
    busyRef.current = true; setBusy(true); setError(""); setInput("");
    const previous = history.current.slice(-10);
    history.current = [...history.current, { role: "user", text: message }]; setLines([...history.current]);
    const switched = detectLanguage(message);
    if (switched && switched !== langRef.current) {
      changeLanguage(switched);
      const notice = `Switching to ${LANG_LABELS[switched]}.`;
      history.current = [...history.current, { role: "agent", text: notice }]; setLines([...history.current]);
      speak(notice);
      busyRef.current = false; setBusy(false);
      return;
    }
    if (isImageRequest(message)) {
      const notice = "Image generation is not connected yet. No picture has been generated.";
      history.current = [...history.current, { role: "agent", text: notice }]; setLines([...history.current]);
      speak(notice);
      busyRef.current = false; setBusy(false);
      return;
    }
    try {
      const timeNote = describeLocalDate(new Date());
      const identity = `You are BridgeAgent Live, the helpful AI assistant inside BridgeVoice. The person speaking is the owner of this workspace and prefers to be addressed as ${displayName.slice(0, 60)}. Treat this as a conversational preference, not authentication or authorization. Keep spoken replies short and natural, like a live voice conversation. Never claim to have used tools or performed actions you did not actually perform. You can explain and plan tasks, and when the user asks for a website, build it: write one short spoken sentence, then the complete single-file HTML document in one fenced html code block. That block is how this interface delivers websites — the page shows a live preview with download — never describe the site instead of building it. Keep the file compact and self-contained, with inline CSS and scripts and no external files. This voice interface has no other code execution or external action tools.${timeNote ? ` The user's local time right now is ${timeNote}. If asked about the time, the day, or the time of day, answer from it.` : ""} Answer the user's next request.`;
      const glossaryMatches = matchGlossary(message, langRef.current as Language);
      const glossaryNote = glossaryMatches.length ? `\n\nRelevant glossary terms (unreviewed drafts \u2014 verify before relying on them): ${glossaryMatches.slice(0, 6).map((e) => { const t = (e as unknown as Record<string, string | undefined>)[langRef.current]; return t && t !== e.en ? `${e.en} (${t})` : e.en; }).join("; ")}` : "";
      let access = "";
      try { access = sessionStorage.getItem("bridgevoice.access") || ""; } catch { /* private mode */ }
      const response = await fetch("/api/chat", {
        method: "POST", signal: abort.signal,
        headers: { "Content-Type": "application/json", "x-bridgevoice-access": access },
        body: JSON.stringify({ message: `${identity}\n\nUser request: ${message}${glossaryNote}`, messages: previous.map((x) => ({ role: x.role === "agent" ? "assistant" : "user", content: x.text })), language: langRef.current, sourceLanguage: langRef.current, task: "chat", level: "standard", clientTime: captureClientTime() }),
      });
      if (response.status === 401) throw new Error("This deployment needs its access code. Enter it in Settings, then come back here.");
      if (!response.ok) throw new Error(`AI service unavailable (${response.status})`);
      if (!response.body) throw new Error("No response stream");
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = "", answer = "";
      while (true) {
        const chunk = await reader.read(); if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });
        const events = buffer.split("\n\n"); buffer = events.pop() || "";
        for (const event of events) {
          const dataLine = event.split("\n").find((x) => x.startsWith("data: ")); if (!dataLine) continue;
          const data = JSON.parse(dataLine.slice(6));
          if (data.type === "result") answer = data.result?.answer || data.result?.translation || "";
          if (data.type === "error") throw new Error(data.error || "Agent response failed");
        }
      }
      if (!answer) throw new Error("No completed response received");
      if (abort.signal.aborted) return;
      history.current = [...history.current, { role: "agent", text: answer }]; setLines([...history.current]);
      speak(askedThisSend ? `What do you want me to call you? ${answer}` : answer);
    } catch (e) {
      if (!abort.signal.aborted) setError(e instanceof Error ? e.message : "Unable to respond");
    } finally {
      if (controller.current === abort) { busyRef.current = false; setBusy(false); controller.current = null; }
    }
  }, [name, userName, speak, stopSpeech]);
  sendRef.current = send;

  const beginTyped = () => {
    activeRef.current = true; setActive(true); setError(""); setInterim("");
  };
  const sendSuggestion = (text: string) => { beginTyped(); sendRef.current(text); };
  const begin = () => {
    activeRef.current = true; setActive(true); setError(""); setInterim("");
    listen();
    if (maybeAsk("voice")) return;
    speak(`${greetingForHour(new Date().getHours())}, ${displayName}. I'm listening. Just speak, and I'll answer right away.`);
  };
  const toggleMute = () => {
    mutedRef.current = !mutedRef.current; setMuted(mutedRef.current);
    if (mutedRef.current) stopSpeech();
  };
  const changeLanguage = (next: typeof language) => {
    update({agentLanguage: next});
    langRef.current = next; setLanguage(next);
    if (activeRef.current) { stopRecognition(); window.setTimeout(() => { if (activeRef.current) listen(); }, 150); }
  };

  const status: Status = !active ? "idle" : speaking ? "speaking" : busy ? "thinking" : "listening";
  const statusText = status === "idle" ? "Ready" : status === "listening" ? "Listening…" : status === "thinking" ? "Thinking…" : "Speaking…";
  const needsCode = error.includes("access code");
  return (
    <main className={`agent-page agent-chatbox${active ? " voice-mode" : ""}`}>
      <div className="agent-top"><Link className="agent-brand" href="/app">⌁ <strong>Bridge<span>Voice</span></strong></Link><div className="agent-toplinks"><Link href="/app">Chat</Link><Link href="/settings#live">Settings</Link></div></div>
      <div className="agent-main agent-chat-column">
        {!active && (<><header className="agent-heading"><h2 className="agent-eyebrow" aria-label="BridgeAgent Live">✦ BRIDGEAGENT LIVE</h2><h1>{greeting}, {displayName}.</h1><p>Your AI agent — talk naturally, get answers.</p></header>
        
        </>)}
        <section className={`agent-voicebar ${active ? "is-active" : "is-idle"}`}><div aria-label="Agent status" className={`agent-orb ${settings.orbAnimation && active ? "agent-orb-active" : ""} ${status}`}><Mic size={24}/></div><div className="agent-voicebar-text"><h2 className="agent-state">{statusText}</h2><p className="agent-hint">{active ? "I'm listening. You can speak over me to interrupt." : "Tap Start listening to begin. No wake word or background listening."}</p>{interim && settings.showTranscript && <p role="status" className="agent-interim">Hearing: {interim}</p>}</div>
          <div className="agent-actions">{!active ? <button className="agent-start" onClick={begin}><Mic size={19}/> Start listening</button> : <><button className="agent-circle agent-end" onClick={stop} aria-label="End session"><PhoneOff/></button><button className="agent-circle" onClick={toggleMute} aria-label={muted?"Unmute speaker":"Mute speaker"}>{muted?<VolumeX/>:<Volume2/>}</button><button className="agent-circle" onClick={()=>{stopRecognition();window.setTimeout(()=>{if(activeRef.current)listen();},150);}} aria-label={listening?"Restart listening":"Start listening"}>{listening?<Mic/>:<MicOff/>}</button></>}</div>
        </section>
        {!active && lines.length === 0 && (<div className="agent-chips" aria-label="Suggestions">{SUGGESTIONS.map((s) => (<button key={s.label} type="button" className="agent-chip" onClick={() => sendSuggestion(s.message)}>{s.label}</button>))}</div>)}
        {error && <div className="agent-error" role="alert">{error} {needsCode && <Link href="/settings#meta">Open access settings</Link>}</div>}
        {settings.showTranscript && <section className={`agent-transcript ${settings.transcriptLarge?"agent-transcript-large":""}`} aria-label="Conversation transcript"><h2>Conversation</h2>{lines.length===0?<p className="agent-muted">Your conversation appears here. It is not saved to browser storage.</p>:lines.map((line,i)=>{ const shown = line.role==="agent" ? extractWebsites(line.text) : { text: line.text, sites: [] as string[] }; return (<div className={`agent-message ${line.role === "agent" ? "agent-line" : "user-line"}`} key={i}><strong>{line.role==="agent"?"BridgeAgent":"You"}</strong><p>{shown.text}</p>{shown.sites.map((html,j)=>(<WebsitePreview key={j} html={html} index={j} />))}</div>); })}</section>}
        {active && (<form className="agent-compose" onSubmit={e=>{e.preventDefault();send(input);}}><input value={input} onChange={e=>setInput(e.target.value)} disabled={!active||busy} placeholder="Type a message instead…" aria-label="Message to agent"/><button disabled={!active||busy||!input.trim()} aria-label="Send"><Send size={19}/></button></form>)}
        <p className="agent-disclaimer">Browser speech availability varies by device and language. Translations are not professionally verified. No real telephone connection or external actions are included — it talks and answers, and it can draft single-file website samples you can preview and download; it does not publish sites, call anyone, or take other external actions. This deployment needs its access code for AI replies: enter it once per tab in Settings.</p>
      </div>
    </main>
  );
}
