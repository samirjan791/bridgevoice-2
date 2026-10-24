import { packs, Language } from "./languages";
import type { Warning } from "./schema";
const words: Record<string, string> = {
  zero: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  ten: "10",
  twice: "2",
  once: "1",
};
export function normalizeDigits(text: string) {
  return text
    .replace(/[۰-۹٠-٩]/g, (c) =>
      String(c.charCodeAt(0) - (c >= "۰" ? 1776 : 1632)),
    )
    .replace(/٫/g, ".")
    .replace(/٬/g, ",");
}
export function values(text: string) {
  const pattern =
    /(?<![\p{L}\p{N}])(?:[$€£]\s*)?(?:[0-9۰-۹٠-٩]+(?:[.,٫٬][0-9۰-۹٠-٩]+)*|zero|one|two|three|four|five|six|seven|eight|nine|ten|twice|once)(?![\p{L}\p{N}])(?:\s*(?:milligrams?|tablets?|days?|weeks?|months?|years?|hours?|minutes?|dollars?|percent|mcg|mg|ml|g|%)(?![\p{L}]))?/giu;
  return [...text.matchAll(pattern)].map((m) => {
    const normalized = normalizeDigits(m[0]).replace(/^[$€£]\s*/, "");
    const first = normalized.match(/^[\d.,]+|^[a-z]+/i)![0];
    return {
      sourceText: m[0],
      value: words[first.toLowerCase()] || first.replace(/,/g, ""),
      unit: normalized.slice(first.length).trim(),
      requiresVerification: true as const,
    };
  });
}
export function checkGuard(
  source: string,
  translation = "",
  sourceLanguage: Language = "en",
  targetLanguage: Language = "en",
): Warning[] {
  const warnings: Warning[] = [];
  const add = (
    id: string,
    message: string,
    priority: "critical" | "important" = "important",
  ) => warnings.push({ id, message, source, priority, state: "flagged" });
  if (values(source).length)
    add(
      "values",
      "Confirm every quantity, unit, frequency, date and duration against the original.",
    );
  if (packs[sourceLanguage].negative.test(source))
    add(
      "negation",
      "Negation detected. Preserve what must NOT happen.",
      "critical",
    );
  if (/\b(if|unless|only if|provided that)\b|که|اگر/i.test(source))
    add(
      "condition",
      "Conditional statement: preserve the condition and its consequence.",
    );
  if (/allerg|حساسیت/i.test(source))
    add(
      "allergy",
      "Allergy statement: confirm the substance and whether an allergy is present.",
      "critical",
    );
  if (/deadline|within|eligible|eligibility|appeal|renew|expires/i.test(source))
    add(
      "deadline",
      "Eligibility or deadline: verify the exact requirement and date.",
    );
  if (/\b(it|that|some|a few|as needed|maybe|either|or)\b/i.test(source))
    add(
      "ambiguity",
      "Potentially ambiguous reference or quantity. Ask the speaker to clarify.",
    );
  if (translation.trim()) {
    const a = values(source)
        .map((x) => x.value)
        .sort(),
      b = values(translation)
        .map((x) => x.value)
        .sort();
    if (JSON.stringify(a) !== JSON.stringify(b))
      add(
        "number-mismatch",
        "Possible number mismatch or unrecognized number words. Compare source and translation.",
        "critical",
      );
    if (
      packs[sourceLanguage].negative.test(source) !==
      packs[targetLanguage].negative.test(translation)
    )
      add(
        "negation-mismatch",
        "Possible missing or added negation. Human verification required.",
        "critical",
      );
    const units = (t: string) =>
      [...t.matchAll(/\b(mg|mcg|ml|milligrams?|micrograms?|milliliters?)\b/gi)]
        .map((m) =>
          m[0]
            .toLowerCase()
            .replace(/milligrams?/, "mg")
            .replace(/micrograms?/, "mcg")
            .replace(/milliliters?/, "ml"),
        )
        .sort();
    if (
      units(source).length &&
      JSON.stringify(units(source)) !== JSON.stringify(units(translation))
    )
      add(
        "unit-check",
        "Unit representation differs or is translated. Confirm units; matching numbers alone is insufficient.",
        "critical",
      );
  }
  return warnings;
}
