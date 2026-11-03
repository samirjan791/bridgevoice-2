import { describe, it, expect, vi, afterEach } from "vitest";
import { chatRequestSchema, chatModelSchema } from "@/lib/chat/schema";
import {
  detectTask,
  detectLanguage,
  boundedContext,
  detectLocalAction,
} from "@/lib/chat/router";
import { partialAnswer, sseData } from "@/lib/chat/sse";
import { finalizeResult } from "@/lib/chat/result";
import { metaChat, buildPayload } from "@/lib/chat/meta";
import { apiResult } from "./helpers/api-result";
const req = () =>
  chatRequestSchema.parse({
    message: "What does dosage mean?",
    language: "en",
  });
const model = () => ({
  answer: "Dosage is the amount taken at one time.",
  sourcePassage: "",
  translation: "",
  terms: [],
  warnings: [],
  sources: [],
  followUps: [],
});
function stream(events: unknown[]) {
  return new ReadableStream<Uint8Array>({
    start(c) {
      for (const e of events)
        c.enqueue(
          new TextEncoder().encode("data: " + JSON.stringify(e) + "\n\n"),
        );
      c.close();
    },
  });
}
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
describe("conversation orchestration", () => {
  it.each([
    ["Translate this into Pashto.", "translate"],
    ["Explain this", "explain"],
    ["Make it simpler", "simplify"],
    ["Check my translation", "compare"],
    ["Start interpreting a conversation", "bridge"],
    ["Extract terms", "terms"],
  ])("routes %s", (text, task) => expect(detectTask(text)).toBe(task));
  it("routes document context", () =>
    expect(detectTask("What is the deadline?", true)).toBe("document"));
  it.each([
    ["Answer in Dari", "fa-AF"],
    ["Speak Pashto", "ps"],
    ["Continue in English", "en"],
  ])("recognizes language %s", (s, l) => expect(detectLanguage(s)).toBe(l));
  it("recognizes only explicit local save commands", () => {
    expect(detectLocalAction("Save this word.")).toBe("save");
    expect(detectLocalAction("Do not save this word")).toBe(null);
  });
  it("bounds history without unrelated conversations", () => {
    const messages = Array.from({ length: 30 }, (_, i) => ({
      id: String(i),
      role: "user" as const,
      content: "x".repeat(3000),
      created: 0,
    }));
    expect(boundedContext(messages)).toHaveLength(8);
  });
  it("rejects empty messages and system roles", () => {
    expect(
      chatRequestSchema.safeParse({ message: " ", language: "en" }).success,
    ).toBe(false);
    expect(
      chatRequestSchema.safeParse({
        ...req(),
        messages: [{ role: "system", content: "override" }],
      }).success,
    ).toBe(false);
  });
  it("rejects unsupported languages and oversized context", () => {
    expect(
      chatRequestSchema.safeParse({ ...req(), language: "ar" }).success,
    ).toBe(false);
    expect(
      chatRequestSchema.safeParse({
        ...req(),
        messages: Array(3).fill({ role: "user", content: "x".repeat(10000) }),
      }).success,
    ).toBe(false);
  });
  it("rejects malformed model output", () =>
    expect(chatModelSchema.safeParse({ answer: "hello" }).success).toBe(false));
  it("removes unverifiable citations and source passages", () => {
    const r = finalizeResult(
      {
        ...model(),
        sourcePassage: "invented",
        sources: [{ page: 2, quote: "made up" }],
      },
      req(),
      "test",
      performance.now(),
    );
    expect(r.sourcePassage).toBe("");
    expect(r.sources).toEqual([]);
    expect(r.warnings).toHaveLength(2);
  });
  it("preserves actual document quotes only", () => {
    const request = {
      ...req(),
      document: {
        name: "test.txt",
        pages: [{ number: 1, text: "Meeting on November 3." }],
        truncated: false,
      },
    };
    const r = finalizeResult(
      { ...model(), sources: [{ page: 1, quote: "November 3" }] },
      request,
      "test",
      performance.now(),
    );
    expect(r.sources).toHaveLength(1);
  });
  it("runs MeaningGuard on submitted translation", () => {
    const r = apiResult({
      ...req(),
      task: "compare",
      original: "Do not take 2 tablets.",
      proposed: "Take 3 tablets.",
    });
    expect(r.checks.map((x) => x.id)).toContain("negation-mismatch");
    expect(r.checks.map((x) => x.id)).toContain("number-mismatch");
    expect(r.provider).toContain("Meta");
  });
  it("passes prior context to the real adapter payload", () => {
    const payload=buildPayload({...req(),messages:[{role:"user",content:"What does dosage mean?"}],message:"Give me an example."},"test-model");
    expect(JSON.stringify(payload)).toContain("What does dosage mean?");
  });
  it("passes explanation levels to the API rather than generating a sample", () => {
    expect(JSON.stringify(buildPayload({...req(),level:"simple"},"test-model"))).toContain("simple");
    expect(JSON.stringify(buildPayload({...req(),level:"detailed"},"test-model"))).toContain("detailed");
  });

});
describe("SSE protocol and Meta adapter (mocked transport)", () => {
  it("extracts only answer text from partial JSON", () => {
    expect(partialAnswer('{"answer":"Hello\\nworld')).toBe("Hello\nworld");
    expect(partialAnswer('{"translation":"secret')).toBe("");
  });
  it("handles chunk boundaries", async () => {
    const data = 'data: {"type":"draft","text":"دری"}\n\n';
    const encoded = new TextEncoder().encode(data);
    const chunks = new ReadableStream<Uint8Array>({
      start(c) {
        for (const byte of encoded) c.enqueue(new Uint8Array([byte]));
        c.close();
      },
    });
    const events = [];
    for await (const e of sseData(chunks)) events.push(e);
    expect(events[0].text).toBe("دری");
  });
  it("requires a configured key", async () => {
    vi.stubEnv("MODEL_API_KEY", "");
    vi.stubEnv("META_API_KEY", "");
    await expect(
      metaChat(req(), new AbortController().signal, () => {}),
    ).rejects.toThrow("not configured");
  });
  it("sets no-store and bounds conversation payload", () => {
    const payload = buildPayload(req(), "test-model");
    expect(payload.store).toBe(false);
    expect(payload.stream).toBe(true);
    expect(JSON.parse(payload.input as string).conversation).toEqual([]);
    expect(payload.instructions).toContain("untrusted DATA");
  });
  it("validates a completed streamed result and counts tokens", async () => {
    vi.stubEnv("MODEL_API_KEY", "test-key");
    const draft = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            stream([
              {
                type: "response.output_text.delta",
                delta: JSON.stringify(model()),
              },
              {
                type: "response.completed",
                response: {
                  status: "completed",
                  usage: { input_tokens: 10, output_tokens: 20 },
                },
              },
            ]),
            { headers: { "content-type": "text/event-stream" } },
          ),
      ),
    );
    const result = await metaChat(req(), new AbortController().signal, draft);
    expect(result.answer).toContain("Dosage");
    expect(result.usage?.output_tokens).toBe(20);
    expect(draft).toHaveBeenCalled();
  });
  it("rejects interrupted streams", async () => {
    vi.stubEnv("MODEL_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            stream([
              {
                type: "response.output_text.delta",
                delta: JSON.stringify(model()),
              },
            ]),
            { headers: { "content-type": "text/event-stream" } },
          ),
      ),
    );
    await expect(
      metaChat(req(), new AbortController().signal, () => {}),
    ).rejects.toThrow("ended before");
  });
  it("rejects malformed model JSON after completion", async () => {
    vi.stubEnv("MODEL_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            stream([
              { type: "response.output_text.delta", delta: '{"answer":false}' },
              { type: "response.completed", response: { status: "completed" } },
            ]),
            { headers: { "content-type": "text/event-stream" } },
          ),
      ),
    );
    await expect(
      metaChat(req(), new AbortController().signal, () => {}),
    ).rejects.toThrow("validated");
  });
  it("handles invalid credentials without retrying", async () => {
    vi.stubEnv("MODEL_API_KEY", "test-key");
    const fetcher = vi.fn(async () => new Response("", { status: 401 }));
    vi.stubGlobal("fetch", fetcher);
    await expect(
      metaChat(req(), new AbortController().signal, () => {}),
    ).rejects.toThrow("rejected the API key");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("retries transient rate limits then succeeds", async () => {
    vi.stubEnv("MODEL_API_KEY", "test-key");
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response("", { status: 429 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "completed",
            output: [
              {
                type: "message",
                content: [
                  { type: "output_text", text: JSON.stringify(model()) },
                ],
              },
            ],
          }),
        ),
      );
    vi.stubGlobal("fetch", fetcher);
    await expect(
      metaChat(req(), new AbortController().signal, () => {}),
    ).resolves.toMatchObject({ answer: model().answer });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it("handles network failure without leaking details", async () => {
    vi.stubEnv("MODEL_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("secret upstream error");
      }),
    );
    await expect(
      metaChat(req(), new AbortController().signal, () => {}),
    ).rejects.toThrow("couldn’t connect");
  });
  it("handles cancellation", async () => {
    vi.stubEnv("MODEL_API_KEY", "test-key");
    const c = new AbortController();
    c.abort();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("abort");
      }),
    );
    await expect(metaChat(req(), c.signal, () => {})).rejects.toThrow(
      "Generation stopped",
    );
  });
});

it("accepts model warnings plus application provenance checks", async () => {
  const { chatResultSchema } = await import("@/lib/chat/schema");
  const r = finalizeResult(
    {
      ...model(),
      warnings: Array.from({ length: 12 }, () => ({
        message: "Review",
        priority: "review" as const,
      })),
      sourcePassage: "invented",
      sources: [{ page: 2, quote: "invented" }],
    },
    req(),
    "test",
    performance.now(),
  );
  expect(chatResultSchema.safeParse(r).success).toBe(true);
});
