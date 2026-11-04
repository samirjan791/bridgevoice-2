import { describe, it, expect } from "vitest";
import {
  extractWebsites,
  stripCodeBlocks,
  websiteFileName,
} from "../src/lib/website";

const SITE = "<!doctype html><html><body><h1>Sample</h1></body></html>";

describe("extractWebsites", () => {
  it("pulls one html block out and leaves a placeholder sentence", () => {
    const { text, sites } = extractWebsites(
      `Here is your site:\n\`\`\`html\n${SITE}\n\`\`\``,
    );
    expect(sites).toEqual([SITE]);
    expect(text).toContain("Here is your site:");
    expect(text).toContain("[Website preview below.]");
    expect(text).not.toContain("<h1>Sample</h1>");
  });

  it("pulls several blocks in order", () => {
    const { sites } = extractWebsites(
      `\`\`\`html\n${SITE}\n\`\`\`\nand another\n\`\`\`html\n<p>two</p>\n\`\`\``,
    );
    expect(sites).toEqual([SITE, "<p>two</p>"]);
  });

  it("passes text without a block through unchanged", () => {
    const { text, sites } = extractWebsites("Just a normal answer.");
    expect(sites).toEqual([]);
    expect(text).toBe("Just a normal answer.");
  });

  it("ignores an empty html block", () => {
    const { sites } = extractWebsites("```html\n```");
    expect(sites).toEqual([]);
  });
});

describe("stripCodeBlocks", () => {
  it("removes fenced blocks so voice never reads code aloud", () => {
    expect(
      stripCodeBlocks(`Done — here it is:\n\`\`\`html\n${SITE}\n\`\`\``),
    ).toBe("Done — here it is:");
  });

  it("keeps plain text untouched", () => {
    expect(stripCodeBlocks("Hello there.")).toBe("Hello there.");
  });
});

describe("websiteFileName", () => {
  it("names the first site website.html and later ones numbered", () => {
    expect(websiteFileName(0)).toBe("website.html");
    expect(websiteFileName(1)).toBe("website-2.html");
  });
});
