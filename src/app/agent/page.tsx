"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, Send } from "lucide-react";

type SpeechResultItem = { transcript: string };
type SpeechResultEntry = ArrayLike<SpeechResultItem> & { isFinal?: boolean };
type SpeechEvent = { results: ArrayLike<SpeechResultEntry>; resultIndex: number };
type Recognition = { lang: string; continuous: boolean; interimResults: boolean; onresult: ((e: SpeechEvent) => void) | null; onerror: ((e: { error: string }) => void) | null; onend: (() => void) | null; start: () => void; stop: () => void };
type SpeechWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
type Line = { role: "user" | "agent"; text: string };
type Status = "idle" | "listening" | "thinking" | "speaking";
const choices = [{ id: "en", label: "English", speech: "en-US" }, { id: "es-US", label: "Spanish", speech: "es-US" }, { id: "ps", label: "Pashto (device support required)", speech: "ps-AF" }, { id: "fa-AF", label: "Dari (device support required)", speech: "fa-AF" }] as const;
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF\s]/g, " ").replace(/\s+/g, " ").trim();

export default function AgentPage() {
  const [active, setActive] = useState(false), [listening, setListening] = useState(false), [busy, setBusy] = useState(false), [speaking, setSpeaking] = useState(false), [muted, setMuted] = useState(false);
  const [language, setLanguage] = useState<(typeof choices)[number]["id"]>("en"), [name, setName] = useState("Boss"), [input, setInput] = useState(""), [lines, setLines] = useState<Line[]>([]), [interim, setInterim] = useState(""), [error, setError] = useState("");
  const recognition = useRef<Recognition | null>(null), controller = useRef<AbortController | null>(null);
  const activeRef = useRef(false), busyRef = useRef(false), mutedRef = useRef(false), speakingRef = useRef(false), langRef = useRef(language);
  const history = useRef<Line[]>([]), voiceEpoch = useRef(0), sendRef = useRef<(text: string) => void>(() => {});
  const speechQueue = useRef<string[]>([]), currentChunk = useRef("");

  const stopSpeech = useCallback(() => {
    speechQueue.current = []; currentChunk.current = ""; speakingRef.current = false; setSpeaking(false);
    try { window.speechSynthesis?.cancel(); } catch { /* no synthesis */ }
  }, []);
  const playNext = useCallback(() => {
    if (!activeRef.current || mutedRef.current || speechQueue.current.length === 0) { speakingRef.current = false; setSpeaking(false); return; }
    if (typeof window === "undefined" || !window.speechSynthesis) { speakingRef.current = false; setSpeaking(false); return; }
    const chunk = speechQueue.current.shift()!; currentChunk.current = chunk; speakingRef.current = true; setSpeaking(true);
    const u = new SpeechSynthesisUtterance(chunk);
    u.lang = choices.find((x) => x.id === langRef.current)?.speech || "en-US"; u.rate = 1;
    u.onend = () => { currentChunk.current = ""; playNext(); };
    u.onerror = () => { currentChunk.current = ""; playNext(); };
    window.speechSynthesis.speak(u);
  }, []);
  const speak = useCallback((text: string) => {
    if (mutedRef.current || !activeRef.current) return;
    stopSpeech();
    const clean = text.slice(0, 3000);
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
    activeRef.current = false; setActive(false);
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
    controller.current?.abort(); stopSpeech();
    const abort = new AbortController(); controller.current = abort;
    busyRef.current = true; setBusy(true); setError(""); setInput("");
    const previous = history.current.slice(-10);
    history.current = [...history.current, { role: "user", text: message }]; setLines([...history.current]);
    try {
      const identity = `You are BridgeAgent Live, the helpful AI assistant inside BridgeVoice. The person speaking is the owner of this workspace and prefers to be addressed as ${name.trim().slice(0, 60) || "Boss"}. Treat this as a conversational preference, not authentication or authorization. Keep spoken replies short and natural, like a live voice conversation. Never claim to have used tools or performed actions you did not actually perform. You can explain and plan tasks but this voice interface has no code execution or external action tools. Answer the user's next request.`;
      let access = "";
      try { access = sessionStorage.getItem("bridgevoice.access") || ""; } catch { /* private mode */ }
      const response = await fetch("/api/chat", {
        method: "POST", signal: abort.signal,
        headers: { "Content-Type": "application/json", "x-bridgevoice-access": access },
        body: JSON.stringify({ message: `${identity}\n\nUser request: ${message}`, messages: previous.map((x) => ({ role: x.role === "agent" ? "assistant" : "user", content: x.text })), language: langRef.current, sourceLanguage: langRef.current, task: "chat", level: "standard" }),
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
      speak(answer);
    } catch (e) {
      if (!abort.signal.aborted) setError(e instanceof Error ? e.message : "Unable to respond");
    } finally {
      if (controller.current === abort) { busyRef.current = false; setBusy(false); controller.current = null; }
    }
  }, [name, speak, stopSpeech]);
  sendRef.current = send;

  const begin = () => {
    activeRef.current = true; setActive(true); setError(""); setLines([]); history.current = []; setInterim("");
    listen();
    speak(`Hello ${name.trim() || "Boss"}. I'm listening. Just speak, and I'll answer right away.`);
  };
  const toggleMute = () => {
    mutedRef.current = !mutedRef.current; setMuted(mutedRef.current);
    if (mutedRef.current) stopSpeech();
  };
  const changeLanguage = (next: typeof language) => {
    langRef.current = next; setLanguage(next);
    if (activeRef.current) { stopRecognition(); window.setTimeout(() => { if (activeRef.current) listen(); }, 150); }
  };

  const status: Status = !active ? "idle" : speaking ? "speaking" : busy ? "thinking" : "listening";
  const statusText = status === "idle" ? "Ready" : status === "listening" ? "Listening…" : status === "thinking" ? "Thinking…" : "Speaking…";
  const needsCode = error.includes("access code");
  return (
    <main style={{ minHeight: "100dvh", background: "radial-gradient(ellipse at 50% 0%, #0b2a6b 0%, #04070f 55%, #02040a 100%)", color: "#eef3ff", padding: "24px 16px 60px" }}>
      <style>{`
        .bv-orb{width:170px;height:170px;border-radius:50%;margin:0 auto 22px;position:relative;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%, #7fb0ff, #2f5fd0 45%, #0a1c4d 75%, #050d26);box-shadow:0 0 45px #2f6bff88, inset 0 0 35px #9cc2ff66;animation:bv-pulse 3.2s ease-in-out infinite}
        .bv-orb.listening{animation:bv-pulse 1.4s ease-in-out infinite;box-shadow:0 0 70px #3d7bffaa, inset 0 0 40px #bcd6ff88}
        .bv-orb.speaking{animation:bv-ripple 1.1s ease-out infinite}
        .bv-orb.thinking{animation:bv-spin 1.6s linear infinite}
        .bv-orb::before,.bv-orb::after{content:"";position:absolute;inset:-14px;border-radius:50%;border:2px solid #4d84ff55}
        .bv-orb.listening::before{animation:bv-ring 1.8s ease-out infinite}
        .bv-orb.speaking::after{animation:bv-ring 1.1s ease-out infinite}
        @keyframes bv-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
        @keyframes bv-ripple{0%{transform:scale(1)}50%{transform:scale(1.12)}100%{transform:scale(1)}}
        @keyframes bv-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes bv-ring{from{transform:scale(0.9);opacity:0.9}to{transform:scale(1.35);opacity:0}}
      `}</style>
      <div style={{ maxWidth: 760, margin: "auto" }}>
        <Link href="/app" style={{ color: "#a7bfff" }}>← Back to BridgeVoice</Link>
        <header style={{ textAlign: "center", marginTop: 18 }}>
          <h1 style={{ fontSize: 30, fontWeight: 700 }}>BridgeAgent Live</h1>
          <p style={{ color: "#aeb8d0" }}>Speak, and it talks back — a live voice screen, no phone number required</p>
        </header>
        <section style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
          <label style={{ flex: "1 1 180px" }}>How should I address you?<input aria-label="Preferred title" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} disabled={active} style={{ display: "block", width: "100%", padding: 11, marginTop: 5, borderRadius: 10, background: "#141c30", color: "white", border: "1px solid #3d4c74" }} /></label>
          <label style={{ flex: "1 1 180px" }}>Conversation language<select aria-label="Conversation language" value={language} onChange={(e) => changeLanguage(e.target.value as typeof language)} style={{ display: "block", width: "100%", padding: 11, marginTop: 5, borderRadius: 10, background: "#141c30", color: "white", border: "1px solid #3d4c74" }}>{choices.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
        </section>
        <section style={{ textAlign: "center", padding: "34px 8px 10px" }}>
          <div aria-label="Agent status" className={`bv-orb ${active ? status : ""}`}><Mic size={58} color="#eaf1ff" /></div>
          <h2 style={{ fontSize: 24 }}>{statusText}</h2>
          <p style={{ color: "#aeb8d0", marginTop: 8 }}>{active ? "Just speak — it answers by itself. Speak over it any time to interrupt." : "One tap starts the microphone. After that it keeps listening and answers on its own."}</p>
          {interim && <p style={{ color: "#9ab9ff", marginTop: 10 }}>Hearing: {interim}</p>}
          <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 22, flexWrap: "wrap" }}>
            {!active
              ? <button onClick={begin} style={buttonStyle("#316be4")}>Start listening</button>
              : <>
                  <button onClick={stop} aria-label="End session" style={buttonStyle("#b93245")}><PhoneOff /> End session</button>
                  <button onClick={toggleMute} aria-label={muted ? "Unmute speaker" : "Mute speaker"} style={buttonStyle("#34415c")}>{muted ? <VolumeX /> : <Volume2 />}</button>
                  <button onClick={() => { stopRecognition(); window.setTimeout(() => { if (activeRef.current) listen(); }, 150); }} aria-label={listening ? "Listening on" : "Restart listening"} style={buttonStyle("#34415c")}>{listening ? <Mic /> : <MicOff />}</button>
                </>}
          </div>
        </section>
        {error && <div role="alert" style={{ padding: 12, background: "#53212b", borderRadius: 10, marginTop: 16 }}><p>{error}</p>{needsCode && <p style={{ marginTop: 8 }}><Link href="/settings" style={{ color: "#a7bfff" }}>Open Settings to enter the access code →</Link></p>}</div>}
        <section aria-label="Conversation transcript" style={{ minHeight: 140, maxHeight: 400, overflowY: "auto", background: "#0d1526", padding: 16, borderRadius: 16, marginTop: 18 }}>
          {lines.length === 0
            ? <p style={{ color: "#aeb8d0" }}>Your conversation will appear here. This session is not saved to browser storage.</p>
            : lines.map((line, i) => <p key={i} style={{ marginBottom: 14, lineHeight: 1.6, overflowWrap: "anywhere" }}><strong style={{ color: line.role === "agent" ? "#9ab9ff" : "#e5e7eb" }}>{line.role === "agent" ? "BridgeAgent" : "You"}: </strong>{line.text}</p>)}
        </section>
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} disabled={!active || busy} placeholder="Type instead…" aria-label="Message to agent" style={{ flex: 1, minWidth: 0, padding: 14, borderRadius: 16, border: "1px solid #3d4c74", background: "#141c30", color: "white" }} />
          <button disabled={!active || busy || !input.trim()} aria-label="Send" style={buttonStyle("#316be4")}><Send /></button>
        </form>
        <p style={{ color: "#aeb8d0", fontSize: 12, marginTop: 20 }}>Voice recognition and read-aloud depend on your browser and installed language support. The agent calls you “Boss” as a preference; this does not grant special permissions. No real telephone connection or external actions are included — it talks and answers, it does not build software or call anyone. This deployment needs its access code for AI replies: enter it once per tab in Settings.</p>
      </div>
    </main>
  );
}
function buttonStyle(background: string): React.CSSProperties {
  return { background, color: "white", border: 0, borderRadius: 30, padding: "13px 20px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 48 };
}
