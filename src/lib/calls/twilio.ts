// SERVER ONLY. Imported exclusively by server routes/tests; never by client components.
import {createHmac,timingSafeEqual} from 'node:crypto';
export function validTwilioSignature(url:string,fields:URLSearchParams,signature:string,token:string){
 if(!token||!signature||[...fields.keys()].some(k=>fields.getAll(k).length!==1))return false;
 const payload=url+[...fields.keys()].sort().map(k=>k+fields.get(k)).join('');
 const expected=Buffer.from(createHmac('sha1',token).update(payload).digest('base64'));
 const supplied=Buffer.from(signature);return expected.length===supplied.length&&timingSafeEqual(expected,supplied);
}
export interface TelephoneProvider {createParticipant(input:{to:string;authorized:boolean;consent:boolean;seconds:number}):Promise<string>;endParticipant(id:string):Promise<void>}
export type TwilioConfig={enabled:boolean;sid:string;token:string;from:string;callback:string;twiml:string;allowed:string[];maxParticipants:number;maxReservedUsd:number;estimatedUsdPerMinute:number};
/** REST adapter only. No route activates creation until a verified media gateway exists. */
export class TwilioAdapter implements TelephoneProvider {
 private active=new Set<string>();private attempts:number[]=[];private reserved=0;private pending=0;
 constructor(private config:TwilioConfig,private transport:typeof fetch=fetch){}
 async createParticipant(input:{to:string;authorized:boolean;consent:boolean;seconds:number}){
  const c=this.config;this.attempts=this.attempts.filter(t=>t>Date.now()-60000);
  const reserve=c.estimatedUsdPerMinute*input.seconds/60;
  if(!c.enabled||!input.authorized||!input.consent)throw Error('Call creation is disabled or unauthorized.');
  if(!/^AC[a-f0-9]{32}$/i.test(c.sid)||!c.token||!/^\+[1-9]\d{7,14}$/.test(input.to)||!c.allowed.includes(input.to)||!/^\+[1-9]\d{7,14}$/.test(c.from))throw Error('Invalid call configuration.');
  if(!Number.isFinite(input.seconds)||input.seconds<1||input.seconds>120||!Number.isFinite(reserve)||reserve<=0||!Number.isFinite(c.maxReservedUsd)||c.maxReservedUsd<=0||this.reserved+reserve>c.maxReservedUsd||this.attempts.length>=2||!Number.isInteger(c.maxParticipants)||c.maxParticipants<1||this.active.size+this.pending>=Math.min(2,c.maxParticipants))throw Error('Call limit or reserved budget exceeded.');
  if(!c.callback.startsWith('https://')||!c.twiml.startsWith('https://'))throw Error('HTTPS callback required.');
  this.attempts.push(Date.now());this.reserved+=reserve;this.pending++;
  try{
  const response=await this.transport(`https://api.twilio.com/2010-04-01/Accounts/${c.sid}/Calls.json`,{method:'POST',redirect:'error',headers:{Authorization:'Basic '+Buffer.from(c.sid+':'+c.token).toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({To:input.to,From:c.from,Url:c.twiml,StatusCallback:c.callback,TimeLimit:String(Math.floor(input.seconds)),Record:'false'}),signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw Error('Telephone provider rejected creation. Budget reservation retained; reconcile provider status before retry.');
  const body=await response.json();if(!/^CA[a-f0-9]{32}$/i.test(body.sid||''))throw Error('Invalid provider response.');this.active.add(body.sid);return body.sid as string;}finally{this.pending--;}
 }
 async endParticipant(id:string){if(!this.active.has(id))throw Error('Unknown participant.');const c=this.config;const r=await this.transport(`https://api.twilio.com/2010-04-01/Accounts/${c.sid}/Calls/${id}.json`,{method:'POST',redirect:'error',headers:{Authorization:'Basic '+Buffer.from(c.sid+':'+c.token).toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({Status:'completed'}),signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Termination failed; use the provider console and reconcile.');this.active.delete(id);}
}
