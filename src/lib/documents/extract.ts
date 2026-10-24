import yauzl from "yauzl";
import type { DocumentText } from "../chat/schema";
export const MAX_FILE_BYTES = 4 * 1024 * 1024;
export function validateFile(name: string, size: number, mime: string) {
  const ext = name.split(".").at(-1)?.toLowerCase();
  if (!["pdf", "docx", "txt"].includes(ext || ""))
    throw new Error(
      "Supported files: PDF, DOCX and TXT. Images and OCR are not supported.",
    );
  if (size === 0 || size > MAX_FILE_BYTES)
    throw new Error("Choose a nonempty document smaller than 4 MB.");
  const allowed: Record<string, string[]> = {
    pdf: ["application/pdf"],
    txt: ["text/plain"],
    docx: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  };
  if (
    mime &&
    !allowed[ext!].includes(mime) &&
    mime !== "application/octet-stream"
  )
    throw new Error("The file type does not match its extension.");
  return ext!;
}
export function inspectDocx(data: Buffer) {
  return new Promise<void>((resolve, reject) => {
    yauzl.fromBuffer(data, { lazyEntries: true }, (error, zip) => {
      if (error || !zip) {
        reject(new Error("Invalid DOCX archive."));
        return;
      }
      let total = 0,
        count = 0,
        hasDocument = false;
      let failed = false;
      const fail = () => {
        failed = true;
        zip.close();
        reject(new Error("Unsafe or oversized DOCX archive."));
      };
      zip.on("error", fail);
      zip.on("entry", (entry) => {
        total += entry.uncompressedSize;
        count++;
        if (
          total > 20 * 1024 * 1024 ||
          count > 500 ||
          entry.generalPurposeBitFlag & 1 ||
          entry.fileName.includes("..")
        ) {
          fail();
          return;
        }
        if (entry.fileName === "word/document.xml") hasDocument = true;
        zip.readEntry();
      });
      zip.on("end", () => {
        if (!failed) {
          if (hasDocument) resolve();
          else reject(new Error("This is not a readable Word document."));
        }
      });
      zip.readEntry();
    });
  });
}
export function capPages(
  name: string,
  pages: { number: number; text: string }[],
): DocumentText {
  let left = 24000,
    truncated = pages.length > 30;
  const out = [];
  for (const page of pages.slice(0, 30)) {
    if (!left) {
      truncated = true;
      break;
    }
    const text = page.text.replace(/\u0000/g, "").trim();
    if (!text) continue;
    out.push({ number: page.number, text: text.slice(0, left) });
    if (text.length > left) truncated = true;
    left -= Math.min(text.length, left);
  }
  if (!out.length)
    throw new Error(
      "No readable text found. Scanned PDFs need OCR, which is not included.",
    );
  return { name: name.slice(0, 200), pages: out, truncated };
}
export async function extractDocument(
  name: string,
  data: Buffer,
  mime = "",
): Promise<DocumentText> {
  const ext = validateFile(name, data.length, mime);
  if (ext === "txt") {
    let text;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(data);
    } catch {
      throw new Error("TXT files must use UTF-8 encoding.");
    }
    if (text.includes("\u0000"))
      throw new Error("This TXT appears to contain binary data.");
    return capPages(name, [{ number: 1, text }]);
  }
  if (ext === "docx") {
    await inspectDocx(data);
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer: data });
    return capPages(name, [{ number: 1, text: result.value }]);
  }
  if (!data.subarray(0, 1024).toString("ascii").includes("%PDF-"))
    throw new Error("The file is not a valid PDF.");
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({
    data: new Uint8Array(data),
    isEvalSupported: false,
  });
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      parser.getText({ first: 30 }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          void parser.destroy();
          reject(new Error("PDF extraction timed out. Try a smaller file."));
        }, 15000);
      }),
    ]);
    const doc = capPages(
      name,
      result.pages.map((p) => ({ number: p.num, text: p.text })),
    );
    if (result.total > 30) doc.truncated = true;
    return doc;
  } finally {
    if (timer) clearTimeout(timer);
    await parser.destroy().catch(() => {});
  }
}
