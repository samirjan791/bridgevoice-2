export const packs = {
  en: {
    id: "en",
    name: "English",
    native: "English",
    dir: "ltr",
    speech: "en-US",
    negative: /\b(not|never|no|without|don't|cannot|can't)\b/i,
  },
  "es-US": {
    id: "es-US",
    name: "Español (EE. UU.)",
    native: "Español",
    dir: "ltr",
    speech: "es-US",
    negative: /\b(no|nunca|sin|jamás|tampoco)\b/i,
  },
  ps: {
    id: "ps",
    name: "Pashto",
    native: "پښتو",
    dir: "rtl",
    speech: "ps-AF",
    negative: /(نه|مه|نشته)/,
  },
  "fa-AF": {
    id: "fa-AF",
    name: "Dari",
    native: "دری",
    dir: "rtl",
    speech: "prs-AF",
    negative: /(نه|نیست|نکن|نباید|نخور|ندار)/,
  },
} as const;
export type Language = keyof typeof packs;
