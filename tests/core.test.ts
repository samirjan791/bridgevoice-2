import { describe, it, expect, vi, afterEach } from "vitest";
import { checkGuard, values, normalizeDigits } from "../src/lib/guard";
import { glossary, matchGlossary } from "../src/lib/glossary";
import { requestSchema, modelSchema, importSchema } from "../src/lib/schema";
import {
  mergeEntries,
  parseImport,
  csv,
  readSaved,
  writeSaved,
} from "../src/lib/storage";
import { packs } from "../src/lib/languages";
import { demos } from "../src/data/demos";
const request = {
  segmentId: "test",
  text: "Take 5 milligrams twice daily for seven days.",
  sourceLanguage: "en" as const,
  targetLanguage: "ps" as const,
  context: "medical",
};
afterEach(() => vi.unstubAllGlobals());
describe("BridgeGuard", () => {
  it("extracts dose, frequency and duration", () =>
    expect(values(request.text).map((x) => x.value)).toEqual(["5", "2", "7"]));
  it("normalizes Arabic and Persian digits", () =>
    expect(normalizeDigits("۵ ٥ ۱۰")).toBe("5 5 10"));
  it("retains original number wording for review", () =>
    expect(values("seven days")[0].sourceText).toBe("seven days"));
  it("preserves a decimal dose", () =>
    expect(values("0.5 mg")[0].value).toBe("0.5"));
  it("flags missing negation", () =>
    expect(
      checkGuard("Do not take two tablets.", "Take two tablets.").some(
        (x) => x.id === "negation-mismatch",
      ),
    ).toBe(true));
  it("flags changed quantity", () =>
    expect(
      checkGuard("Take 5 mg", "Take 50 mg").some(
        (x) => x.id === "number-mismatch",
      ),
    ).toBe(true));
  it("detects duplicate quantity changes", () =>
    expect(
      checkGuard("5 mg and 5 days", "5 mg").some(
        (x) => x.id === "number-mismatch",
      ),
    ).toBe(true));
  it("does not invent mismatch for equal digits", () =>
    expect(
      checkGuard("5 mg", "۵ mg", "en", "ps").some(
        (x) => x.id === "number-mismatch",
      ),
    ).toBe(false));
  it("flags unit substitution", () =>
    expect(
      checkGuard("Take 5 mg", "Take 5 ml").some((x) => x.id === "unit-check"),
    ).toBe(true));
  it("flags conditional language", () =>
    expect(checkGuard("Stop if dizzy").some((x) => x.id === "condition")).toBe(
      true,
    ));
  it("flags allergies", () =>
    expect(
      checkGuard("I have an allergy").some((x) => x.id === "allergy"),
    ).toBe(true));
  it("flags deadlines", () =>
    expect(
      checkGuard("Appeal within 30 days").some((x) => x.id === "deadline"),
    ).toBe(true));
  it("flags vague instructions", () =>
    expect(
      checkGuard("Take it as needed").some((x) => x.id === "ambiguity"),
    ).toBe(true));
  it("handles empty strings", () => expect(checkGuard("")).toEqual([]));
  it("checks explicit Dari negation", () =>
    expect(
      checkGuard("Do not sign", "امضا نکن", "en", "fa-AF").some(
        (x) => x.id === "negation-mismatch",
      ),
    ).toBe(false));
});
describe("glossary and languages", () => {
  it("has 120 schema-valid entries", () =>
    expect(importSchema.parse(glossary)).toHaveLength(120));
  it("has unique stable IDs", () =>
    expect(new Set(glossary.map((x) => x.id)).size).toBe(120));
  it("marks all seed entries unreviewed", () =>
    expect(glossary.every((x) => x.reviewStatus === "unreviewed")).toBe(true));
  it("matches English case-insensitively", () =>
    expect(matchGlossary("DOSAGE").some((x) => x.en === "dosage")).toBe(true));
  it("does not match embedded English words", () =>
    expect(matchGlossary("heartwarming").some((x) => x.en === "heart")).toBe(
      false,
    ));
  it("matches Pashto text", () =>
    expect(matchGlossary("د وینې فشار", "ps").length).toBeGreaterThan(0));
  it("sets Arabic-script directions", () => {
    expect(packs.ps.dir).toBe("rtl");
    expect(packs["fa-AF"].dir).toBe("rtl");
    expect(packs.en.dir).toBe("ltr");
  });
  it("does not claim Pashto speech support", () =>
    expect(packs.ps.speech).toBeNull());
});
describe("personal glossary", () => {
  it("roundtrips validated JSON", () =>
    expect(parseImport(JSON.stringify([glossary[0]]))).toEqual([glossary[0]]));
  it("rejects malformed imports", () =>
    expect(() => parseImport("{bad}")).toThrow());
  it("rejects missing fields", () =>
    expect(() => parseImport('[{"en":"test"}]')).toThrow());
  it("rejects excessive file size", () =>
    expect(() => parseImport("x".repeat(2000001))).toThrow());
  it("skips duplicate names and IDs", () =>
    expect(
      mergeEntries(
        [glossary[0]],
        [glossary[0], { ...glossary[0], id: "new", en: "DOSAGE" }],
      ),
    ).toHaveLength(1));
  it("prevents spreadsheet formula injection", () =>
    expect(csv([{ ...glossary[0], en: "=1+1" }])).toContain('"\'=1+1"'));
  it("persists and restores local data", () => {
    const memory = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => memory.get(k) || null,
      setItem: (k: string, v: string) => memory.set(k, v),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    writeSaved([glossary[0]]);
    expect(readSaved()).toEqual([glossary[0]]);
  });
  it("surfaces storage errors", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("denied");
      },
    });
    expect(() => readSaved()).toThrow("denied");
  });
});
describe("pipeline", () => {
  it("rejects blank transcripts", () =>
    expect(requestSchema.safeParse({ ...request, text: " " }).success).toBe(
      false,
    ));
  it("rejects unknown languages", () =>
    expect(
      requestSchema.safeParse({ ...request, targetLanguage: "xx" }).success,
    ).toBe(false));
  it("rejects equal languages", () =>
    expect(
      requestSchema.safeParse({ ...request, targetLanguage: "en" }).success,
    ).toBe(false));
  it("rejects oversized text", () =>
    expect(
      requestSchema.safeParse({ ...request, text: "a".repeat(4001) }).success,
    ).toBe(false));
  it("rejects malformed model output", () =>
    expect(modelSchema.safeParse({ suggestedTranslation: 42 }).success).toBe(
      false,
    ));
  it("processes all six complete fictional scenarios", () => {
    expect(demos).toHaveLength(6);
    for (const d of demos)
      for (const text of d.segments) {
        const r = requestSchema.parse({ ...request, text });
        expect(r.text).toBe(text);
        expect(text.trim().length).toBeGreaterThan(0);
      }
  });
});
