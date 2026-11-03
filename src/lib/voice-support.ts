import type { Language } from "./languages";
export function selectVoice<T extends { lang: string }>(
  voices: T[],
  language: Language,
  allowPersian = false,
): T | undefined {
  const normalize = (s: string) => s.toLowerCase().replaceAll("_", "-");
  if (language === "fa-AF") {
    return (
      voices.find((v) =>
        ["fa-af", "prs", "prs-af"].includes(normalize(v.lang)),
      ) ||
      (allowPersian
        ? voices.find((v) => normalize(v.lang).startsWith("fa"))
        : undefined)
    );
  }
  const prefix = language.split("-")[0];
  return (
    voices.find((v) => normalize(v.lang) === normalize(language)) ||
    voices.find((v) => normalize(v.lang).split("-")[0] === prefix)
  );
}
export const cloudVoices = {
  en: { name: "en-US-JennyNeural", locale: "en-US" },
  ps: { name: "ps-AF-LatifaNeural", locale: "ps-AF" },
  "es-US": { name: "es-ES-ElviraNeural", locale: "es-ES" },
  "fa-AF": { name: "fa-IR-DilaraNeural", locale: "fa-IR" },
} as const;
export function escapeSSML(text: string) {
  return text.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
}
export function speechSSML(text: string, language: Language) {
  const v = cloudVoices[language];
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${v.locale}"><voice name="${v.name}">${escapeSSML(text)}</voice></speak>`;
}
