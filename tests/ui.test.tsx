// @vitest-environment jsdom
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  renderHook,
  act,
  waitFor,
} from "@testing-library/react";
import { Providers } from "@/components/providers";
import { ChatShell } from "@/components/chat/ChatShell";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { MeaningGuardCard } from "@/components/chat/MeaningGuardCard";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { Settings } from "@/components/settings";
import { chatRequestSchema } from "@/lib/chat/schema";
import { offlineChat } from "@/lib/chat/offline";
import { useConversation } from "@/lib/chat/use-conversation";
import { readHistory, persistChat, HISTORY_KEY } from "@/lib/chat/history";
import { readSaved } from "@/lib/storage";
vi.mock("next/image", () => ({
  default: ({ priority: _, ...props }: Record<string, unknown>) => (
    // This test replaces Next Image with its accessible DOM equivalent.
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={String(props.alt || "")} />
  ),
}));
const result = () =>
  offlineChat(
    chatRequestSchema.parse({
      message: "What does dosage mean?",
      language: "ps",
    }),
  );
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  );
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ configured: false }))),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("accessible chat components", () => {
  it("uses the approved logo on the welcome screen and shows offline mode honestly", () => {
    render(
      <Providers>
        <ChatShell />
      </Providers>,
    );
    expect(
      screen
        .getByRole("img", { name: /two people wearing headsets/ })
        .getAttribute("src"),
    ).toBe("/brand/bridgevoice-approved.jpeg");
    expect(screen.getByText("Local tools · no live AI")).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "Message" })).toBeTruthy();
  });
  it("sends a question, saves terminology, and clears the session", async () => {
    render(
      <Providers>
        <ChatShell />
      </Providers>,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Message" }), {
      target: { value: "What does dosage mean?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await screen.findByRole("button", { name: "Save dosage" });
    fireEvent.click(screen.getByRole("button", { name: "Save dosage" }));
    expect(readSaved().some((e) => e.en === "dosage")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: /New chat/ }));
    expect(screen.queryByRole("button", { name: "Save dosage" })).toBe(null);
    expect(localStorage.getItem(HISTORY_KEY)).toBe(null);
  });
  it("switches to Dari without mixing Pashto labels", () => {
    render(
      <Providers>
        <ChatShell />
      </Providers>,
    );
    fireEvent.change(screen.getByLabelText("Response and interface language"), {
      target: { value: "fa-AF" },
    });
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("fa-AF");
  });
  it("allows keyboard send and preserves Shift+Enter", () => {
    const send = vi.fn();
    render(
      <ChatComposer
        text="hello"
        setText={() => {}}
        onSend={send}
        busy={false}
        onStop={() => {}}
        onAttach={() => {}}
        listening={false}
        onMic={() => {}}
        micSupported={false}
        uiLanguage="en"
        onBridge={() => {}}
        onMirror={() => {}}
        onOptions={() => {}}
        interim=""
      />,
    );
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(send).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(screen.getByRole("textbox"), {
      key: "Enter",
      shiftKey: true,
    });
    expect(send).toHaveBeenCalledTimes(1);
    expect(
      screen
        .getByRole("button", { name: "English voice input" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });
  it("renders RTL translated output and meaningful review controls", () => {
    const r = result();
    r.translation = "د درملو اندازه";
    render(
      <Providers>
        <ChatMessage
          message={{
            id: "a",
            role: "assistant",
            content: r.answer,
            result: r,
            created: 0,
          }}
          busy={false}
          canSpeak={false}
          onSpeak={() => {}}
          onFeedback={() => {}}
          onFollow={() => {}}
          onRetry={() => {}}
          onEdit={() => {}}
        />
      </Providers>,
    );
    expect(screen.getByText("د درملو اندازه").getAttribute("dir")).toBe("rtl");
  });
  it("requires review before resolving a warning", () => {
    const r = offlineChat(
      chatRequestSchema.parse({
        message: "check",
        language: "en",
        task: "compare",
        original: "Do not take 2 tablets.",
        proposed: "Take 3 tablets.",
      }),
    );
    render(<MeaningGuardCard result={r} onExplain={() => {}} />);
    const select = screen.getByLabelText(
      "Review negation-mismatch",
    ) as HTMLSelectElement;
    expect(
      select.querySelector("option[value=resolved]")?.hasAttribute("disabled"),
    ).toBe(true);
    fireEvent.change(select, { target: { value: "reviewed" } });
    expect(
      select.querySelector("option[value=resolved]")?.hasAttribute("disabled"),
    ).toBe(false);
    fireEvent.change(select, { target: { value: "resolved" } });
    expect(select.value).toBe("resolved");
  });
  it("advances a fictional offline demo", async () => {
    render(
      <Providers>
        <ChatShell demo />
      </Providers>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Next demo segment" }));
    await waitFor(() =>
      expect(
        screen.getAllByText(/Offline · deterministic glossary and checks/)
          .length,
      ).toBeGreaterThan(0),
    );
    expect(screen.getByText("1 / 3")).toBeTruthy();
  });
  it("history is explicit and validated", () => {
    persistChat({ id: "a", title: "test", updated: 0, messages: [] });
    expect(readHistory()).toHaveLength(1);
    localStorage.setItem(HISTORY_KEY, '[{"bad":true}]');
    expect(() => readHistory()).toThrow();
  });
  it("provides complete local data deletion", () => {
    localStorage.setItem(HISTORY_KEY, "[]");
    vi.stubGlobal(
      "confirm",
      vi.fn(() => false),
    );
    render(
      <Providers>
        <Settings />
      </Providers>,
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete all BridgeVoice browser data",
      }),
    );
    expect(window.confirm).toHaveBeenCalled();
    expect(localStorage.getItem(HISTORY_KEY)).toBe("[]");
  });
});
describe("conversation failure and cancellation", () => {
  it("preserves a failed user message, then retries without duplication", async () => {
    const { result: r } = renderHook(() => useConversation(() => {}));
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ error: "Key missing" }), {
            status: 503,
          }),
      ),
    );
    const input = chatRequestSchema.parse({ message: "hello", language: "en" });
    await act(async () => {
      await r.current.send(input, "meta");
    });
    expect(r.current.messages).toHaveLength(1);
    expect(r.current.error).toBe("Key missing");
    await act(async () => {
      await r.current.retry();
    });
    expect(r.current.messages).toHaveLength(1);
  });
  it("does not accept an obsolete response after clear", async () => {
    let resolve!: (value: Response) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise<Response>((r) => (resolve = r))),
    );
    const { result: r } = renderHook(() => useConversation(() => {}));
    let pending!: Promise<boolean>;
    act(() => {
      pending = r.current.send(
        chatRequestSchema.parse({ message: "hello", language: "en" }),
        "meta",
      );
    });
    act(() => r.current.reset());
    await act(async () => {
      resolve(
        new Response(
          "data: " +
            JSON.stringify({ type: "result", result: result() }) +
            "\n\n",
        ),
      );
      await pending;
    });
    expect(r.current.messages).toHaveLength(0);
    expect(r.current.busy).toBe(false);
  });
});
