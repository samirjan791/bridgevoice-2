// @vitest-environment jsdom
import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {HistorySearch} from '@/components/chat/HistorySearch';
import type {StoredChat} from '@/lib/chat/schema';
afterEach(cleanup);
const history=[{id:'one',title:'School letter',messages:[{id:'m',role:'user',content:'The meeting is Friday',created:1}],updated:1}] as StoredChat[];
it('searches message content and opens the correct conversation',()=>{
 const open=vi.fn(),close=vi.fn();render(<HistorySearch history={history} enabled onOpen={open} onClose={close}/>);
 expect(document.activeElement).toBe(screen.getByLabelText('Search chat history'));
 fireEvent.change(screen.getByLabelText('Search chat history'),{target:{value:'Friday'}});
 fireEvent.click(screen.getByText('School letter'));expect(open).toHaveBeenCalledWith(history[0]);expect(close).toHaveBeenCalled();
});
it('shows an explicit empty state and closes with Escape',()=>{
 const close=vi.fn();render(<HistorySearch history={history} enabled onOpen={vi.fn()} onClose={close}/>);
 fireEvent.change(screen.getByLabelText('Search chat history'),{target:{value:'unknown'}});
 expect(screen.getByText(/No chats found/)).toBeTruthy();fireEvent.keyDown(document,{key:'Escape'});expect(close).toHaveBeenCalled();
});
it('never reveals saved messages when history is disabled',()=>{
 render(<HistorySearch history={history} enabled={false} onOpen={vi.fn()} onClose={vi.fn()}/>);
 expect(screen.queryByText('School letter')).toBeNull();expect(screen.getByText(/History is off/)).toBeTruthy();
});
