import {it,expect} from 'vitest';
import {userFollowUps} from '@/lib/chat/follow-ups';
import {buildPayload} from '@/lib/chat/meta';
import {chatRequestSchema} from '@/lib/chat/schema';
it('replaces the exact reversed-role suggestions shown in the reported screenshot',()=>{
 expect(userFollowUps(['What would you like help with first?','Do you need help with translation or explanation today?'])).toEqual(['Help me translate something.','Help me understand a word or idea.']);
});
it('retains useful user questions and requests exactly as the outgoing message',()=>{
 const valid=['Can you explain deductible with an example?','What does copay mean?','Make that simpler'];expect(userFollowUps(valid)).toEqual(valid);
});
it('filters assistant prompts without replacing valid contextual suggestions',()=>{expect(userFollowUps(['Would you like more help?','Explain the difference between these two terms.'])).toEqual(['Explain the difference between these two terms.']);});
it('deduplicates and does not create suggestions when the model supplies none',()=>{expect(userFollowUps([])).toEqual([]);expect(userFollowUps(['  Give me an example  ','Give me an example',''])).toEqual(['Give me an example']);});
it('uses localized user requests when repairing old reversed-role suggestions',()=>{expect(userFollowUps(['How can I help?'],'fa-AF')[0]).toBe('در ترجمه یک متن به من کمک کن.');});
it('instructs Meta to use user perspective and answer from context or ask for missing information',()=>{const p=buildPayload(chatRequestSchema.parse({message:'Hello',language:'en'}),'test-model');expect(p.instructions).toContain('FROM THE USER TO YOU');expect(p.instructions).toContain('ask only for that information');});
