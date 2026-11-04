import { describe, it, expect } from "vitest";
import { chatRequestSchema } from "@/lib/chat/schema";
import {
  buildPayload,
  outputCapFor,
  isWebsiteRequest,
} from "@/lib/chat/meta";

const req = (message: string, task = "auto") =>
  chatRequestSchema.parse({ message, language: "en", task });

describe("5.0.1 speed", () => {
  it("caps short routes below the agent cap", () => {
    expect(outputCapFor(req("What is AI?", "chat"))).toBe(2500);
    expect(outputCapFor(req("Translate hello into Pashto.", "translate"))).toBe(
      3000,
    );
    expect(outputCapFor(req("Help me prepare for my appointment tomorrow", "agent"))).toBe(
      6500,
    );
  });

  it("website builds keep the full cap, other creates do not trigger it", () => {
    expect(isWebsiteRequest("Build me a website about cats")).toBe(true);
    expect(isWebsiteRequest("Create a report from this file")).toBe(false);
    expect(outputCapFor(req("Build me a website about cats"))).toBe(6500);
  });

  it("payload keeps agent safety rules, time context, and language", () => {
    const agent = buildPayload(
      req("Help me prepare for my appointment tomorrow"),
      "muse-spark-1.3",
    );
    expect(agent.max_output_tokens).toBe(6500);
    expect(agent.instructions).toContain("ASK FOR CONFIRMATION");
    const timed = buildPayload(
      {
        ...req("What time is it?"),
        clientTime: { epochMs: Date.now(), timeZone: "America/Chicago" },
      },
      "muse-spark-1.3",
    );
    expect(timed.instructions).toContain("Current time context");
    expect(timed.instructions).toContain("Respond in en");
  });

  it("plain chat payload does not carry the website-build paragraph", () => {
    const p = buildPayload(req("What is AI?"), "muse-spark-1.3");
    expect(p.instructions).not.toContain("single-file HTML");
    expect(p.max_output_tokens).toBe(2500);
  });
});
