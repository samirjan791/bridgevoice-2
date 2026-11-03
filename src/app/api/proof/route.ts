import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {language} from "@/lib/schema";
import {admit,limitedBody} from "@/lib/server-security";
import {metaChat} from "@/lib/chat/meta";
import {chatRequestSchema} from "@/lib/chat/schema";
export const runtime="nodejs";
const schema=z.object({source:z.string().trim().min(1).max(12000),translation:z.string().trim().min(1).max(12000),from:language,to:language});
export async function POST(req:NextRequest){const gate=admit(req);if(gate.error)return NextResponse.json({error:gate.error},{status:gate.status});try{
 const p=schema.safeParse(JSON.parse(new TextDecoder().decode(await limitedBody(req,110000))));if(!p.success)return NextResponse.json({error:'Provide the original, translation and both languages.'},{status:400});
 const result=await metaChat(chatRequestSchema.parse({message:'Separately compare the supplied translation against the original. Check omissions, additions, actors, negation scope, dates, names, currency, quantities and instructions. Quote exact supporting source wording. Ask clarification questions when uncertain. Never certify accuracy or assign confidence percentages.',original:p.data.source,proposed:p.data.translation,sourceLanguage:p.data.from,language:p.data.to,task:'compare'}),req.signal,()=>{});
 return NextResponse.json({summary:result.answer,findings:result.warnings.map(w=>w.message),reviewStatus:result.warnings.some(w=>w.priority==="critical")?"Human review required":result.warnings.length?"Review recommended":"No issue detected",provider:result.provider,latencyMs:result.latencyMs,usage:result.usage},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'Separate Meta review unavailable. Local findings remain valid for review; no semantic result was accepted.'},{status:502});}finally{gate.release!();}}
