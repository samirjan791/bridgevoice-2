/** Website delivery: the model returns a complete single-file HTML document
 * inside one ```html fenced block in its answer. These helpers split that
 * block out so the UI can render it as a live sandboxed preview (plus
 * download/copy) instead of dumping pages of code into the chat, and so
 * voice replies never read code aloud. */

const HTML_FENCE = /```html\s*([\s\S]*?)```/gi;

export function extractWebsites(text: string): {
  text: string;
  sites: string[];
} {
  const sites: string[] = [];
  const cleaned = text.replace(HTML_FENCE, (_match, code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return "";
    sites.push(trimmed);
    return "[Website preview below.]";
  });
  return { text: cleaned.replace(/\n{3,}/g, "\n\n").trim(), sites };
}

/** Remove every fenced code block, for spoken replies and read-aloud. */
export function stripCodeBlocks(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function websiteFileName(index: number): string {
  return index === 0 ? "website.html" : `website-${index + 1}.html`;
}
