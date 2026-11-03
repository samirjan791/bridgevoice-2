import { normalizeDigits, values } from "../guard";
import { compareUnderstanding, clarificationQuestions } from "../meaning-check";
import type { Language } from "../languages";
export type ProofIssue={id:string;category:string;severity:"review"|"conflict";sourceText:string;translationText:string;message:string;question:string};
export type ProofReport={status:"No issue detected"|"Review recommended"|"Potential meaning conflict"|"Human review required";issues:ProofIssue[];questions:string[];highRisk:boolean;limits:string};
const LIMITS="Limited pattern checks, not a guarantee of equivalence or safety. Cross-language grammar, transliterated names and paraphrases require semantic and human review.";
const canonical=(s:string)=>normalizeDigits(s).toLowerCase().replace(/\s+/g," ").trim();
const list=(s:string,re:RegExp)=>[...s.matchAll(re)].map(m=>m[0]);
const sorted=(v:string[])=>JSON.stringify(v.map(canonical).sort());
export function bridgeProof(source:string,translation:string,from:Language,to:Language,protectedTerms:string[]=[]):ProofReport {
 const issues:ProofIssue[]=[];
 const highRisk=/\b(mg|mcg|dosage|dose|tablets?|medication|allerg\w*|surgery|emergency|court|deportation|legal deadline)\b|درمل|دوز|حساسیت/iu.test(source);
 const add=(id:string,category:string,message:string,a=source,b=translation,severity:"review"|"conflict"="review",question="Please confirm the original wording with the speaker.")=>issues.push({id,category,severity,sourceText:a,translationText:b,message,question});
 if(!source.trim()||!translation.trim())add("missing-text","coverage","Both the original and translation are required.");
 else {
 for(const issue of compareUnderstanding(source,translation,from,to))add(issue.id,issue.id,issue.message,source,translation,["number-mismatch","negation-mismatch","binding"].includes(issue.id)?"conflict":"review");
 const dates=/(?:\b\d{4}-\d{1,2}-\d{1,2}\b|\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b|\b\d{1,2}:\d{2}(?:\s*[ap]m)?\b|\b\d{1,2}\s*[ap]m\b)/gi;
 const a=list(normalizeDigits(source),dates),b=list(normalizeDigits(translation),dates);
 if(sorted(a)!==sorted(b))add("date-time","dates and times","Date/time notation differs. Order, AM/PM, timezone or locale may change its meaning.",source,translation,"review","What exact calendar date, time and time zone did the speaker intend?");
 const currencies=/[$€£]\s*[\d.,۰-۹٠-٩]+|[\d.,۰-۹٠-٩]+\s*(?:USD|EUR|GBP|AFN|dollars?|euros?|pounds?|afghanis?)/giu;
 const money=(s:string)=>list(s,currencies).map(x=>{const c=canonical(x);const unit=/[$]|dollar|usd/.test(c)?"USD":/[€]|euro|eur/.test(c)?"EUR":/[£]|pound|gbp/.test(c)?"GBP":"AFN";return unit+":"+(values(x)[0]?.value||c);});
 if(sorted(money(source))!==sorted(money(translation)))add("currency","currency","Currency or amount representation differs; verify both, including decimal convention.",source,translation,"review","Which currency and exact amount are intended?");
 const identifiers=/(?:\b(?:ID|reference|account|case|passport)\s*(?:number|no\.?|#|:)\s*)([\p{L}\p{N}-]+)/giu;
 for(const match of source.matchAll(identifiers))if(!canonical(translation).includes(canonical(match[1])))add(`identifier-${issues.length}`,"identifier","A labeled identifier is absent or changed.",match[0],translation,"conflict","Can you confirm this identifier character by character?");
 for(const term of protectedTerms.filter(x=>x.trim()).slice(0,20))if(source.includes(term)&&!translation.includes(term))add(`name-${issues.length}`,"name","A protected name or phrase is not an exact match. Transliteration may be legitimate.",term,translation,"review","Confirm the person's name or identifier with them.");
 if(from==="en"&&to==="en") {
 const labeledNames=/\b(?:name|patient|customer)\s*:\s*([A-Z][a-z]+(?: [A-Z][a-z]+){0,2})/g;
 for(const m of source.matchAll(labeledNames))if(!canonical(translation).includes(canonical(m[1])))add(`named-${issues.length}`,"name","A labeled person's name may have changed.",m[0],translation);
 const verbs=/\b(?:bring|contact|call|return|take|stop|start|submit|sign|pay|wait|avoid)\b/gi;
 for(const sentence of source.split(/(?<=[.!?])\s+/)) {
 const actions=list(sentence,verbs).map(canonical);
 if(actions.length&&actions.every(v=>!new RegExp(`\\b${v}\\b`,"i").test(translation)))add(`instruction-${issues.length}`,"instruction","An instruction's action is not found. It may be omitted or paraphrased.",sentence,translation,"review","Was this instruction intentionally reworded or omitted?");
 }
 for(const [x,y] of [["before","after"],["increase","decrease"],["start","stop"]])if(new RegExp(`\\b${x}\\b`,"i").test(source)&&new RegExp(`\\b${y}\\b`,"i").test(translation)&&!new RegExp(`\\b${x}\\b`,"i").test(translation))add(`reversal-${x}`,"instruction direction",`“${x}” may have become “${y}”.`,source,translation,"conflict");
 }
 // Counts are only a prompt for review, never a claim of semantic omission.
 if(source.split(/\s+/).length>12&&translation.split(/\s+/).length<source.split(/\s+/).length*.35&&from===to)add("coverage","possible omission","The translation is much shorter; important information may be omitted.");
 if(values(source).some(v=>/[,٬]/.test(v.sourceText)))add("decimal","number format","Decimal/grouping notation requires locale-aware confirmation.",source,translation);
 }
 const questions=[...new Set([...clarificationQuestions(source),...issues.map(i=>i.question)])];
 return {status:highRisk?"Human review required":issues.some(i=>i.severity==="conflict")?"Potential meaning conflict":issues.length?"Review recommended":"No issue detected",issues,questions,highRisk,limits:LIMITS};
}
