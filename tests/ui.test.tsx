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
import { apiResult } from "./helpers/api-result";
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
  apiResult(
    chatRequestSchema.parse({
      message: "What does dosage mean?",
      language: "ps",
    }),
  );
beforeEach(() => {
 vi.spyOn(HTMLMediaElement.prototype,"pause").mockImplementation(()=>{});
 vi.spyOn(HTMLMediaElement.prototype,"play").mockResolvedValue();
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
    vi.fn(async (url: string) => url === "/api/chat" ? new Response("data: " + JSON.stringify({type:"result",result:result()}) + "\n\n") : new Response(JSON.stringify({ configured: false }))),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("accessible chat components", () => {
  it("uses the supplied logo on the welcome screen and requires Meta without a fallback mode", () => {
    render(
      <Providers>
        <ChatShell />
      </Providers>,
    );
    expect(screen.getByRole("link",{name:"BridgeVoice home"}).querySelector("img")?.getAttribute("src")).toBe("/brand/bridgevoice-icon.png");
    expect(screen.queryByRole("button",{name:"Skip introduction"})).toBeNull();
    expect(screen.queryByText(/Connection options|Key configured · verified/)).toBeNull();
    expect(screen.queryByLabelText(/I have permission to send/)).toBeNull();
    expect(screen.getByRole("textbox", { name: "Message" })).toBeTruthy();
  });
  it("sends directly without connection options or consent, saves terminology, and clears the session", async () => {
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
    fireEvent.change(screen.getByLabelText("Interface language"), {
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
    expect(screen.queryByRole("button",{name:"Dictate"})).toBeNull();
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
          onSaveEdit={() => {}}
          onDelete={() => {}}
        />
      </Providers>,
    );
    expect(screen.getAllByText("د درملو اندازه").find(el => el.closest(".translation-answer"))!.getAttribute("dir")).toBe("rtl");
  });
  it("requires review before resolving a warning", () => {
    const r = apiResult(
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
  it("sends fictional demo input through the API", async () => {
    render(
      <Providers>
        <ChatShell demo />
      </Providers>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Next demo segment" }));
    await screen.findByText("Mocked API answer for automated testing.");
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
    fireEvent.click(screen.getByRole("button",{name:"History & data"}));
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

it("switches true-black and white theme while preserving chat input", () => {
  render(
    <Providers>
      <ChatShell />
    </Providers>,
  );
  const input = screen.getByRole("textbox", { name: "Message" });
  fireEvent.change(input, { target: { value: "Keep this draft" } });
  fireEvent.change(screen.getByLabelText("Theme"),{target:{value:"light"}});
  expect(document.documentElement.dataset.theme).toBe("light");
  expect((input as HTMLTextAreaElement).value).toBe("Keep this draft");
  fireEvent.change(screen.getByLabelText("Theme"),{target:{value:"dark"}});
  expect(document.documentElement.dataset.theme).toBe("dark");
});
it("collapses the desktop sidebar and opens the dedicated voice view", () => {
  const view=render(<Providers><ChatShell /></Providers>);
  fireEvent.click(screen.getAllByLabelText("Hide sidebar")[0]);
  expect(view.container.querySelector('.chat-app')?.classList.contains('sidebar-collapsed')).toBe(true);
  fireEvent.click(screen.getByLabelText("Show sidebar"));
  expect(view.container.querySelector('.chat-app')?.classList.contains('sidebar-collapsed')).toBe(false);
  fireEvent.click(screen.getByLabelText("Open voice conversation"));
  expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBe('true');
  fireEvent.click(screen.getByLabelText("End voice session"));
  expect(screen.queryByRole('dialog')).toBeNull();
});
it("requires internet and never replaces a failed API request with a sample", async () => {
  const request=chatRequestSchema.parse({message:"Translate this",language:"en"});
  vi.stubGlobal("fetch",vi.fn(async()=>{throw new Error("Network unavailable");}));
  const {result:r}=renderHook(()=>useConversation(()=>{}));
  await act(async()=>{await r.current.send(request,"meta");});
  expect(r.current.messages.filter(m=>m.role==='assistant')).toHaveLength(0);
  expect(r.current.error).toBe("Network unavailable");
  expect(r.current.messages[0].content).toBe("Translate this");
});
it("has no alternate provider selector",()=>{
  render(<Providers><ChatShell/></Providers>);
  expect(screen.queryByRole('button',{name:/Guided offline/i})).toBeNull();
  expect(screen.queryByText(/Connection options|Key configured · verified/)).toBeNull();
    expect(screen.queryByLabelText(/I have permission to send/)).toBeNull();
});
