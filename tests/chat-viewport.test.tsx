// @vitest-environment jsdom
import {it,expect,vi,afterEach} from 'vitest';
import {renderHook,cleanup} from '@testing-library/react';
import {useChatViewport} from '@/lib/use-chat-viewport';
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
it('follows the software-keyboard viewport and cleans listeners/styles on unmount',()=>{
 const viewport=Object.assign(new EventTarget(),{height:800,offsetTop:0,scale:1});vi.stubGlobal('visualViewport',viewport);
 const view=renderHook(()=>useChatViewport());const style=document.documentElement.style;
 expect(style.getPropertyValue('--chat-viewport-height')).toBe('800px');
 viewport.height=420;viewport.offsetTop=12;viewport.dispatchEvent(new Event('resize'));
 expect(style.getPropertyValue('--chat-viewport-height')).toBe('420px');expect(style.getPropertyValue('--chat-viewport-top')).toBe('12px');
 viewport.scale=2;viewport.height=200;viewport.dispatchEvent(new Event('resize'));expect(style.getPropertyValue('--chat-viewport-height')).toBe('420px');
 view.unmount();expect(style.getPropertyValue('--chat-viewport-height')).toBe('');
});
