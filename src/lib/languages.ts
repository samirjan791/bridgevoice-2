export const packs = {
  en: {
    id: "en",
    name: "English",
    native: "English",
    dir: "ltr",
    speech: "en-US",
    negative: /\b(not|never|no|without|don't|cannot|can't)\b/i,
  },
  ps: {
    id: "ps",
    name: "Pashto",
    native: "پښتو",
    dir: "rtl",
    speech: null,
    negative: /(نه|مه|نشته)/,
  },
  "fa-AF": {
    id: "fa-AF",
    name: "Dari",
    native: "دری",
    dir: "rtl",
    speech: null,
    negative: /(نه|نیست|نکن|نباید|نخور|ندار)/,
  },
} as const;
export type Language = keyof typeof packs;
