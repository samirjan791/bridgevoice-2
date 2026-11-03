import { it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { selectVoice, speechSSML } from "@/lib/voice-support";
import { GET, POST } from "@/app/api/speech/route";
import { buildPayload } from "@/lib/chat/meta";
import { chatRequestSchema } from "@/lib/chat/schema";
import { matchGlossary } from "@/lib/glossary";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
const request = (body: unknown) =>
  new NextRequest("http://localhost:3000/api/speech", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
it("chooses Pashto and Spanish browser voices without another language fallback", () => {
  const voices = [{ lang: "en-US" }, { lang: "es-MX" }, { lang: "ps-AF" }];
  expect(selectVoice(voices, "ps")?.lang).toBe("ps-AF");
  expect(selectVoice(voices, "es-US")?.lang).toBe("es-MX");
  expect(selectVoice([{ lang: "ar-SA" }], "ps")).toBeUndefined();
});
it("does not silently label Persian as Dari", () => {
  expect(selectVoice([{ lang: "fa-IR" }], "fa-AF")).toBeUndefined();
  expect(selectVoice([{ lang: "fa-IR" }], "fa-AF", true)?.lang).toBe("fa-IR");
  expect(
    selectVoice([{ lang: "fa-IR" }, { lang: "prs-AF" }], "fa-AF")?.lang,
  ).toBe("prs-AF");
});
it("escapes SSML and uses documented Pashto voice", () => {
  const xml = speechSSML('<audio src="bad"> & test', "ps");
  expect(xml).toContain("ps-AF-LatifaNeural");
  expect(xml).not.toContain("<audio");
  expect(xml).toContain("&lt;audio");
});
it("reports missing speech configuration without exposing keys", async () => {
  vi.stubEnv("AZURE_SPEECH_KEY", "");
  expect((await GET().json()).configured).toBe(false);
  const r = await POST(
    request({ text: "hello", language: "en", consent: true }),
  );
  expect(r.status).toBe(503);
});
it("requires external-processing consent", async () =>
  expect((await POST(request({ text: "hello", language: "ps" }))).status).toBe(
    400,
  ));
it("requires explicit Persian fallback agreement", async () =>
  expect(
    (await POST(request({ text: "سلام", language: "fa-AF", consent: true })))
      .status,
  ).toBe(422));
it("returns mocked cloud audio using a server-only key", async () => {
  vi.stubEnv("AZURE_SPEECH_KEY", "test-secret");
  vi.stubEnv("AZURE_SPEECH_REGION", "eastus");
  const f = vi.fn(
    async (_url: string, _init?: RequestInit) =>
      new Response(new Uint8Array([73, 68, 51]), {
        headers: { "Content-Type": "audio/mpeg" },
      }),
  );
  vi.stubGlobal("fetch", f);
  const r = await POST(
    request({ text: "سلام", language: "ps", consent: true }),
  );
  expect(r.status).toBe(200);
  expect(r.headers.get("content-type")).toBe("audio/mpeg");
  expect(r.headers.get("cache-control")).toBe("no-store");
  expect(f.mock.calls[0][0]).toBe(
    "https://eastus.tts.speech.microsoft.com/cognitiveservices/v1",
  );
});
it("handles rejected speech credentials", async () => {
  vi.stubEnv("AZURE_SPEECH_KEY", "test");
  vi.stubEnv("AZURE_SPEECH_REGION", "eastus");
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("", { status: 401 })),
  );
  const r = await POST(
    request({ text: "Hola", language: "es-US", consent: true }),
  );
  expect((await r.json()).error).toContain("rejected");
});
it("handles cloud network errors without leaking upstream details", async () => {
  vi.stubEnv("AZURE_SPEECH_KEY", "test");
  vi.stubEnv("AZURE_SPEECH_REGION", "eastus");
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new Error("secret upstream");
    }),
  );
  expect(
    (
      await (
        await POST(request({ text: "Hola", language: "es-US", consent: true }))
      ).json()
    ).error,
  ).not.toContain("secret");
});
it("preserves photo input through the Meta payload", () => {
  const r = chatRequestSchema.parse({
    message: "Explain this photo",
    language: "en",
    image: { name: "test.png", dataUrl: "data:image/png;base64,aGVsbG8=" },
  });
  expect(buildPayload(r, "test").input).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        role: "user",
        content: expect.arrayContaining([
          expect.objectContaining({
            type: "input_image",
            image_url: r.image!.dataUrl,
          }),
        ]),
      }),
    ]),
  );
});
it("handles missing Spanish glossary translations safely", () => {
  expect(() => matchGlossary("hola", "es-US")).not.toThrow();
});
