import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  extractDocument,
  validateFile,
  capPages,
} from "@/lib/documents/extract";
it("extracts UTF8 TXT without inventing a deadline", async () => {
  const d = await extractDocument(
    "letter.txt",
    Buffer.from("Meeting: November 3, 2026."),
  );
  expect(d.pages[0].text).toContain("November 3");
});
it("extracts a real text PDF", async () => {
  const d = await extractDocument(
    "letter.pdf",
    readFileSync("public/examples/school-letter.pdf"),
  );
  expect(d.pages[0].text).toContain("November 3");
});
it("extracts a real DOCX", async () => {
  const d = await extractDocument(
    "letter.docx",
    readFileSync("public/examples/school-letter.docx"),
  );
  expect(d.pages[0].text).toContain("November 3");
});
it("rejects unsupported, oversized and mismatched files", () => {
  expect(() => validateFile("a.exe", 10, "")).toThrow("Supported");
  expect(() => validateFile("a.pdf", 5000000, "")).toThrow("4 MB");
  expect(() => validateFile("a.pdf", 10, "image/png")).toThrow("match");
});
it("rejects invalid PDF and DOCX bytes", async () => {
  await expect(extractDocument("a.pdf", Buffer.from("fake"))).rejects.toThrow(
    "valid PDF",
  );
  await expect(extractDocument("a.docx", Buffer.from("fake"))).rejects.toThrow(
    "Invalid DOCX",
  );
});
it("rejects binary or invalid UTF8 TXT", async () => {
  await expect(
    extractDocument("a.txt", Buffer.from([255, 255])),
  ).rejects.toThrow("UTF-8");
  await expect(extractDocument("a.txt", Buffer.from("a\0b"))).rejects.toThrow(
    "binary",
  );
});
it("rejects empty extracted content rather than inventing OCR", () =>
  expect(() => capPages("scan.pdf", [{ number: 1, text: " " }])).toThrow(
    "OCR",
  ));
it("caps document context and indicates truncation", () => {
  const d = capPages("a.txt", [{ number: 1, text: "x".repeat(25000) }]);
  expect(d.truncated).toBe(true);
  expect(d.pages[0].text).toHaveLength(24000);
});
