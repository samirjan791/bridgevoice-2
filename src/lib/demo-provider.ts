import { matchGlossary } from "./glossary";
import { checkGuard, values } from "./guard";
import type { AnalysisRequest, Result } from "./schema";
export function analyzeOffline(r: AnalysisRequest): Result {
  const start = performance.now();
  const matches = matchGlossary(r.text, r.sourceLanguage);
  return {
    segmentId: r.segmentId,
    sourceLanguage: r.sourceLanguage,
    targetLanguage: r.targetLanguage,
    originalTranscript: r.text,
    matches,
    terms: matches.map((e) => ({
      source: e[r.sourceLanguage],
      translation:
        e[r.targetLanguage] || "Translation pending bilingual review",
      explanation: e.explanation,
      category: e.domain,
      priority: "important",
    })),
    suggestedTranslation: "",
    alternatives: [],
    ambiguities: [],
    warnings: [],
    criticalValues: values(r.text),
    guard: checkGuard(r.text, "", r.sourceLanguage, r.targetLanguage),
    provider: "Offline glossary + deterministic checks (not live AI)",
    latencyMs: Math.round(performance.now() - start),
    requiresHumanReview: true,
  };
}

export class DemoProvider {
  async analyze(request: AnalysisRequest): Promise<Result> {
    return analyzeOffline(request);
  }
}
