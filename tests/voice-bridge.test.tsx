// @vitest-environment jsdom
import {afterEach,beforeEach,it,expect,vi} from 'vitest';
import {render,cleanup,waitFor} from '@testing-library/react';
import {readFileSync} from 'node:fs';
import {VoiceBridge,BRIDGE_PATHS} from '@/components/chat/VoiceBridge';
const preferences=vi.hoisted(()=>({settings:{motion:true}}));
vi.mock('@/components/providers',()=>({usePreferences:()=>preferences}));
beforeEach(()=>{preferences.settings.motion=true;vi.stubGlobal('matchMedia',vi.fn(()=>({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()})));});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();});
it('uses the exact existing bridge paths and distinct state hooks without an orb',()=>{
 const intro=readFileSync('src/components/intro/Intro.tsx','utf8');BRIDGE_PATHS.forEach(path=>expect(intro).toContain(`d="${path}"`));
 const view=render(<VoiceBridge state="ready"/>);
 for(const state of ['ready','listening','thinking','processing','translating','error','speaking','muted'] as const){
  view.rerender(<VoiceBridge state={state}/>);expect(view.container.querySelector('.voice-bridge')?.getAttribute('data-state')).toBe(state);
  expect(view.container.querySelectorAll('.bridge-structure path')).toHaveLength(4);expect(view.container.querySelector('.voice-orb')).toBeNull();
 }
});
it('system and app reduced motion prevent metering and select still rendering',()=>{
 const getUserMedia=vi.fn();Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia}});
 vi.stubGlobal('matchMedia',vi.fn(()=>({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()})));
 const view=render(<VoiceBridge state="listening"/>);expect(view.container.firstElementChild?.getAttribute('data-motion')).toBe('off');expect(getUserMedia).not.toHaveBeenCalled();
 view.unmount();vi.stubGlobal('matchMedia',vi.fn(()=>({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()})));preferences.settings.motion=false;
 const second=render(<VoiceBridge state="thinking"/>);expect(second.container.firstElementChild?.getAttribute('data-motion')).toBe('off');expect(getUserMedia).not.toHaveBeenCalled();
});
it('microphone amplitude changes only an SVG variable and releases tracks on mute',async()=>{
 const stop=vi.fn(),close=vi.fn(async()=>{});let level=128;let next:FrameRequestCallback=()=>{};
 vi.stubGlobal('requestAnimationFrame',vi.fn((cb:FrameRequestCallback)=>{next=cb;return 1;}));vi.stubGlobal('cancelAnimationFrame',vi.fn());
 Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:vi.fn(async()=>({getTracks:()=>[{stop}]}))}});
 vi.stubGlobal('AudioContext',class {state='running';resume=async()=>{};close=close;createMediaStreamSource=()=>({connect:vi.fn()});createAnalyser=()=>({fftSize:256,getByteTimeDomainData:(data:Uint8Array)=>data.fill(level)});});
 const view=render(<VoiceBridge state="listening"/>);await waitFor(()=>expect(requestAnimationFrame).toHaveBeenCalled());
 const svg=view.container.querySelector('svg')!;expect(svg.style.getPropertyValue('--bridge-ripple')).toBe('1');level=180;next(16);expect(Number(svg.style.getPropertyValue('--bridge-ripple'))).toBeGreaterThan(1);
 view.rerender(<VoiceBridge state="muted"/>);expect(stop).toHaveBeenCalled();expect(close).toHaveBeenCalled();expect(svg.style.getPropertyValue('--bridge-ripple')).toBe('1');
});
it('late permission result is released after unmount',async()=>{
 const stop=vi.fn();let resolve:(stream:unknown)=>void=()=>{};
 Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:()=>new Promise(r=>{resolve=r;})}});
 const view=render(<VoiceBridge state="listening"/>);view.unmount();resolve({getTracks:()=>[{stop}]});await waitFor(()=>expect(stop).toHaveBeenCalled());
});
it('CSS stops every animation for mute, reduced motion and the settings switch',()=>{
 const css=readFileSync('src/components/chat/voice-bridge.css','utf8');
 expect(css).toContain('@media(prefers-reduced-motion:reduce)');expect(css).toContain('html[data-motion="false"]');expect(css).toContain('.voice-bridge[data-state="muted"] *');expect(css).toContain('animation:none!important');
});
