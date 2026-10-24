// SPDX-License-Identifier: Apache-2.0
// Scoped research process facts. No app/browser launch, PID kill or full argv output.
import fs from 'node:fs/promises';import{createHash}from'node:crypto';
const validPid=p=>Number.isSafeInteger(p)&&p>0&&p<=2147483647;
const detail=e=>typeof e?.code==='string'?e.code:'READ_FAILED';
export async function ownedProcessDeadline(task,timeoutMs=5000,code='OPERATION_TIMEOUT'){if(!Number.isSafeInteger(timeoutMs)||timeoutMs<1||timeoutMs>30000)throw RangeError('Finite diagnostic deadline required');let timer;try{return await Promise.race([Promise.resolve().then(task),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Object.assign(Error(code),{code})),timeoutMs);})]);}finally{clearTimeout(timer);}}
export async function readOwnedProcessArgumentBytes(handle){const bytes=Buffer.alloc(65537);let total=0;for(;;){const{bytesRead}=await handle.read(bytes,total,bytes.length-total,total);if(!Number.isSafeInteger(bytesRead)||bytesRead<0||bytesRead>bytes.length-total)throw Error('Invalid argument read count');if(bytesRead===0)return bytes.subarray(0,total);total+=bytesRead;if(total>65536)throw Error('Argument bytes exceed diagnostic capacity');}}
export function summarizeOwnedProcessArguments(args){
 const profileOptions=[],forbiddenFlags=[];let headless=false;
 for(let i=0;i<args.length;i++){const a=args[i];if(a.startsWith('--user-data-dir='))profileOptions.push({syntax:'equals',value:a.slice('--user-data-dir='.length)});else if(a==='--user-data-dir'){const value=args[i+1];profileOptions.push({syntax:'separate',value:typeof value==='string'&&value&&!value.startsWith('-')?value:null});}if(a.startsWith('--headless'))headless=true;const match=/no-sandbox|ignore-certificate-errors|disable-web-security|load-extension/.exec(a);if(match&&!forbiddenFlags.includes(match[0]))forbiddenFlags.push(match[0]);}
 return{profileOptions,headless,forbiddenFlags};
}
function startTime(stat,pid){const end=stat.lastIndexOf(')'),prefix=stat.slice(0,stat.indexOf(' '));if(prefix!==String(pid)||end<0)throw Error('Invalid proc stat');const fields=stat.slice(end+2).trim().split(/\s+/),value=fields[19];if(!/^\d+$/.test(value||''))throw Error('Invalid proc start time');return value;}
async function readProcess(pid){
 const base='/proc/'+pid,f={pid,startTime:null,startTimeStable:false,procExe:null,sha256:null,argumentBytes:null,argumentDigest:null,argumentCount:null,profileOptions:[],headless:false,forbiddenFlags:[],errors:[]};let before,after,exeAfter;
 const attempt=async(code,fn)=>{try{return await fn();}catch(e){f.errors.push({code,detail:detail(e)});return null;}};
 before=await attempt('PROC_START_ERROR',async()=>startTime(await fs.readFile(base+'/stat','utf8'),pid));f.startTime=before;
 f.procExe=await attempt('PROC_EXE_ERROR',()=>fs.realpath(base+'/exe'));
 f.sha256=await attempt('PROC_BINARY_ERROR',async()=>createHash('sha256').update(await fs.readFile(base+'/exe')).digest('hex'));
 const args=await attempt('PROC_ARGUMENTS_ERROR',async()=>{const handle=await fs.open(base+'/cmdline','r');try{const data=await readOwnedProcessArgumentBytes(handle);f.argumentBytes=data.length;f.argumentDigest=createHash('sha256').update(data).digest('hex');if(!data.length||data.at(-1)!==0)throw Error('Incomplete argument vector');const args=data.toString('utf8').split('\0').filter(Boolean);f.argumentCount=args.length;return args;}finally{await handle.close();}});
 if(args)Object.assign(f,summarizeOwnedProcessArguments(args));
 exeAfter=await attempt('PROC_EXE_RECHECK_ERROR',()=>fs.realpath(base+'/exe'));
 after=await attempt('PROC_START_RECHECK_ERROR',async()=>startTime(await fs.readFile(base+'/stat','utf8'),pid));
 f.startTimeStable=before!==null&&before===after&&f.procExe!==null&&f.procExe===exeAfter;return f;
}
export async function collectOwnedBrowserProcess(session,expected,{timeoutMs=5000}={}){
 const f={schema:'stateatom.owned-browser-process-facts/1',driverPid:process.pid,reportedBrowserPids:[],reported:null,directChildren:[],errors:[]};
 try{const r=await ownedProcessDeadline(()=>session.send('SystemInfo.getProcessInfo'),timeoutMs,'CDP_TIMEOUT');if(!Array.isArray(r.processInfo))throw Error('Missing process info');const browser=r.processInfo.filter(x=>typeof x?.type==='string'&&x.type.toLowerCase()==='browser');if(browser.length>16){f.errors.push({code:'CDP_PID_CAPACITY'});}else f.reportedBrowserPids=browser.map(x=>x.id);if(f.reportedBrowserPids.length===1&&validPid(f.reportedBrowserPids[0]))f.reported=await readProcess(f.reportedBrowserPids[0]);}catch(e){f.errors.push({code:e?.code==='CDP_TIMEOUT'?'CDP_TIMEOUT':'CDP_ERROR',detail:detail(e)});}
 try{const data=await fs.readFile('/proc/self/task/'+process.pid+'/children','utf8'),pids=data.trim()?data.trim().split(/\s+/).map(Number):[];if(pids.length>16||pids.some(p=>!validPid(p))){f.errors.push({code:'CHILD_PID_CAPACITY_OR_FORMAT'});}else f.directChildren=await Promise.all(pids.map(readProcess));}catch(e){f.errors.push({code:'CHILD_READ_ERROR',detail:detail(e)});}
 return f;
}
export function admitOwnedBrowserProcess(f,expected){
 const failures=[],fail=(condition,code)=>{if(!condition&&!failures.includes(code))failures.push(code);};
 fail(f?.schema==='stateatom.owned-browser-process-facts/1','SCHEMA');fail(Array.isArray(f?.errors)&&f.errors.length===0,'COLLECTION_ERROR');
 const p=f?.reported;fail(Array.isArray(f?.reportedBrowserPids)&&f.reportedBrowserPids.length===1&&validPid(f.reportedBrowserPids[0])&&p?.pid===f.reportedBrowserPids[0],'BROWSER_PID_AMBIGUOUS');
 if(p){fail(validPid(p.pid),'PROCESS_PID_INVALID');fail(Array.isArray(p.errors)&&p.errors.length===0,'PROCESS_READ_ERROR');fail(p.startTimeStable===true&&/^\d+$/.test(p.startTime||''),'PROCESS_IDENTITY_UNSTABLE');fail(p.procExe===expected.executable,'EXECUTABLE_MISMATCH');fail(p.sha256===expected.sha256,'BINARY_MISMATCH');fail(p.profileOptions?.length===1&&p.profileOptions[0].syntax==='equals'&&p.profileOptions[0].value===expected.profile,'PROFILE_MISMATCH');fail(p.headless===true,'HEADLESS_MISSING');fail(Array.isArray(p.forbiddenFlags)&&p.forbiddenFlags.length===0,'FORBIDDEN_FLAGS');const matches=Array.isArray(f.directChildren)?f.directChildren.filter(c=>c.pid===p.pid):[];fail(matches.length===1,'CDP_NOT_DIRECT_CHILD');if(matches.length===1){const c=matches[0];fail(c.startTime===p.startTime&&c.startTimeStable===true&&c.procExe===p.procExe&&c.sha256===p.sha256&&c.errors?.length===0&&JSON.stringify(c.profileOptions)===JSON.stringify(p.profileOptions)&&c.headless===p.headless&&JSON.stringify(c.forbiddenFlags)===JSON.stringify(p.forbiddenFlags),'CHILD_IDENTITY_MISMATCH');}}
 return{status:failures.length?'REFUSED_PROCESS_FACTS':'ADMITTED_PROCESS_FACTS_ONLY',failures,runtimeProven:false,appExecuted:false};
}
