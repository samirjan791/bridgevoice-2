// Test-only response factory. Never imported by application code.
import { ChatRequest } from '@/lib/chat/schema';
import { finalizeResult } from '@/lib/chat/result';
import { matchGlossary } from '@/lib/glossary';
export function apiResult(r: ChatRequest) {
 return finalizeResult({answer:'Mocked API answer for automated testing.',sourcePassage:r.original||r.message,translation:'',terms:matchGlossary(r.original||r.message,r.sourceLanguage).slice(0,6),warnings:[],sources:[],followUps:[]},r,'Meta · mocked test transport',performance.now());
}
