import { ChatRequest, ChatModel, ChatResult } from "./schema";
import { effectiveTask } from "./router";
import { checkGuard } from "../guard";
export function finalizeResult(
  model: ChatModel,
  r: ChatRequest,
  provider: string,
  start: number,
): ChatResult {
  const sourcePool = [
    r.message,
    r.original,
    ...r.messages.map((m) => m.content),
    ...(r.document?.pages.map((p) => p.text) || []),
  ].join("\n");
  let original = r.original || model.sourcePassage;
  const warnings = [...model.warnings];
  if (original && !sourcePool.includes(original)) {
    original = "";
    warnings.push({
      message:
        "The model supplied a source passage that could not be matched to your text. Compare against the original before using it.",
      priority: "review",
    });
  }
  const sources = model.sources.filter((s) =>
    r.document?.pages.some(
      (p) => p.number === s.page && p.text.includes(s.quote),
    ),
  );
  if (sources.length !== model.sources.length)
    warnings.push({
      message:
        "One or more model source excerpts could not be verified and were removed.",
      priority: "review",
    });
  return {
    ...model,
    sourcePassage: original,
    sources,
    warnings,
    provider,
    latencyMs: Math.round(performance.now() - start),
    task: effectiveTask(r),
    checks: checkGuard(
      original || r.message,
      r.proposed || model.translation,
      r.sourceLanguage,
      r.language,
    ),
    termsSaved: model.terms.map((t, i) => ({
      ...t,
      id: "term-" + crypto.randomUUID() + "-" + i,
      source:
        provider +
        "; unreviewed suggestion. No professional validation claimed.",
      reviewStatus: "unreviewed",
    })),
    sourceLanguage: r.sourceLanguage,
    targetLanguage: r.language,
  };
}
