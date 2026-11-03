export type Participant='A'|'B';
export type CallState='idle'|'consent'|'connected'|'handoff'|'ended'|'failed';
export type Session={state:CallState;consent:Record<Participant,boolean>;seen:string[];delivered:{id:string;from:Participant;to:Participant;text:string}[];events:string[];expires:number};
export function newSession(now=Date.now()):Session{return {state:'idle',consent:{A:false,B:false},seen:[],delivered:[],events:[],expires:now+120000};}
export type CallEvent={type:'tick'|'start'|'consent'|'connect'|'end'|'failure'|'handoff';participant?:Participant}|{type:'segment';id:string;participant:Participant;origin:'human'|'generated';text:string};
/** Simulation and gateway contract: no audio or network side effects. */
export function callTransition(s:Session,e:CallEvent,now=Date.now()):Session{
 if(['ended','failed'].includes(s.state))return s;
 if(now>=s.expires)return {...s,state:'ended',events:[...s.events,'timeout']};
 if(e.type==='tick')return s;
 const next={...s,events:[...s.events,e.type].slice(-100)};
 if(e.type==='end'||e.type==='failure')return {...next,state:e.type==='end'?'ended':'failed'};
 if(e.type==='start'&&s.state==='idle')return {...next,state:'consent'};
 if(e.type==='consent'&&s.state==='consent'&&e.participant)return {...next,consent:{...s.consent,[e.participant]:true}};
 if(e.type==='connect'&&s.state==='consent'&&s.consent.A&&s.consent.B)return {...next,state:'connected'};
 if(e.type==='handoff'&&s.state==='connected')return {...next,state:'handoff'};
 if(e.type==='segment'&&s.state==='connected'&&e.origin==='human'&&!s.seen.includes(e.id)&&s.seen.length<100&&e.text.length<=12000)return {...next,seen:[...s.seen,e.id],delivered:[...s.delivered,{id:e.id,from:e.participant,to:e.participant==='A'?'B':'A',text:e.text}]};
 return s;
}
