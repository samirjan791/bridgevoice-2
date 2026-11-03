// @vitest-environment jsdom
import {it,expect,vi,afterEach,beforeEach} from 'vitest';
import {render,cleanup,fireEvent} from '@testing-library/react';
import {RobotAvatar} from '@/components/brand/RobotAvatar';
const preferences=vi.hoisted(()=>({settings:{motion:true}}));
vi.mock('@/components/providers',()=>({usePreferences:()=>preferences}));
let reduced=false;
beforeEach(()=>{
 preferences.settings.motion=true;reduced=false;
 vi.stubGlobal('matchMedia',vi.fn(()=>({matches:reduced,addEventListener:vi.fn(),removeEventListener:vi.fn()})));
 vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue();
 vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();});
it('plays the supplied silent loop and pauses on unmount',()=>{
 const view=render(<RobotAvatar/>);const video=view.container.querySelector('video')!;
 expect(video.getAttribute('src')).toBe('/brand/robot-original.mp4');expect(video.muted).toBe(true);expect(video.loop).toBe(true);expect(video.controls).toBe(false);
 expect(video.play).toHaveBeenCalled();fireEvent.playing(video);expect(video.style.opacity).toBe('1');
 view.unmount();expect(video.pause).toHaveBeenCalled();
});
it('stays still with reduced motion',()=>{reduced=true;const view=render(<RobotAvatar/>);expect(view.container.querySelector('video')!.play).not.toHaveBeenCalled();});
it('stops when the Settings motion switch changes',()=>{const view=render(<RobotAvatar/>);preferences.settings.motion=false;view.rerender(<RobotAvatar/>);const video=view.container.querySelector('video')!;expect(video.pause).toHaveBeenCalled();expect(video.style.opacity).toBe('0');});
it('retains the poster when media fails',()=>{const view=render(<RobotAvatar/>);const video=view.container.querySelector('video')!;fireEvent.playing(video);fireEvent.error(video);expect(video.style.opacity).toBe('0');expect(view.container.querySelector('img')).toBeTruthy();});
