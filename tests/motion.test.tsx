// @vitest-environment jsdom
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { Intro } from "@/components/intro/Intro";
import { RotatingWelcome } from "@/components/chat/RotatingWelcome";
import { CommandPalette, filterCommands, Command } from "@/components/chat/CommandPalette";
import { shouldPlayIntro, bootScript, INTRO_SESSION_KEY, SETTINGS_KEY } from "@/lib/intro-boot";
import { WORDMARK_GLYPHS, WORDMARK_TEXT } from "@/components/intro/wordmark-paths";
import { ui } from "@/lib/ui-text";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  delete document.documentElement.dataset.intro;
});

describe("intro decision", () => {
  it("plays once, never with reduced motion, and respects the settings toggle", () => {
    const base = { reducedMotion: false, seenThisSession: false, settings: {} };
    expect(shouldPlayIntro(base)).toBe(true);
    expect(shouldPlayIntro({ ...base, reducedMotion: true })).toBe(false);
    expect(shouldPlayIntro({ ...base, seenThisSession: true })).toBe(false);
    expect(shouldPlayIntro({ ...base, settings: { intro: false } })).toBe(false);
    expect(shouldPlayIntro({ ...base, settings: { motion: false } })).toBe(false);
  });
  it("boot script wraps storage access and uses the app's storage keys", () => {
    expect(bootScript).toContain(SETTINGS_KEY);
    expect(bootScript).toContain(INTRO_SESSION_KEY);
    expect(bootScript.match(/try\{/g)!.length).toBeGreaterThanOrEqual(3);
  });
  it("has one generated path per letter of the wordmark", () => {
    expect(WORDMARK_TEXT).toBe("BridgeVoice");
    expect(WORDMARK_GLYPHS).toHaveLength(WORDMARK_TEXT.length);
    expect(WORDMARK_GLYPHS.every((d) => d.startsWith("M"))).toBe(true);
  });
});

describe("Intro overlay", () => {
  it("renders nothing when the boot script decided not to play", () => {
    document.documentElement.dataset.intro = "off";
    const { container } = render(<Intro />);
    expect(container.querySelector(".intro")).toBeNull();
  });
  it("is hidden from assistive tech, keeps the wordmark text, and can be skipped with Escape", () => {
    vi.useFakeTimers();
    document.documentElement.dataset.intro = "play";
    const { container } = render(<Intro />);
    const overlay = container.querySelector(".intro")!;
    expect(overlay.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector(".intro-wordmark title")!.textContent).toBe("BridgeVoice");
    fireEvent.keyDown(window, { key: "Escape" });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(container.querySelector(".intro")).toBeNull();
    expect(document.documentElement.dataset.intro).toBe("done");
  });
  it("finishes by itself", () => {
    vi.useFakeTimers();
    document.documentElement.dataset.intro = "play";
    const { container } = render(<Intro />);
    act(() => {
      vi.advanceTimersByTime(3600);
    });
    expect(container.querySelector(".intro")).toBeNull();
  });
  it("types the tagline in Latin text only", () => {
    vi.useFakeTimers();
    document.documentElement.dataset.intro = "play";
    const { container } = render(<Intro />);
    act(() => {
      vi.advanceTimersByTime(1850 + 22 * 5 + 5);
    });
    const text = container.querySelector(".intro-tagline span")!.textContent!;
    expect("Every Voice Deserves to Be Understood.".startsWith(text)).toBe(true);
    expect(text.length).toBeGreaterThan(0);
  });
});

describe("RotatingWelcome", () => {
  it("shows the full question with correct lang/dir when animation is off", () => {
    render(<RotatingWelcome language="ps" animate={false} paused={false} />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.getAttribute("lang")).toBe("ps");
    expect(h1.getAttribute("dir")).toBe("rtl");
    expect(h1.getAttribute("aria-label")).toBe(ui.ps.welcome);
    expect(h1.textContent).toBe(ui.ps.welcome);
  });
  it("cross-fades to the next language after a pause and never splits Arabic script", () => {
    vi.useFakeTimers();
    render(<RotatingWelcome language="en" animate paused={false} />);
    act(() => {
      vi.advanceTimersByTime(120 + 24 * 60); // finish typing the English line
    });
    act(() => {
      vi.advanceTimersByTime(6000 + 300);
    });
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.getAttribute("lang")).toBe("ps");
    expect(h1.textContent).toBe(ui.ps.welcome); // whole line at once
  });
});

describe("CommandPalette", () => {
  const run = vi.fn();
  const commands: Command[] = [
    { id: "a", group: "Chat", label: "New chat", run },
    { id: "b", group: "View", label: "Switch black / white theme", keywords: "dark light", run: vi.fn() },
    { id: "c", group: "Language", label: "Dari", keywords: "persian", run: vi.fn() },
  ];
  beforeEach(() => run.mockClear());
  it("filters by label, group and keywords, all words required", () => {
    expect(filterCommands(commands, "")).toHaveLength(3);
    expect(filterCommands(commands, "dark").map((c) => c.id)).toEqual(["b"]);
    expect(filterCommands(commands, "language dari").map((c) => c.id)).toEqual(["c"]);
    expect(filterCommands(commands, "zzz")).toHaveLength(0);
  });
  it("opens focused, moves with arrows, runs on Enter and closes on Escape", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<CommandPalette open onClose={onClose} commands={commands} />);
    act(() => {
      vi.advanceTimersByTime(5);
    });
    const input = screen.getByRole("combobox");
    expect(document.activeElement).toBe(input);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onClose).toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(5);
    });
    expect(run).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(input, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
  it("renders nothing when closed", () => {
    const { container } = render(<CommandPalette open={false} onClose={() => {}} commands={commands} />);
    expect(container.firstChild).toBeNull();
  });
});
