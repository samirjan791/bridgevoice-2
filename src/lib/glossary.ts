import data from "@/data/glossary.json";
import type { Entry } from "./schema";
import type { Language } from "./languages";
export const glossary = data as Entry[];
export function matchGlossary(text: string, language: Language = "en") {
  const lower = text.toLocaleLowerCase();
  return glossary.filter((e) => {
    const term = (e[language] || "").toLocaleLowerCase();
    if (!term) return false;
    if (language !== "en") return lower.includes(term);
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp("(?:^|[^a-z])" + escaped + "(?:$|[^a-z])", "i").test(
      lower,
    );
  });
}
