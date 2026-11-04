"use client";
import { useEffect, useRef, useState } from "react";
import {
  ChatMessage,
  ChatRequest,
  ChatResult,
  chatResultSchema,
} from "./schema";
import { boundedContext } from "./router";
import { captureClientTime } from "./time";
import { sseData } from "./sse";
export function useConversation(notify: (s: string) => void) {
  const [messages, setMessages] = useState<ChatMessage[]>([]),
    [busy, setBusy] = useState(false),
    [draft, setDraft] = useState(""),
    [error, setError] = useState(""),
    [connection, setConnection] = useState("Not verified");
  const abort = useRef<AbortController | null>(null),
    generation = useRef(0),
    inFlight = useRef(false),
    last = useRef<{
      request: ChatRequest;
      base: ChatMessage[];
      provider: "meta";
    } | null>(null);
  useEffect(
    () => () => {
      abort.current?.abort();
    },
    [],
  );
  function stop() {
    generation.current++;
    abort.current?.abort();
    inFlight.current = false;
    setBusy(false);
    setDraft("");
    setConnection((c) => (c === "Connecting" ? "Not verified" : c));
  }
  function reset(next: ChatMessage[] = []) {
    stop();
    setMessages(next);
    setError("");
    last.current = null;
  }
  async function send(
    input: Omit<ChatRequest, "messages">,
    provider: "meta",
    override?: ChatMessage[],
  ) {
    if (inFlight.current || !input.message.trim()) return false;
    if (navigator.onLine === false) { setError("Internet connection required. Reconnect and try again. Your draft is preserved."); setConnection("Disconnected"); return false; }
    let base = override ?? messages;
    if (base.at(-1)?.role === "user" && base.at(-1)?.content === input.message)
      base = base.slice(0, -1);
    if (base.length >= 98) {
      setError(
        "This conversation has reached its limit. Export it and start a new chat.",
      );
      return false;
    }
    const request = { ...input, messages: boundedContext(base), clientTime: captureClientTime() };
    last.current = { request, base, provider };
    const user: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.message,
      speaker: input.speaker,
      created: Date.now(),
    };
    setMessages([...base, user]);
    setError("");
    setDraft("");
    setBusy(true);
    inFlight.current = true;
    const run = ++generation.current;
    abort.current = new AbortController();
    let result: ChatResult | undefined;
    try {
      {
        setConnection("Connecting");
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-bridgevoice-access":
              sessionStorage.getItem("bridgevoice.access") || "",
          },
          body: JSON.stringify(request),
          signal: abort.current.signal,
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Unable to connect. Please retry.");
        }
        if (!response.body) throw new Error("No response received.");
        for await (const event of sseData(response.body)) {
          if (run !== generation.current) return false;
          if (event.type === "draft" && typeof event.text === "string")
            setDraft(event.text);
          else if (event.type === "result")
            result = chatResultSchema.parse(event.result);
          else if (event.type === "error") throw new Error(event.error);
        }
        if (!result)
          throw new Error(
            "Connection ended before the answer was verified. Please retry.",
          );
        setConnection("Connected");
      }
      if (run !== generation.current) return false;
      setMessages([
        ...base,
        user,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.answer,
          result,
          created: Date.now(),
        },
      ]);
      setDraft("");
      return true;
    } catch (e) {
      if (run === generation.current) {
        setDraft("");
        setError(
          e instanceof Error
            ? e.message
            : "The request failed. Your message is still here.",
        );
        if (provider === "meta") setConnection("Temporarily unavailable");
      }
      return false;
    } finally {
      if (run === generation.current) {
        setBusy(false);
        inFlight.current = false;
      }
    }
  }
  function retry() {
    const saved = last.current;
    if (saved) return send(saved.request, saved.provider, saved.base);
    return Promise.resolve(false);
  }
  function localReply(text: string, answer: string) {
    if (inFlight.current) {
      notify("Stop the current response first.");
      return;
    }
    setMessages((old) => [
      ...old,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        created: Date.now(),
      },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: answer,
        created: Date.now(),
      },
    ]);
  }
  function updateMessage(id: string, content: string) {
    if (inFlight.current || !content.trim()) return;
    setMessages((old) => old.map((m) => m.id === id ? { ...m, content: content.trim() } : m));
  }
  function deleteMessage(id: string) {
    if (inFlight.current) return;
    setMessages((old) => old.filter((m) => m.id !== id));
  }
  function feedback(id: string, value: "helpful" | "needs-review") {
    setMessages((old) =>
      old.map((m) => (m.id === id ? { ...m, feedback: value } : m)),
    );
  }
  return {
    messages,
    busy,
    draft,
    error,
    connection,
    send,
    stop,
    reset,
    retry,
    localReply,
    feedback,
    updateMessage,
    deleteMessage,
    setError,
  };
}
