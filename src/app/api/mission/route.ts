import { NextRequest, NextResponse } from "next/server";
import { admit, limitedBody } from "@/lib/server-security";
import { missionSchema, runMission } from "@/lib/agent/mission";
import { metaConfig } from "@/lib/chat/meta";
export const runtime = "nodejs";
export const maxDuration = 240;
export async function POST(req: NextRequest) {
 const gate = admit(req);
 if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });
 let input;
 try {
  input = missionSchema.parse(JSON.parse(new TextDecoder().decode(await limitedBody(req, 30000))));
  metaConfig();
 } catch {
  gate.release?.();
  return NextResponse.json({error:"Invalid mission or service temporarily unavailable."}, {status:400});
 }
 const encoder = new TextEncoder();
 let closed = false;
 const abort = new AbortController();
 const signal = AbortSignal.any([req.signal, abort.signal]);
 return new Response(new ReadableStream({
  async start(controller) {
   const emit = (event: unknown) => { if (!closed) controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`)); };
   try {
    await runMission(input, signal, stage => emit({type:"stage",stage}));
    emit({type:"done"});
   } catch (e) { if (!signal.aborted) emit({type:"error",error:e instanceof Error ? e.message : "Mission failed"}); }
   finally { gate.release?.(); if (!closed) {closed=true;controller.close();} }
  },
  cancel() {closed=true;abort.abort();}
 }), {headers:{"Content-Type":"text/event-stream; charset=utf-8","Cache-Control":"no-store","X-Accel-Buffering":"no"}});
}
