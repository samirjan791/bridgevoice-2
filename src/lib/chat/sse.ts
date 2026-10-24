export async function* sseData(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader(),
    decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        buffer += decoder.decode();
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      if (buffer.length > 200000) throw new Error("Oversized stream event");
      let pos;
      while ((pos = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, pos).trimEnd();
        buffer = buffer.slice(pos + 1);
        if (line.startsWith("data:")) {
          const data = line.slice(5).trim();
          if (data && data !== "[DONE]") yield JSON.parse(data);
        }
      }
    }
    if (buffer.startsWith("data:")) {
      const data = buffer.slice(5).trim();
      if (data && data !== "[DONE]") yield JSON.parse(data);
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
// Extract only the provisional answer string, never reasoning or other JSON fields.
export function partialAnswer(raw: string) {
  const match = /"answer"\s*:\s*"/.exec(raw);
  if (!match) return "";
  const start = match.index + match[0].length;
  let end = start;
  for (; end < raw.length; end++) {
    if (raw[end] === '"') break;
    if (raw[end] === "\\") {
      if (end + 1 >= raw.length) break;
      if (raw[end + 1] === "u") {
        if (end + 5 >= raw.length) break;
        end += 5;
      } else end++;
    }
  }
  try {
    return JSON.parse('"' + raw.slice(start, end) + '"') as string;
  } catch {
    return "";
  }
}
