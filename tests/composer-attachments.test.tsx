// @vitest-environment jsdom
import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {ChatComposer} from '@/components/chat/ChatComposer';
const doc={name:'appointment.pdf',pages:[{number:1,text:'Bring your passport.'}],truncated:false};
const base={text:'',setText:vi.fn(),onSend:vi.fn(),busy:false,onStop:vi.fn(),onAttach:vi.fn(),listening:false,onMic:vi.fn(),micSupported:false,uiLanguage:'en' as const,onBridge:vi.fn(),onMirror:vi.fn(),onOptions:vi.fn(),interim:''};
afterEach(()=>{cleanup();vi.clearAllMocks();});
it('shows photo and document inside the composer with independent removal',()=>{
 const photo=vi.fn(),document=vi.fn();const view=render(<ChatComposer {...base} photoName="photo.png" photoUrl="data:image/png;base64,AAAA" onClearPhoto={photo} documentAttachment={doc} onClearDocument={document}/>);
 const composer=view.container.querySelector('.chat-composer')!;
 expect(composer.contains(screen.getByAltText('photo.png'))).toBe(true);expect(composer.contains(screen.getByRole('button',{name:'Preview appointment.pdf'}))).toBe(true);
 fireEvent.click(screen.getByRole('button',{name:'Remove attached photo'}));expect(photo).toHaveBeenCalledOnce();expect(document).not.toHaveBeenCalled();
 fireEvent.click(screen.getByRole('button',{name:'Remove document'}));expect(document).toHaveBeenCalledOnce();
});
it('opens a real extracted-text preview and allows document-only send',()=>{
 render(<ChatComposer {...base} documentAttachment={doc}/>);fireEvent.click(screen.getByRole('button',{name:'Preview appointment.pdf'}));expect(screen.getByText('Bring your passport.')).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Send message'}));expect(base.onSend).toHaveBeenCalledOnce();
});
it('shows the real extraction state and cancels the upload',()=>{const cancel=vi.fn();render(<ChatComposer {...base} busy uploadingName="report.docx" onCancelUpload={cancel}/>);expect(screen.getByRole('status').textContent).toBe('Extracting text…');fireEvent.click(screen.getByRole('button',{name:'Cancel document upload'}));expect(cancel).toHaveBeenCalledOnce();});
