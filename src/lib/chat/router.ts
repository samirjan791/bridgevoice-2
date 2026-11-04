import { ChatRequest, Task, ChatMessage } from "./schema";
import { Language } from "../languages";
export function detectTask(text: string, document = false): Task {
  if (
    /bridge mode|start interpret|interpret.*conversation|interpret.*call/i.test(
      text,
    )
  )
    return "bridge";
  if (/check.*translat|compare|meaning mirror|changed.*meaning/i.test(text))
    return "compare";
  if (document) return "document";
  if (/translat|ژباړ|ترجمه/i.test(text)) return "translate";
  if (/simpler|shorter|simple words|simplify|ساده/i.test(text))
    return "simplify";
  if (/difficult words|terminology|extract.*terms/i.test(text)) return "terms";
  if (/explain|what does|meaning|understand|تشریح|توضیح/i.test(text))
    return "explain";
  return "chat";
}
export function detectLanguage(text: string): Language | undefined {
  if (
    /(?:into|in|speak|answer|continue in)\s+(?:simple\s+)?(?:dari|afghan persian)\b/i.test(
      text,
    )
  )
    return "fa-AF";
  if (
    /(?:into|in|speak|answer|continue in)\s+(?:simple\s+)?pashto\b/i.test(text)
  )
    return "ps";
  if (/(?:into|in|speak|answer|continue in)\s+spanish\b/i.test(text)) return "es-US";
  if (/(?:into|in|speak|answer|continue in)\s+english\b/i.test(text))
    return "en";
}
// Language the message itself is WRITTEN in (not a requested language).
// Used so a greeting in Pashto/Dari/Spanish gets a reply in that language,
// instead of falling back to the translation-target setting.
export function detectMessageLanguage(text: string): Language | undefined {
  // Pashto-specific letters (not used in Dari/Persian).
  if (/[ټډړڼښږڅځېۍ]/.test(text)) return "ps";
  // Any other Arabic-script text defaults to Dari.
  if (/[\u0600-\u06FF]/.test(text)) return "fa-AF";
  // Spanish punctuation or unambiguous Spanish words.
  if (/[¿¡]/.test(text)) return "es-US";
  if (
    /\b(hola|gracias|buenos d[ií]as|buenas (tardes|noches)|adiós|por favor|perdón|quiero|necesito|ayuda|tengo|puedo|dime|cómo|estás|está|están|gusta|habla|español|qué|cuándo|dónde)\b/i.test(
      text,
    )
  )
    return "es-US";
  return undefined;
}
export function effectiveTask(r: ChatRequest) {
  return r.task === "auto" ? detectTask(r.message, !!r.document) : r.task;
}
export function boundedContext(messages: ChatMessage[]) {
  let count = 0;
  return messages
    .slice(-12)
    .reverse()
    .filter((m) => {
      if (count + m.content.length > 24000) return false;
      count += m.content.length;
      return true;
    })
    .reverse()
    .map(({ role, content }) => ({ role, content: content.slice(0, 12000) }));
}
export function detectLocalAction(text: string) {
  if (/^save (this|that|the) (word|term)[.!]?$/i.test(text.trim()))
    return "save";
  if (/^(show|list|find) my saved/i.test(text.trim())) return "saved";
  return null;
}
