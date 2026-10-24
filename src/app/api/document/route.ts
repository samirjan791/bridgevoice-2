import { NextRequest, NextResponse } from "next/server";
import { admit, limitedBody } from "@/lib/server-security";
import { extractDocument, MAX_FILE_BYTES } from "@/lib/documents/extract";
export const runtime = "nodejs";
export const maxDuration = 30;
export async function POST(req: NextRequest) {
  const gate = admit(req);
  if (gate.error)
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const bytes = await limitedBody(req, MAX_FILE_BYTES + 20000);
    const form = await new Response(bytes, {
      headers: { "Content-Type": req.headers.get("content-type") || "" },
    }).formData();
    const file = form.get("file");
    if (!(file instanceof File))
      return NextResponse.json(
        { error: "Choose one supported document." },
        { status: 400 },
      );
    const result = await extractDocument(
      file.name,
      Buffer.from(await file.arrayBuffer()),
      file.type,
    );
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    return NextResponse.json(
      {
        error:
          /^(Supported files|Choose a nonempty|The file type|Invalid DOCX|Unsafe or oversized|This is not|No readable|TXT files|This TXT|The file is not|PDF extraction)/.test(
            message,
          )
            ? message
            : "Document extraction failed. Try an unlocked text-based PDF, DOCX or UTF-8 TXT under 4 MB.",
      },
      { status: 400 },
    );
  } finally {
    gate.release!();
  }
}
