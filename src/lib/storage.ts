import { importSchema, Entry } from "./schema";
export const STORAGE_KEY = "bridgevoice.glossary.v1";
export function readSaved(): Entry[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? importSchema.parse(JSON.parse(raw)) : [];
}
export function writeSaved(entries: Entry[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(importSchema.parse(entries)),
  );
  window.dispatchEvent(new Event("bv-glossary"));
}
export function mergeEntries(existing: Entry[], incoming: Entry[]) {
  const seen = new Set(existing.map((e) => e.en.trim().toLowerCase()));
  const ids = new Set(existing.map((e) => e.id));
  return [
    ...existing,
    ...incoming.filter((e) => {
      const k = e.en.trim().toLowerCase();
      if (seen.has(k) || ids.has(e.id)) return false;
      seen.add(k);
      ids.add(e.id);
      return true;
    }),
  ];
}
export function saveEntry(entry: Entry) {
  const old = readSaved();
  writeSaved(mergeEntries(old, [entry]));
}
export function parseImport(text: string) {
  if (text.length > 2000000)
    throw new Error("Import must be smaller than 2 MB.");
  return importSchema.parse(JSON.parse(text));
}
export function csv(entries: Entry[]) {
  const fields = [
    "en",
    "ps",
    "fa-AF",
    "explanation",
    "domain",
    "example",
    "source",
    "reviewStatus",
    "notes",
  ] as const;
  const cell = (s: string) =>
    '"' + (/^[=+@\-\t\r]/.test(s) ? "'" + s : s).replaceAll('"', '""') + '"';
  return [
    fields.join(","),
    ...entries.map((e) =>
      fields.map((f) => cell(String(e[f] || ""))).join(","),
    ),
  ].join("\r\n");
}
export function download(name: string, data: string, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
