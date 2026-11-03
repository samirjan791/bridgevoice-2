import { checkGuard, values } from "./guard";
import { Language, packs } from "./languages";

export type Anchor = { start: number; end: number; text: string; kind: "value" | "negation" | "condition" | "frequency" };
// Offsets refer to the original UTF-16 string: never generated or normalized quotes.
export function meaningAnchors(source: string): Anchor[] {
  const hits: Anchor[] = [];
  const add = (pattern: RegExp, kind: Anchor["kind"]) => {
    for (const m of source.matchAll(pattern)) hits.push({ start: m.index!, end: m.index! + m[0].length, text: m[0], kind });
  };
  add(/(?<![\p{L}\p{N}])(?:[$€£]\s*)?[0-9۰-۹٠-٩]+(?:[.,٫٬][0-9۰-۹٠-٩]+)*(?:\s*(?:milligrams?|micrograms?|tablets?|days?|hours?|mg|mcg|ml|%))?|\b(?:one|two|three|four|five|six|seven|eight|nine|ten)\b(?:\s+(?:tablets?|days?|hours?))?/giu, "value");
  add(/\b(?:not|never|without|no|nunca|sin)\b|(?<![\p{L}])(?:نکنید|نباید|نه|مه)(?![\p{L}])/giu, "negation");
  add(/\b(?:only if|unless|if|provided that|si|excepto)\b|(?<![\p{L}])(?:که|اگر)(?![\p{L}])/giu, "condition");
  add(/\b(?:once daily|twice daily|daily|weekly|as needed|every\s+\d+\s+hours?)\b/giu, "frequency");
  return hits.sort((a,b) => a.start-b.start || b.end-a.end).filter((a,i,all) => !all.slice(0,i).some(b => b.end > a.start));
}
export function clarificationQuestions(source: string) {
  const questions: string[] = [];
  if (/\bas needed\b/i.test(source)) questions.push("What situation calls for this, and what limits did the speaker specify?");
  if (/\bpositive\b/i.test(source)) questions.push("What does ‘positive’ refer to in this specific test or context?");
  if (/\b(it|that|some|a few)\b/i.test(source)) questions.push("Which item or exact quantity does the speaker mean?");
  if (/\b(within|deadline|by Friday|tomorrow)\b/i.test(source)) questions.push("What is the exact deadline, including its starting point and time zone if relevant?");
  return questions;
}
export function compareUnderstanding(source: string, restatement: string, sourceLanguage: Language, answerLanguage: Language) {
  const issues = checkGuard(source, restatement, sourceLanguage, answerLanguage)
    .filter(w => ["number-mismatch", "negation-mismatch", "unit-check"].includes(w.id))
    .map(w => ({ id: w.id, message: w.message }));
  if (!restatement.trim()) return [];
  // Same English values in a different unit relationship can change the instruction.
  if (sourceLanguage === "en" && answerLanguage === "en") {
    const bindings = (s: string) => values(s).map(v => v.value + ":" + v.unit.toLowerCase().replace(/milligrams?/,"mg").replace(/tablets?/,"tablet").replace(/hours?/,"hour")).sort();
    if (JSON.stringify(bindings(source)) !== JSON.stringify(bindings(restatement)) && !issues.some(i => i.id === "number-mismatch")) issues.push({ id: "binding", message: "A number may now describe a different unit or duration. Check each number with the words beside it." });
    const conditional = (s: string) => /\b(if|unless|provided that)\b/i.test(s);
    if (conditional(source) !== conditional(restatement)) issues.push({ id: "condition", message: "A condition may have been omitted or added. Verify when the instruction applies." });
    const frequency = (s: string) => [...s.matchAll(/\b(once daily|twice daily|weekly|daily|as needed)\b/gi)].map(m => m[0].toLowerCase()).sort();
    if (JSON.stringify(frequency(source)) !== JSON.stringify(frequency(restatement))) issues.push({ id: "frequency", message: "Frequency wording differs. Confirm how often, and whether this is conditional." });
  }
  return issues;
}
export function reviewLimit(language: Language) {
  return language === "en" ? "Local checks cover selected numbers, units, negation and conditions. They cannot confirm complete meaning or safety." : `Local checks for ${packs[language].name} are limited to recognized markers and numerals. Spelled-out numbers, grammar and meaning need a qualified language reviewer.`;
}
