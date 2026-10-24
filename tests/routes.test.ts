import { it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/chat/route";
import { POST as documentPost } from "@/app/api/document/route";
import { limitedBody } from "@/lib/server-security";
afterEach(() => vi.unstubAllEnvs());
function req(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}
it("rejects missing credentials with an actionable error", async () => {
  vi.stubEnv("MODEL_API_KEY", "");
  vi.stubEnv("META_API_KEY", "");
  const r = await POST(req({ message: "hello", language: "en" }));
  expect(r.status).toBe(503);
  expect((await r.json()).error).toContain("not configured");
});
it("rejects malformed request data", async () =>
  expect((await POST(req({ message: "", language: "xx" }))).status).toBe(400));
it("blocks cross-origin requests", async () =>
  expect(
    (
      await POST(
        req(
          { message: "hello", language: "en" },
          { origin: "https://evil.example" },
        ),
      )
    ).status,
  ).toBe(403));
it("enforces private deployment access token", async () => {
  vi.stubEnv("BRIDGEVOICE_ACCESS_TOKEN", "private-test-code");
  expect((await POST(req({ message: "hello", language: "en" }))).status).toBe(
    401,
  );
});
it("limits streaming bodies even without content-length", async () => {
  const r = new Request("http://localhost", {
    method: "POST",
    body: "too much data",
  });
  await expect(limitedBody(r, 3)).rejects.toThrow("too large");
});
it("extracts an uploaded TXT through the route", async () => {
  const form = new FormData();
  form.set(
    "file",
    new File(["Fictional deadline: October 30, 2026."], "letter.txt", {
      type: "text/plain",
    }),
  );
  const r = await documentPost(
    new NextRequest("http://localhost:3000/api/document", {
      method: "POST",
      body: form,
    }),
  );
  expect(r.status).toBe(200);
  expect((await r.json()).pages[0].text).toContain("October 30");
});
it("rejects unsupported file uploads", async () => {
  const form = new FormData();
  form.set("file", new File(["x"], "image.png", { type: "image/png" }));
  const r = await documentPost(
    new NextRequest("http://localhost:3000/api/document", {
      method: "POST",
      body: form,
    }),
  );
  expect(r.status).toBe(400);
});
