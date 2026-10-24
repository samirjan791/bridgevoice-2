import { ChatRequest, ChatModel } from "./schema";
import { effectiveTask } from "./router";
import { finalizeResult } from "./result";
import { matchGlossary } from "../glossary";
export function offlineChat(r: ChatRequest) {
  const start = performance.now(),
    task = effectiveTask(r);
  const text = r.original || r.message;
  let matches = matchGlossary(text, r.sourceLanguage);
  if (
    !matches.length &&
    /that|shorter|simpler|example|translate|explain more/i.test(r.message)
  ) {
    const prior = r.messages.filter((m) => m.role === "user").at(-1);
    if (prior) matches = matchGlossary(prior.content, "en");
  }
  const model: ChatModel = {
    answer: "",
    sourcePassage: r.original || r.message,
    translation: "",
    terms: matches.slice(0, 6),
    warnings: [],
    sources: [],
    followUps: [],
  };
  if (task === "compare") {
    model.answer =
      "**Meaning Mirror · local pattern check**\n\nCompare the original and submitted translation below. The checks look for number, unit and negation differences. They cannot certify meaning. Switch to Live Meta for semantic analysis.";
    if (!r.original || !r.proposed)
      model.answer =
        "Open Meaning Mirror and provide both the original text and your translation. Local checks run without an API key.";
  } else if (r.document) {
    const excerpt = r.document.pages[0];
    model.answer =
      "**Document text extracted locally on this server**\n\nI can show the actual extracted passage below. A conversational explanation or translation requires Live Meta. No deadline has been inferred.";
    if (excerpt)
      model.sources = [
        { page: excerpt.number, quote: excerpt.text.slice(0, 600) },
      ];
  } else if (matches.length) {
    model.answer =
      matches
        .slice(0, r.level === "simple" ? 1 : 5)
        .map(
          (e) =>
            "### " +
            e.en +
            "\n" +
            e.explanation +
            (r.level === "detailed" || /example/i.test(r.message)
              ? "\n\n**Example:** " + e.example
              : "") +
            (r.language !== "en"
              ? "\n\n**" +
                (r.language === "ps" ? "پښتو" : "دری") +
                ":** " +
                (e[r.language] || "Translation pending review")
              : ""),
        )
        .join("\n\n") +
      "\n\n*Offline glossary response. Bilingual entries are unreviewed drafts; full conversational translation needs Live Meta.*";
    model.followUps = ["Make it simpler.", "Give me an example."];
    if (task === "translate" && matches.length === 1)
      model.translation = matches[0][r.language];
  } else
    model.answer =
      "You’re in **Guided offline mode**. I can look up glossary terms, compare basic number/negation patterns, and show extracted document text. For an original conversational answer, select **Live Meta** after configuring your key. You can also try one of the six fictional demos.";
  return finalizeResult(
    model,
    r,
    "Offline · deterministic glossary and checks",
    start,
  );
}
