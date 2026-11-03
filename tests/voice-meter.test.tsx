// @vitest-environment jsdom
import {it,expect,vi,afterEach,beforeEach} from 'vitest';
import {render,cleanup,waitFor} from '@testing-library/react';
import {VoiceMeter} from '@/components/chat/VoiceMeter';
const preferences=vi.hoisted(()=>({settings:{motion:true}}));
vi.mock('@/components/providers',()=>({usePreferences:()=>preferences}));
beforeEach(()=>{preferences.settings.motion=true;vi.stubGlobal('matchMedia',vi.fn(()=>({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()})));});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();});
it('draws actual microphone samples and releases the meter on stop',async()=>{
 let next:FrameRequestCallback=()=>{},value=128;const stop=vi.fn(),close=vi.fn(async()=>{});
 vi.stubGlobal('requestAnimationFrame',vi.fn((cb:FrameRequestCallback)=>{next=cb;return 1;}));vi.stubGlobal('cancelAnimationFrame',vi.fn());
 Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:vi.fn(async()=>({getTracks:()=>[{stop}]}))}});
 vi.stubGlobal('AudioContext',class{state='running';resume=async()=>{};close=close;createMediaStreamSource=()=>({connect:vi.fn()});createAnalyser=()=>({fftSize:512,getByteTimeDomainData:(data:Uint8Array)=>data.fill(value)});});
 const view=render(<VoiceMeter listening/>);await waitFor(()=>expect(view.getByRole('img').getAttribute('aria-label')).toBe('Live microphone waveform'));
 next(40);const quiet=view.container.querySelector('path')!.getAttribute('d');value=160;next(80);expect(view.container.querySelector('path')!.getAttribute('d')).not.toBe(quiet);
 view.rerender(<VoiceMeter listening={false}/>);expect(stop).toHaveBeenCalled();expect(close).toHaveBeenCalled();expect(view.container.innerHTML).toBe('');
});
it('does not request a visual microphone stream with motion disabled',()=>{preferences.settings.motion=false;const getUserMedia=vi.fn();Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia}});const view=render(<VoiceMeter listening/>);expect(view.getByRole('img').getAttribute('aria-label')).toContain('motion off');expect(getUserMedia).not.toHaveBeenCalled();});
it('reports unavailable metering without fabricated activity',async()=>{Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:vi.fn(async()=>{throw new Error('denied');})}});const view=render(<VoiceMeter listening/>);await waitFor(()=>expect(view.getByRole('img').getAttribute('aria-label')).toContain('unavailable'));expect(view.container.querySelector('path')!.getAttribute('d')).toBe('M0 20H240');});
