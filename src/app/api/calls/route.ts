import {NextRequest,NextResponse} from 'next/server';
import {admit} from '@/lib/server-security';
export function GET(){return NextResponse.json({enabled:false,status:process.env.ENABLE_BRIDGE_CALLS==='true'?'blocked':'disabled',reason:'Live calling requires a separately deployed, verified participant-isolated media gateway. This build provides simulation and adapter tests only.'},{headers:{'Cache-Control':'no-store'}});}
export async function POST(req:NextRequest){
 if(process.env.ENABLE_BRIDGE_CALLS!=='true')return NextResponse.json({error:'BridgeCall is disabled.'},{status:403});
 if(!process.env.BRIDGEVOICE_ACCESS_TOKEN)return NextResponse.json({error:'Private access control is required.'},{status:503});
 const gate=admit(req);if(gate.error)return NextResponse.json({error:gate.error},{status:gate.status});
 try{return NextResponse.json({error:'No verified media gateway. No call was placed.'},{status:501});}finally{gate.release!();}
}
