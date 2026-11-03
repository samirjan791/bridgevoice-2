import {it,expect,vi,afterEach} from 'vitest';
import {NextRequest} from 'next/server';
import {POST} from '@/app/api/proof/route';
import {metaChat} from '@/lib/chat/meta';
vi.mock('@/lib/chat/meta',()=>({metaChat:vi.fn()}));
afterEach(()=>{vi.resetAllMocks();vi.unstubAllEnvs();});
function request(body:unknown,headers:Record<string,string>={}){return new NextRequest('http://localhost/api/proof',{method:'POST',headers:{'content-type':'application/json',...headers},body:JSON.stringify(body)});}
const input={source:'Bring 2 bags',translation:'Bring 20 bags',from:'en',to:'en'};
it('rejects invalid input before any model request',async()=>{expect((await POST(request({...input,source:''}))).status).toBe(400);expect(metaChat).not.toHaveBeenCalled();});
it('protects semantic review with the deployment token',async()=>{vi.stubEnv('BRIDGEVOICE_ACCESS_TOKEN','private-test');expect((await POST(request(input))).status).toBe(401);expect(metaChat).not.toHaveBeenCalled();});
it('sends exact original and proposed text separately and elevates critical findings',async()=>{vi.mocked(metaChat).mockResolvedValue({answer:'Quantity changed.',warnings:[{message:'2 became 20',priority:'critical'}],provider:'Meta test stub',latencyMs:10} as Awaited<ReturnType<typeof metaChat>>);const response=await POST(request(input));expect(response.status).toBe(200);expect(response.headers.get('cache-control')).toBe('no-store');expect((await response.json()).reviewStatus).toBe('Human review required');expect(metaChat).toHaveBeenCalledWith(expect.objectContaining({original:input.source,proposed:input.translation,task:'compare'}),expect.anything(),expect.any(Function));});
it('returns a visible failure rather than fabricated review',async()=>{vi.mocked(metaChat).mockRejectedValue(new Error('private internal credential'));const response=await POST(request(input));expect(response.status).toBe(502);const body=await response.text();expect(body).not.toContain('private internal credential');expect(body).toContain('unavailable');});
