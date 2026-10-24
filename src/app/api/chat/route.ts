import { NextRequest, NextResponse } from "next/server";
import { chatRequestSchema } from "@/lib/chat/schema";
import { metaChat, metaConfig, ChatError } from "@/lib/chat/meta";
import { admit, limitedBody } from "@/lib/server-security";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(req: NextRequest) {
  const gate = admit(req);
  if (gate.error)
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  let parsed;
  try {
    const body = await limitedBody(req, 180000);
    parsed = chatRequestSchema.safeParse(
      JSON.parse(new TextDecoder().decode(body)),
    );
    if (!parsed.success) {
      gate.release!();
      return NextResponse.json(
        { error: "Please check the message, language pair and context size." },
        { status: 400 },
      );
    }
    metaConfig();
  } catch (e) {
    gate.release!();
    return NextResponse.json(
      {
        error:
          e instanceof ChatError ? e.message : "Invalid or oversized request.",
      },
      { status: e instanceof ChatError ? e.status : 400 },
    );
  }
  const encoder = new TextEncoder(),
    controller = new AbortController(),
    signal = AbortSignal.any([req.signal, controller.signal]);
  const request = parsed.data;
  let open = true;
  return new Response(
    new ReadableStream({
      async start(stream) {
        const emit = (data: unknown) => {
          if (open)
            stream.enqueue(
              encoder.encode("data: " + JSON.stringify(data) + "\n\n"),
            );
        };
        try {
          const result = await metaChat(request, signal, (draft) =>
            emit({ type: "draft", text: draft }),
          );
          emit({ type: "result", result });
        } catch (e) {
          if (!signal.aborted)
            emit({
              type: "error",
              error:
                e instanceof Error ? e.message : "Unable to complete response.",
            });
        } finally {
          gate.release!();
          if (open) {
            open = false;
            stream.close();
          }
        }
      },
      cancel() {
        open = false;
        controller.abort();
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    },
  );
}
