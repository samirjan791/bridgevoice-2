import { NextRequest } from "next/server";
let active = 0,
  count = 0,
  start = Date.now();
export function admit(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin)
    return { error: "Cross-origin request blocked.", status: 403 };
  if (
    process.env.BRIDGEVOICE_ACCESS_TOKEN &&
    req.headers.get("x-bridgevoice-access") !==
      process.env.BRIDGEVOICE_ACCESS_TOKEN
  )
    return {
      error: "This deployment requires its access code. Enter it in Settings.",
      status: 401,
    };
  if (Date.now() - start > 60000) {
    start = Date.now();
    count = 0;
  }
  if (count >= 30 || active >= 3)
    return { error: "Too many requests. Please wait a moment.", status: 429 };
  count++;
  active++;
  return {
    release: () => {
      active = Math.max(0, active - 1);
    },
  };
}
export async function limitedBody(req: Request, max: number) {
  if (Number(req.headers.get("content-length") || 0) > max)
    throw new Error("Request too large");
  const reader = req.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > max) throw new Error("Request too large");
      chunks.push(value);
    }
    const out = new Uint8Array(size);
    let i = 0;
    for (const c of chunks) {
      out.set(c, i);
      i += c.length;
    }
    return out;
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
