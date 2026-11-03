import { NextRequest } from "next/server";
let active = 0,
  count = 0,
  start = Date.now();
export function admit(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin) {
    let allowed = false;
    try {
      const browser = new URL(origin);
      const server = new URL(req.url);
      // Next.js may bind to 127.0.0.1 while the browser uses localhost.
      // Treat only these two loopback names as equivalent, on the SAME port.
      const loopback = (name: string) =>
        name === "localhost" || name === "127.0.0.1" || name === "[::1]";
      allowed =
        browser.origin === server.origin ||
        (loopback(browser.hostname) &&
          loopback(server.hostname) &&
          browser.port === server.port &&
          browser.protocol === server.protocol);
    } catch {
      allowed = false;
    }
    if (!allowed)
      return { error: "Cross-origin request blocked.", status: 403 };
  }
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
  let released=false;
  return {
    release: () => {
      if(released)return;released=true;
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

// Local-process safety budget. For multi-instance production use a durable shared quota.
let modelCallsToday=0;
let modelDay=new Date().toISOString().slice(0,10);
export function reserveModelCall(){
 const day=new Date().toISOString().slice(0,10);
 if(day!==modelDay){modelDay=day;modelCallsToday=0;}
 const limit=Math.max(1,Math.min(10000,Number(process.env.BRIDGEVOICE_MAX_MODEL_CALLS_PER_DAY||100)));
 if(modelCallsToday>=limit)return false;
 modelCallsToday++;return true;
}
