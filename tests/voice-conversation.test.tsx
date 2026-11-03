// @vitest-environment jsdom
import { it, expect, vi, afterEach } from "vitest";
import { renderHook, act, cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useSpeech } from "@/lib/use-speech";
import { VoiceConversation } from "@/components/chat/VoiceConversation";
const output=vi.hoisted(()=>({speak:vi.fn(),stop:vi.fn(),speaking:false,loading:false,error:"",label:"",paused:false,togglePause:vi.fn(),supported:true}));
vi.mock("@/lib/use-voice-output",()=>({useVoiceOutput:()=>output}));
vi.mock("@/components/chat/VoiceMeter",()=>({VoiceMeter:()=>null}));
afterEach(()=>{output.speaking=false;cleanup();vi.unstubAllGlobals();vi.clearAllMocks();delete (window as unknown as Record<string,unknown>).SpeechRecognition;});
class FakeRecognition {
 static last: FakeRecognition; lang=""; continuous=false; interimResults=false;
 onstart=()=>{};onend=()=>{};onerror=(_e:{error:string})=>{};
 onresult=(_e:{resultIndex:number;results:Array<{isFinal:boolean;0:{transcript:string;confidence:number}}>})=>{};
 constructor(){FakeRecognition.last=this;} start(){this.onstart();} stop(){this.onresult({resultIndex:0,results:[{isFinal:true,0:{transcript:"final words",confidence:0}}]});this.onend?.();} abort(){this.onend?.();}
}
function install(){vi.stubGlobal("fetch",vi.fn(async()=>new Response(JSON.stringify({configured:true}))));(window as unknown as Record<string,unknown>).SpeechRecognition=FakeRecognition;}
it("finishing dictation retains the recognition service's final words",()=>{
 install();const fn=vi.fn();const {result}=renderHook(()=>useSpeech(fn));
 act(()=>result.current.start("es-US"));expect(FakeRecognition.last.lang).toBe("es-US");expect(result.current.listening).toBe(true);
 act(()=>result.current.finish());expect(fn).toHaveBeenCalledWith("final words");expect(result.current.listening).toBe(false);
});
it("ignores events from an aborted recognition instance",()=>{
 install();const fn=vi.fn();const {result}=renderHook(()=>useSpeech(fn));act(()=>result.current.start());const old=FakeRecognition.last;
 act(()=>result.current.stop());act(()=>result.current.start());act(()=>old.stop());expect(fn).not.toHaveBeenCalled();expect(result.current.listening).toBe(true);
});
it("reports microphone denial",()=>{
 install();const {result}=renderHook(()=>useSpeech(vi.fn()));act(()=>result.current.start());act(()=>FakeRecognition.last.onerror({error:"not-allowed"}));expect(result.current.error).toContain("permission denied");
});
const props={onClose:vi.fn(),onSend:vi.fn(async()=>true),onStop:vi.fn(),busy:false,language:"en" as const,volume:1,error:"",live:false};
it("deduplicates repeated final recognition results",()=>{
 install();const final=vi.fn();const {result}=renderHook(()=>useSpeech(final));act(()=>result.current.start());
 const event={resultIndex:0,results:[{isFinal:true,0:{transcript:"same",confidence:0}}]};
 act(()=>{FakeRecognition.last.onresult(event);FakeRecognition.last.onresult(event);});expect(final).toHaveBeenCalledTimes(1);
});

