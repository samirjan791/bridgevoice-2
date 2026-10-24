import { NextResponse } from "next/server";
export function GET() {
  return NextResponse.json(
    {
      configured: !!(process.env.MODEL_API_KEY || process.env.META_API_KEY),
      model: process.env.META_MODEL_ID || "muse-spark-1.3",
      verified: false,
      accessProtected: !!process.env.BRIDGEVOICE_ACCESS_TOKEN,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
