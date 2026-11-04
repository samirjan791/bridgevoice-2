import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
export async function POST(req: NextRequest) {
 const expected = process.env.BRIDGEVOICE_ACCESS_TOKEN;
 if (!expected) return NextResponse.json({accepted:false,error:"Private access is not configured"},{status:503,headers:{"Cache-Control":"no-store"}});
 const supplied = req.headers.get("x-bridgevoice-access") || "";
 const a = Buffer.from(expected), b = Buffer.from(supplied);
 const valid = a.length === b.length && timingSafeEqual(a,b);
 return NextResponse.json({accepted:valid},{status:valid?200:401,headers:{"Cache-Control":"no-store"}});
}