async function openVoice(extra:Partial<React.ComponentProps<typeof VoiceConversation>>={}) {
 install();const before=FakeRecognition.last;const view=render(<VoiceConversation {...props} {...extra}/>);
 await waitFor(()=>{expect(FakeRecognition.last).not.toBe(before);expect(FakeRecognition.last.continuous).toBe(true);});return view;
}
function words(text:string,index=0,isFinal=true){act(()=>FakeRecognition.last.onresult({resultIndex:index,results:Array.from({length:index+1},()=>({isFinal,0:{transcript:text,confidence:1}}))}));}
it("starts listening on open and sends then speaks without any send tap",async()=>{
 const send=vi.fn(async()=>true),view=await openVoice({onSend:send});
 expect(screen.queryByRole('textbox')).toBeNull();expect(screen.queryByText('Hands-free turns')).toBeNull();
 words('Explain deductible');await waitFor(()=>expect(send).toHaveBeenCalledWith('Explain deductible','en'));
 view.rerender(<VoiceConversation {...props} onSend={send} answer={{id:'new',text:'A deductible is an amount.',language:'en'}}/>);
 await waitFor(()=>expect(output.speak).toHaveBeenCalledWith('A deductible is an amount.','en'));
 fireEvent.click(screen.getByLabelText('Voice settings'));
 expect(screen.getByText('Live Meta · session active')).toBeTruthy();
});
it("speaking interrupts playback and the next turn sends",async()=>{
 const send=vi.fn(async()=>true),view=await openVoice({onSend:send});
 output.speaking=true;view.rerender(<VoiceConversation {...props} onSend={send}/>);
 const stopped=output.stop.mock.calls.length;words('Wait explain that simply',0,false);
 expect(output.stop.mock.calls.length).toBeGreaterThan(stopped);expect(props.onStop).toHaveBeenCalled();
 output.speaking=false;words('Wait explain that simply');await waitFor(()=>expect(send).toHaveBeenCalledTimes(1));
});
it("cancels a pending send when closed and returns to typing",async()=>{
 const send=vi.fn(async()=>true);await openVoice({onSend:send});words('Do not send');
 fireEvent.click(screen.getByText('Type instead'));await new Promise(r=>setTimeout(r,700));expect(send).not.toHaveBeenCalled();expect(props.onClose).toHaveBeenCalled();
});
it("mute suppresses playback while turns still send",async()=>{
 const send=vi.fn(async()=>true),view=await openVoice({onSend:send});fireEvent.click(screen.getByLabelText('Mute replies'));
 words('Hello');await waitFor(()=>expect(send).toHaveBeenCalled());view.rerender(<VoiceConversation {...props} onSend={send} answer={{id:'muted',text:'Hello there',language:'en'}}/>);
 expect(output.speak).not.toHaveBeenCalled();fireEvent.click(screen.getByLabelText('Unmute replies'));expect(screen.getByLabelText('Mute replies')).toBeTruthy();
});
it("failed requests stop the session and offer a real retry",async()=>{
 await openVoice({onSend:async()=>false});words('Hello');await waitFor(()=>expect(screen.getByText('Retry voice')).toBeTruthy());
 fireEvent.click(screen.getByText('Retry voice'));expect(screen.queryByText('Retry voice')).toBeNull();
});
it("denied microphone never sends a pending utterance",async()=>{
 const send=vi.fn(async()=>true);await openVoice({onSend:send});words('Not sent');
 act(()=>{FakeRecognition.last.onerror({error:'not-allowed'});FakeRecognition.last.onend();});
 await new Promise(r=>setTimeout(r,700));expect(send).not.toHaveBeenCalled();
});
it("missing Meta configuration does not open the microphone",async()=>{
 install();vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({configured:false}))));const before=FakeRecognition.last;
 render(<VoiceConversation {...props}/>);await waitFor(()=>expect(screen.getByText('Meta connection required')).toBeTruthy());expect(FakeRecognition.last).toBe(before);
 fireEvent.keyDown(window,{key:'Escape'});expect(props.onClose).toHaveBeenCalled();
});

it("silence restarts listening without sending an empty turn",async()=>{
 const send=vi.fn(async()=>true);await openVoice({onSend:send});const first=FakeRecognition.last;
 act(()=>{first.onerror({error:'no-speech'});first.onend();});
 await waitFor(()=>expect(FakeRecognition.last).not.toBe(first));expect(send).not.toHaveBeenCalled();
});
it("keeps language details out of the main voice screen and closes settings before the session",async()=>{
 await openVoice({onTarget:vi.fn()});expect(screen.queryByText('Spoken input')).toBeNull();expect(screen.queryByText('Speech availability and privacy')).toBeNull();
 fireEvent.click(screen.getByLabelText('Voice settings'));expect(screen.getByText('Spoken input')).toBeTruthy();
 props.onClose.mockClear();fireEvent.keyDown(screen.getByLabelText('Close voice settings'),{key:'Escape'});expect(screen.queryByText('Spoken input')).toBeNull();expect(props.onClose).not.toHaveBeenCalled();
 fireEvent.click(screen.getByLabelText('End voice session'));expect(props.onClose).toHaveBeenCalled();
});
