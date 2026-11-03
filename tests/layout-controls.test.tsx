// @vitest-environment jsdom
import {useState} from 'react';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,cleanup,waitFor,within} from '@testing-library/react';
import {Providers} from '@/components/providers';
import {Settings} from '@/components/settings';
import {ChatShell} from '@/components/chat/ChatShell';
import {ChatSidebar} from '@/components/chat/ChatSidebar';
import {ChatComposer} from '@/components/chat/ChatComposer';
import {ChatMessage} from '@/components/chat/ChatMessage';
import {persistChat,readHistory,removeChat,toggleChatPin,HISTORY_KEY} from '@/lib/chat/history';
import {STORAGE_KEY} from '@/lib/storage';
vi.mock('next/image',()=>({default:()=>null}));
beforeEach(()=>{
 vi.spyOn(HTMLMediaElement.prototype,"pause").mockImplementation(()=>{});
 vi.spyOn(HTMLMediaElement.prototype,"play").mockResolvedValue();
 localStorage.clear();sessionStorage.clear();
 vi.stubGlobal('matchMedia',vi.fn(()=>({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()})));
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({configured:false}))));
 Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:vi.fn(async()=>{})}});
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();});
it('suggestions send complete examples and the document chip opens its picker',async()=>{
 const pickerClick=vi.spyOn(HTMLInputElement.prototype,'click').mockImplementation(()=>{});
 render(<Providers><ChatShell/></Providers>);
 fireEvent.click(screen.getByRole('button',{name:'Upload a document'}));expect(pickerClick).toHaveBeenCalled();
 expect(screen.getByLabelText('Suggestion document upload').getAttribute('accept')).toBe('.pdf,.docx,.txt');
 fireEvent.click(screen.getByRole('button',{name:'Translate something'}));
 await waitFor(()=>expect(vi.mocked(fetch).mock.calls.some(([url])=>url==='/api/chat')).toBe(true));
 const request=vi.mocked(fetch).mock.calls.find(([url])=>url==='/api/chat');expect(String(request?.[1]?.body)).toContain('passport');
});
it('explain chip sends a complete example and dismiss removes only that chip',async()=>{
 render(<Providers><ChatShell/></Providers>);
 fireEvent.click(screen.getByRole('button',{name:'Dismiss Translate something'}));expect(screen.queryByRole('button',{name:'Translate something'})).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Help me understand'}));
 await waitFor(()=>expect(vi.mocked(fetch).mock.calls.some(([url])=>url==='/api/chat')).toBe(true));
 const request=vi.mocked(fetch).mock.calls.find(([url])=>url==='/api/chat');expect(String(request?.[1]?.body)).toContain('$500 deductible');
});
it('Meaning Mirror lives in the sidebar and opens the real tool',()=>{
 render(<Providers><ChatShell/></Providers>);fireEvent.click(screen.getByRole('button',{name:'Meaning Mirror'}));
 expect(screen.getByLabelText('Original text',{exact:true})).toBeTruthy();fireEvent.click(screen.getByLabelText('Close Meaning Mirror'));expect(screen.queryByLabelText('Original text',{exact:true})).toBeNull();
});
it('opens and closes search by button and keyboard, and mobile drawer makes main inert',()=>{
 const view=render(<Providers><ChatShell/></Providers>);
 fireEvent.click(screen.getByLabelText('Search chats'));expect(screen.getByRole('dialog')).toBeTruthy();
 fireEvent.click(screen.getByLabelText('Close chat search'));expect(screen.queryByRole('dialog')).toBeNull();
 fireEvent.keyDown(window,{key:'k',ctrlKey:true});expect(screen.getByRole('dialog')).toBeTruthy();fireEvent.keyDown(document,{key:'Escape'});expect(screen.queryByRole('dialog')).toBeNull();
 fireEvent.click(screen.getByLabelText('Open navigation'));expect(view.container.querySelector('main')?.hasAttribute('inert')).toBe(true);
 fireEvent.click(screen.getAllByLabelText('Close navigation')[0]);expect(view.container.querySelector('main')?.hasAttribute('inert')).toBe(false);
});
it('pins survive new messages and filter/open/delete operate on real saved chats',()=>{
 persistChat({id:'a',title:'First chat',updated:1,messages:[]});persistChat({id:'b',title:'Second chat',updated:2,messages:[]});const open=vi.fn();
 function Harness(){const [history,setHistory]=useState(readHistory());return <ChatSidebar open={false} onClose={()=>{}} onNew={()=>{}} onCollapse={()=>{}} history={history} historyEnabled language="en" onOpen={open} onPin={id=>{toggleChatPin(id);setHistory(readHistory());}} onDelete={id=>{removeChat(id);setHistory(readHistory());}}/>;}
 render(<Harness/>);fireEvent.click(screen.getByLabelText('Pin First chat'));expect(readHistory().find(c=>c.id==='a')?.pinned).toBe(true);
 persistChat({id:'a',title:'First chat',updated:3,messages:[]});expect(readHistory().find(c=>c.id==='a')?.pinned).toBe(true);
 fireEvent.change(screen.getByLabelText('Filter chats'),{target:{value:'pinned'}});expect(screen.queryByText('Second chat')).toBeNull();fireEvent.click(screen.getByText('First chat'));expect(open).toHaveBeenCalledWith(expect.objectContaining({id:'a'}));
 fireEvent.click(screen.getByLabelText('Unpin First chat'));expect(screen.queryByText('First chat')).toBeNull();fireEvent.change(screen.getByLabelText('Filter chats'),{target:{value:'all'}});fireEvent.click(screen.getByLabelText('Delete First chat'));expect(readHistory().some(c=>c.id==='a')).toBe(false);
});
it('upload menu has only two working file pickers and closes with Escape',()=>{
 const attach=vi.fn();const click=vi.spyOn(HTMLInputElement.prototype,'click').mockImplementation(()=>{});
 render(<ChatComposer text="" setText={()=>{}} onSend={()=>{}} busy={false} onStop={()=>{}} onAttach={attach} listening={false} onMic={()=>{}} micSupported={false} uiLanguage="en" onBridge={()=>{}} onMirror={()=>{}} onOptions={()=>{}} interim=""/>);
 const picker=screen.getByLabelText('Choose a document or photo') as HTMLInputElement;
 fireEvent.click(screen.getByLabelText('Open tools'));expect(screen.getAllByRole('menuitem')).toHaveLength(2);fireEvent.click(screen.getByRole('menuitem',{name:'Upload photo'}));expect(picker.accept).toBe('image/jpeg,image/png,image/webp');expect(click).toHaveBeenCalledTimes(1);
 fireEvent.click(screen.getByLabelText('Open tools'));fireEvent.click(screen.getByRole('menuitem',{name:'Upload document'}));expect(picker.accept).toBe('.pdf,.docx,.txt');
 const f=new File(['hello'],'letter.txt',{type:'text/plain'});fireEvent.change(picker,{target:{files:[f]}});expect(attach).toHaveBeenCalledWith(f);
 fireEvent.click(screen.getByLabelText('Open tools'));fireEvent.keyDown(window,{key:'Escape'});expect(screen.queryByRole('menu')).toBeNull();
});
it('settings navigation, search, language and appearance persist actual preferences',async()=>{
 render(<Providers><Settings/></Providers>);
 fireEvent.change(screen.getByLabelText('Interface language'),{target:{value:'ps'}});expect(document.documentElement.dir).toBe('rtl');
 fireEvent.change(screen.getByLabelText('Interface language'),{target:{value:'auto'}});expect(JSON.parse(localStorage.getItem('bridgevoice.settings.v2')!).autoLanguage).toBe(true);
 fireEvent.change(screen.getByLabelText('Translation language'),{target:{value:'fa-AF'}});
 fireEvent.click(screen.getByRole('button',{name:'Appearance'}));for(const theme of ['dark','light','system'])fireEvent.change(screen.getByLabelText('Theme'),{target:{value:theme}});
 fireEvent.change(screen.getByLabelText('Reading size'),{target:{value:'large'}});fireEvent.click(screen.getByLabelText(/Enable motion/));fireEvent.click(screen.getByLabelText('High contrast'));
 const saved=JSON.parse(localStorage.getItem('bridgevoice.settings.v2')!);expect(saved).toMatchObject({font:'large',motion:false,contrast:true,theme:'system',target:'fa-AF'});
 fireEvent.change(screen.getByLabelText('Search settings'),{target:{value:'volume'}});expect(screen.getByLabelText('Read-aloud volume')).toBeTruthy();
 fireEvent.change(screen.getByLabelText('Read-aloud volume'),{target:{value:'0.3'}});fireEvent.click(screen.getByLabelText('Dictation'));fireEvent.click(screen.getByLabelText(/Automatically send finalized/));expect(JSON.parse(localStorage.getItem('bridgevoice.settings.v2')!)).toMatchObject({volume:.3,dictation:false,automatic:false});
 fireEvent.change(screen.getByLabelText('Search settings'),{target:{value:'does not exist'}});expect(screen.getByText(/No settings match/)).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Keyboard'}));expect(screen.getByText('Ctrl / ⌘ + K')).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Meta connection'}));await screen.findByText(/No server key detected/);
 fireEvent.change(screen.getByLabelText(/Private deployment access code/),{target:{value:'test-only-code'}});fireEvent.click(screen.getByRole('button',{name:'Save access code for this tab'}));expect(sessionStorage.getItem('bridgevoice.access')).toBe('test-only-code');
});
it('history toggle and deletion operate on local storage',()=>{
 render(<Providers><Settings/></Providers>);fireEvent.click(screen.getByRole('button',{name:'History & data'}));fireEvent.click(screen.getByLabelText('Save non-sensitive conversations on this device'));
 expect(JSON.parse(localStorage.getItem('bridgevoice.settings.v2')!).history).toBe(true);persistChat({id:'x',title:'Disposable test',updated:1,messages:[]});vi.stubGlobal('confirm',vi.fn(()=>true));fireEvent.click(screen.getByRole('button',{name:'Delete saved chat history'}));expect(localStorage.getItem(HISTORY_KEY)).toBeNull();
 localStorage.setItem(STORAGE_KEY,'[]');fireEvent.click(screen.getByRole('button',{name:'Delete all BridgeVoice browser data'}));expect(localStorage.getItem(STORAGE_KEY)).toBeNull();expect(localStorage.getItem('bridgevoice.settings.v2')).toBeNull();
});
it('user copy/edit and assistant copy/regenerate/read-aloud invoke real handlers',async()=>{
 const save=vi.fn(),retry=vi.fn(),speak=vi.fn();const common={onFollow:vi.fn(),onRetry:retry,onEdit:vi.fn(),onSaveEdit:save,onDelete:vi.fn(),onFeedback:vi.fn(),onSpeak:speak,canSpeak:true,busy:false};
 const view=render(<Providers><ChatMessage {...common} message={{id:'u',role:'user',content:'Original',created:1}}/></Providers>);
 fireEvent.click(screen.getByLabelText('Copy message'));await waitFor(()=>expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Original'));
 fireEvent.click(screen.getByLabelText('Edit message'));fireEvent.change(screen.getByLabelText('Edit your message'),{target:{value:'Revised'}});fireEvent.click(screen.getByText('Save'));expect(save).toHaveBeenCalledWith('Revised');
 fireEvent.click(screen.getByLabelText('Edit message'));fireEvent.click(screen.getByText('Cancel'));expect(screen.queryByLabelText('Edit your message')).toBeNull();
 view.rerender(<Providers><ChatMessage {...common} message={{id:'a',role:'assistant',content:'Answer',created:2}}/></Providers>);
 const actions=view.container.querySelector('.message-actions') as HTMLElement;expect(within(actions).getAllByRole('button')).toHaveLength(3);
 fireEvent.click(screen.getByLabelText('Copy answer'));await waitFor(()=>expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Answer'));
 fireEvent.click(screen.getByLabelText('Regenerate response'));expect(retry).toHaveBeenCalled();fireEvent.click(screen.getByLabelText('Read aloud'));expect(speak).toHaveBeenCalledWith('Answer','en');
});
it('Meta indicator never claims connection from configuration alone',async()=>{
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({configured:true}))));render(<Providers><ChatShell/></Providers>);
 await screen.findByRole('link',{name:'Meta key configured; no request verified yet'});expect(screen.queryByRole('link',{name:'Meta connected — last request succeeded'})).toBeNull();
});
it('two participants switch translation direction and retain source attribution',async()=>{
 render(<Providers><ChatShell/></Providers>);
 fireEvent.click(screen.getByRole('button',{name:'Interpret a conversation'}));
 expect(screen.getByText(/one shared microphone/)).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:/Person B’s turn/}));
 expect((screen.getByLabelText('Source language') as HTMLSelectElement).value).toBe('ps');
 expect((screen.getByLabelText('Bridge target language') as HTMLSelectElement).value).toBe('en');
 fireEvent.change(screen.getByLabelText('Message',{exact:true}),{target:{value:'سلام'}});
 fireEvent.click(screen.getByRole('button',{name:'Send message'}));
 await waitFor(()=>expect(vi.mocked(fetch).mock.calls.some(([url])=>url==='/api/chat')).toBe(true));
 const call=vi.mocked(fetch).mock.calls.find(([url])=>url==='/api/chat');const body=JSON.parse(String(call?.[1]?.body));
 expect(body.sourceLanguage).toBe('ps');expect(body.language).toBe('en');expect(body.speaker).toBe('Person B');expect(body.original).toBe('سلام');
 expect(screen.getByText('Person B · original')).toBeTruthy();
});
it('repairs assistant-style followups and clicking sends a user request with conversation context',async()=>{
 const {apiResult}=await import('./helpers/api-result');const {chatRequestSchema}=await import('@/lib/chat/schema');
 const requests:Array<{message:string;messages:Array<{role:string;content:string}>}>=[];
 vi.stubGlobal('fetch',vi.fn(async(url,options)=>{
  if(url!=='/api/chat')return new Response(JSON.stringify({configured:true}));
  const body=chatRequestSchema.parse(JSON.parse(String(options?.body)));requests.push(body);
  const result=apiResult(body);result.answer='I can help with translation or explanation.';
  result.followUps=requests.length===1?['What would you like help with first?','Do you need help with translation or explanation today?']:[];
  return new Response('data: '+JSON.stringify({type:'result',result})+'\n\n',{headers:{'content-type':'text/event-stream'}});
 }));
 render(<Providers><ChatShell/></Providers>);
 fireEvent.change(screen.getByLabelText('Message',{exact:true}),{target:{value:'Hello, I need help.'}});fireEvent.click(screen.getByRole('button',{name:'Send message'}));
 const button=await screen.findByRole('button',{name:'Help me translate something.'});
 expect(screen.queryByRole('button',{name:'What would you like help with first?'})).toBeNull();fireEvent.click(button);
 await waitFor(()=>expect(requests).toHaveLength(2));expect(requests[1].message).toBe('Help me translate something.');expect(requests[1].messages).toEqual(expect.arrayContaining([expect.objectContaining({role:'user',content:'Hello, I need help.'}),expect.objectContaining({role:'assistant',content:'I can help with translation or explanation.'})]));
});
it('removing an extracted document excludes its text from the next Meta request',async()=>{
 vi.spyOn(window,'confirm').mockReturnValue(true);
 vi.stubGlobal('fetch',vi.fn(async(input:RequestInfo|URL)=>String(input)==='/api/document'?new Response(JSON.stringify({name:'sample.txt',pages:[{number:1,text:'PRIVATE ATTACHMENT TEXT'}],truncated:false})):new Response(JSON.stringify({configured:false}))));
 render(<Providers><ChatShell/></Providers>);
 fireEvent.change(screen.getByLabelText('Choose a document or photo'),{target:{files:[new File(['PRIVATE ATTACHMENT TEXT'],'sample.txt',{type:'text/plain'})]}});
 await screen.findByRole('button',{name:'Preview sample.txt'});
 fireEvent.click(screen.getByRole('button',{name:'Remove document'}));
 fireEvent.change(screen.getByLabelText('Message'),{target:{value:'Hello'}});
 fireEvent.click(screen.getByRole('button',{name:'Send message'}));
 await waitFor(()=>expect(vi.mocked(fetch).mock.calls.some(([url])=>url==='/api/chat')).toBe(true));
 const request=vi.mocked(fetch).mock.calls.find(([url])=>url==='/api/chat');expect(String(request?.[1]?.body)).not.toContain('PRIVATE ATTACHMENT TEXT');
});
