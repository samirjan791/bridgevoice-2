import type {Language} from './languages';
export const speechLocale:Record<Language,string>={en:'en-US',ps:'ps-AF','fa-AF':'prs-AF','es-US':'es-US'};
export type InputCapability={language:Language;status:'available'|'unverified'|'unavailable';detail:string};
type RecognitionAPI={available?:(options:{langs:string[];processLocally:boolean;quality?:"conversation"})=>Promise<string>};
export async function detectSpeechInputs(api:RecognitionAPI|undefined):Promise<InputCapability[]>{
 return Promise.all((Object.keys(speechLocale) as Language[]).map(async language=>{
 if(!api)return {language,status:'unavailable' as const,detail:'Speech recognition is unavailable in this browser. Type instead.'};
 if(!api.available)return {language,status:'unverified' as const,detail:'Browser exposes recognition but cannot report language support. A device trial is required.'};
 try {const status=await api.available({langs:[speechLocale[language]],processLocally:false,quality:"conversation"});return {language,status:status==='available'?'available' as const:status==='unavailable'?'unavailable' as const:'unverified' as const,detail:`Browser reports: ${status}. This is not a pronunciation or accuracy evaluation.`};}
 catch{return {language,status:'unverified' as const,detail:'Language availability could not be queried. Type instead or test on your device.'};}
 }));
}
