import {it,expect} from 'vitest';
import {detectSpeechInputs} from '@/lib/speech-capabilities';
it('does not infer language recognition from API existence',async()=>{expect((await detectSpeechInputs(undefined)).every(c=>c.status==='unavailable')).toBe(true);expect((await detectSpeechInputs({})).every(c=>c.status==='unverified')).toBe(true);});
it('queries each locale and distinguishes unavailable from unknown',async()=>{const c=await detectSpeechInputs({available:async({langs})=>langs[0]==='en-US'?'available':langs[0]==='ps-AF'?'unavailable':'downloadable'});expect(c.find(x=>x.language==='en')?.status).toBe('available');expect(c.find(x=>x.language==='ps')?.status).toBe('unavailable');expect(c.find(x=>x.language==='fa-AF')?.status).toBe('unverified');});
it('query failure is unverified rather than invented support',async()=>{expect((await detectSpeechInputs({available:async()=>{throw Error();}})).every(c=>c.status==='unverified')).toBe(true);});
