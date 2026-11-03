import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { admit, limitedBody } from "@/lib/server-security";
import { speechSSML } from "@/lib/voice-support";
export const runtime = "nodejs";
export const maxDuration = 40;
const schema = z.object({
  text: z.string().trim().min(1).max(6000),
  language: z.enum(["en", "ps", "fa-AF", "es-US"]),
  allowPersian: z.boolean().default(false),
  consent: z.literal(true),
});
export function GET() {
  return NextResponse.json(
    {
      configured: !!(
        process.env.AZURE_SPEECH_KEY &&
        /^[a-z0-9]+$/.test(process.env.AZURE_SPEECH_REGION || "")
      ),
      dariVoice: "Persian (Iran) fallback only; explicit consent required",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(req: NextRequest) {
  const gate = admit(req);
  if (gate.error)
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const data = schema.safeParse(
      JSON.parse(new TextDecoder().decode(await limitedBody(req, 40000))),
    );
    if (!data.success)
      return NextResponse.json(
        {
          error:
            "Provide 1–6,000 characters, a supported language and speech-processing consent.",
        },
        { status: 400 },
      );
    if (data.data.language === "fa-AF" && !data.data.allowPersian)
      return NextResponse.json(
        {
          error:
            "A native Dari voice is not configured. Persian pronunciation requires your explicit agreement.",
        },
        { status: 422 },
      );
    const key = process.env.AZURE_SPEECH_KEY,
      region = process.env.AZURE_SPEECH_REGION;
    if (!key || !region || !/^[a-z0-9]+$/.test(region))
      return NextResponse.json(
        {
          error:
            "Cloud voice is not configured. Add AZURE_SPEECH_KEY and AZURE_SPEECH_REGION privately to .env.local, then restart.",
        },
        { status: 503 },
      );
    const response = await fetch(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
          "User-Agent": "BridgeVoice",
        },
        body: speechSSML(data.data.text, data.data.language),
        signal: AbortSignal.any([req.signal, AbortSignal.timeout(30000)]),
        cache: "no-store",
      },
    );
    if (!response.ok)
      return NextResponse.json(
        {
          error:
            response.status === 401 || response.status === 403
              ? "Azure rejected the speech credentials. Check the key and resource region."
              : response.status === 429
                ? "Speech service is busy. Wait and try again."
                : "Speech generation failed. Check voice availability in your Azure region.",
        },
        { status: response.status === 429 ? 429 : 502 },
      );
    const audio = await response.arrayBuffer();
    if (!audio.byteLength || audio.byteLength > 8 * 1024 * 1024)
      throw new Error("Invalid audio");
    return new Response(audio, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Speech request failed or timed out. Your text is unchanged; please retry.",
      },
      { status: 502 },
    );
  } finally {
    gate.release!();
  }
}
