import {NextRequest,NextResponse} from 'next/server';
import {limitedBody} from '@/lib/server-security';
import {validTwilioSignature} from '@/lib/calls/twilio';
export const runtime='nodejs';
export async function POST(req:NextRequest){
 if(process.env.ENABLE_BRIDGE_CALLS!=='true')return NextResponse.json({error:'Calls disabled.'},{status:403});
 const url=process.env.TWILIO_WEBHOOK_URL,token=process.env.TWILIO_AUTH_TOKEN;
 if(!url?.startsWith('https://')||!token)return NextResponse.json({error:'Webhook configuration unavailable.'},{status:503});
 try{if(!req.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded'))throw Error();
 const fields=new URLSearchParams(new TextDecoder().decode(await limitedBody(req,16000)));
 if(!validTwilioSignature(url,fields,req.headers.get('x-twilio-signature')||'',token))return NextResponse.json({error:'Invalid webhook signature.'},{status:403});
 // Fail closed: authenticated events are not treated as delivered calls.
 return NextResponse.json({error:'Media gateway and durable call registry not configured.'},{status:503});
 }catch{return NextResponse.json({error:'Invalid webhook body.'},{status:400});}
}
