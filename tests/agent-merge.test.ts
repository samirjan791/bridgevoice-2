import { describe, expect, it } from "vitest";
import { detectTask, effectiveTask } from "@/lib/chat/router";
import {
  agentInstruction,
  detectAgentTask,
  parseVolunteeredName,
} from "@/lib/chat/agent";

describe("agent routing in the one merged chat", () => {
  it("routes planning and multi-step tasks to the agent engine", () => {
    expect(detectTask("Help me prepare for my appointment tomorrow")).toBe("agent");
    expect(detectTask("Plan my day")).toBe("agent");
    expect(detectTask("Organize these documents and create a report")).toBe("agent");
    expect(detectTask("Create a project plan")).toBe("agent");
    expect(detectTask("Organize this into a short plan")).toBe("agent");
    expect(detectAgentTask("Help me plan my day")).toBe(true);
  });
  it("keeps translate, explain, and plain chat on their existing routes", () => {
    expect(detectTask("Translate this into Pashto")).toBe("translate");
    expect(detectTask("What does this mean?")).toBe("explain");
    expect(detectTask("What time is it right now?")).toBe("chat");
    expect(detectTask("Hello")).toBe("chat");
  });
  it("resolves auto task to agent through effectiveTask", () => {
    expect(
      effectiveTask({
        message: "Help me prepare for my appointment tomorrow",
        messages: [],
        language: "en",
        sourceLanguage: "en",
        task: "auto",
        level: "standard",
        original: "",
        proposed: "",
      }),
    ).toBe("agent");
  });
});

describe("volunteered name capture stays safe", () => {
  it("captures explicit introductions", () => {
    expect(parseVolunteeredName("Call me Ahmad")).toBe("Ahmad");
    expect(parseVolunteeredName("My name is Sara Ali")).toBe("Sara Ali");
  });
  it("never mistakes ordinary sentences for a name", () => {
    expect(parseVolunteeredName("I'm going tomorrow")).toBeNull();
    expect(parseVolunteeredName("I am going to the store")).toBeNull();
    expect(parseVolunteeredName("Help me plan my day")).toBeNull();
    expect(parseVolunteeredName("Call me help")).toBeNull();
  });
});

describe("agent safety instruction", () => {
  it("requires confirmation before sensitive or external actions", () => {
    const text = agentInstruction();
    expect(text).toMatch(/ASK FOR CONFIRMATION/);
    expect(text).toMatch(/NEVER claim to have performed an action/);
    expect(text).toMatch(/cannot send messages, book, call/);
  });
});
