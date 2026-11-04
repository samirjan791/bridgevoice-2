"use client";
import { useState } from "react";
import { websiteFileName } from "@/lib/website";

/**
 * Live preview of a model-built single-file website. The iframe is sandboxed
 * with scripts only and NO same-origin access, so the preview runs isolated
 * from this page: it cannot read the app's storage, cookies, or DOM, and it
 * cannot navigate the top page. Download hands the user a plain .html file;
 * nothing is published anywhere.
 */
export function WebsitePreview({
  html,
  index,
}: {
  html: string;
  index: number;
}) {
  const [copied, setCopied] = useState(false);
  const fileName = websiteFileName(index);
  const download = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
    } catch {
      /* clipboard unavailable; the code is still visible under View code */
    }
  };
  return (
    <section className="website-preview" aria-label="Website preview">
      <div className="website-preview-head">
        <strong>Website preview</strong>
        <span>Live preview · runs sandboxed on this page only</span>
      </div>
      <iframe title={fileName} sandbox="allow-scripts" srcDoc={html} />
      <div className="website-actions">
        <button type="button" onClick={download}>
          Download {fileName}
        </button>
        <button type="button" onClick={copy}>
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
      <details className="website-code">
        <summary>View code</summary>
        <pre>{html}</pre>
      </details>
    </section>
  );
}
