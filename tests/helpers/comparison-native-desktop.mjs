// SPDX-License-Identifier: Apache-2.0
// Owned Linux research resources only. No certificate, browser preference or trust APIs.
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {readFile,readlink,stat,open,writeFile,unlink} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {comparisonSha,comparisonPrivateEnvironment} from '../../scripts/comparison-evaluation-case.mjs';
export const comparisonPause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export function parseProcStat(raw){
 const end=raw.lastIndexOf(')'),pid=Number(raw.slice(0,raw.indexOf(' '))),fields=raw.slice(end+2).trim().split(/\s+/);
 assert(end>0&&Number.isSafeInteger(pid)&&pid>0&&fields.length>=20);
 assert(/^\d+$/.test(fields[1])&&/^\d+$/.test(fields[19]));
 return {pid,ppid:Number(fields[1]),startTime:fields[19]};
}
export async function readComparisonProcess(pid,{read=readFile,link=readlink,metadata=stat}={}){
 assert(Number.isSafeInteger(pid)&&pid>0);
 try{
  const base='/proc/'+pid,first=parseProcStat(await read(base+'/stat','utf8'));
  const uid=(await metadata(base)).uid,exe=await link(base+'/exe'),exeSha256=comparisonSha(await read(base+'/exe'));
  const last=parseProcStat(await read(base+'/stat','utf8'));
  assert.deepEqual(last,first,'Process changed while read');
  return {...first,uid,exe,exeSha256};
 }catch(e){if(e.code==='ENOENT'||e.code==='ESRCH'){try{await metadata('/proc/'+pid);}catch(probe){if(probe.code==='ENOENT'||probe.code==='ESRCH')return null;throw probe;}}throw e;}
}
export async function attestComparisonBrowser(x,{read=readComparisonProcess}={}){
 assert.equal(x.product,'Chrome/'+x.version);
 const roots=x.processInfo.filter(p=>p.type==='browser');assert.equal(roots.length,1);
 const chain=[],seen=new Set();let current=await read(roots[0].id);
 assert(current&&current.uid===x.uid&&current.exe===x.binary&&current.exeSha256===x.binarySha256);
 const main=current;
 while(current&&chain.length<8){
  assert(!seen.has(current.pid)&&current.uid===x.uid);seen.add(current.pid);chain.push(current);
  if(current.pid===x.launcher.pid){
   assert.equal(current.startTime,x.launcher.startTime);assert.equal(current.exe,x.launcher.exe);assert.equal(current.exeSha256,x.launcher.exeSha256);assert.equal(current.ppid,x.nativePID);
   return {...main,ownerAttested:true,product:x.product,profile:x.profile,launcherPID:current.pid,launcherStartTime:current.startTime,parentChain:chain};
  }
  current=await read(current.ppid);
 }
 throw Error('OWNERSHIP_NOT_ATTESTED');
}
const sameIdentity=(a,b)=>a&&a.pid===b.pid&&a.startTime===b.startTime&&a.uid===b.uid&&a.exe===b.exe&&a.exeSha256===b.exeSha256;
export async function retireComparisonProcess(identity,{read=readComparisonProcess,signal=(pid,s)=>process.kill(pid,s),pause=comparisonPause}={}){
 const result={pid:identity?.pid??null,startTime:identity?.startTime??null,state:'Unknown'};
 if(!identity?.startTime||!identity?.exe||!identity?.exeSha256)return result;
 try{
  let current=await read(identity.pid);if(!current)return {...result,state:'Absent'};
  if(!sameIdentity(current,identity))return {...result,state:'ReusedDifferentIdentity'};
  signal(identity.pid,'SIGTERM');
  for(let i=0;i<20;i++){
   await pause(100);current=await read(identity.pid);
   if(!current)return {...result,state:'Absent'};
   if(!sameIdentity(current,identity))return {...result,state:'ReusedDifferentIdentity'};
  }
  return {...result,state:'StillOwned'};
 }catch(e){return {...result,error:e.code??e.message};}
}
export async function acquireComparisonLease(profile,nonce){
 assert(/^[a-f0-9]{32}$/.test(nonce));const file=profile+'/.stateatom-comparison-lease',receipt=JSON.stringify({schema:'stateatom.comparison-lease/1',nonce,pid:process.pid})+'\n';
 const handle=await open(file,'wx',0o600);try{await handle.writeFile(receipt);}finally{await handle.close();}
 let released=false;
 return {file,async release(){if(released)return true;try{if(await readFile(file,'utf8')!==receipt)return false;await unlink(file);released=true;return true;}catch{return false;}}};
}
export async function independentComparisonCleanup(result,actions){
 result.cleanup??={};result.cleanupErrors??=[];
 for(const [key,action]of Object.entries(actions)){
  try{result.cleanup[key]=await action()===true;}catch(e){result.cleanup[key]=false;result.cleanupErrors.push({key,name:e.name,message:e.message});}
 }
 return result.cleanup;
}
export async function waitComparison(check,timeoutMs=15000,{checkStop=()=>{},pause=comparisonPause}={}){
 const started=Date.now();
 while(Date.now()-started<timeoutMs){checkStop();const value=await check();checkStop();if(value)return value;await pause(100);}
 throw Error('OBSERVATION_TIMEOUT');
}
export function createComparisonDesktop(s,{onOwned,checkStop=()=>{}}){
 const out=s.out,env=comparisonPrivateEnvironment(out),auth=out+'/xauth';
 const resource={env,child:null,identity:null,log:null,auth,authenticated:false};
 resource.start=async()=>{
  checkStop();assert(process.env.DISPLAY,'Parent X display unavailable');
  await writeFile(auth,'',{flag:'wx',mode:0o600});const cookie=randomBytes(16).toString('hex');
  execFileSync('/usr/bin/xauth',['-f',auth,'add',':0','MIT-MAGIC-COOKIE-1',cookie],{env,timeout:5000,stdio:'pipe'});
  checkStop();resource.log=await open(out+'/xephyr.log','ax',0o600);
  const parentEnv={...env,DISPLAY:process.env.DISPLAY};if(process.env.XAUTHORITY)parentEnv.XAUTHORITY=process.env.XAUTHORITY;
  const child=resource.child=spawn('/usr/bin/Xephyr',['-displayfd','3','-screen','1100x1000','-nolisten','tcp','-noreset','-auth',auth],{env:parentEnv,stdio:['ignore',resource.log.fd,resource.log.fd,'pipe']});
  // Install error/read handlers immediately, before an await can miss startup output.
  const display=new Promise((resolve,reject)=>{let data='';const timer=setTimeout(()=>reject(Error('X_DISPLAY_TIMEOUT')),15000);const end=(fn,v)=>{clearTimeout(timer);fn(v);};child.once('error',e=>end(reject,e));child.once('exit',()=>end(reject,Error('X_DISPLAY_EXITED')));child.stdio[3].on('data',b=>{data+=b;if(data.includes('\n'))end(resolve,data.trim());});});
  display.catch(()=>{});
  resource.identity=await waitComparison(()=>readComparisonProcess(child.pid),2000,{checkStop});onOwned('desktop',resource.identity);
  const number=await display;checkStop();assert(/^\d+$/.test(number));
  execFileSync('/usr/bin/xauth',['-f',auth,'add',':'+number,'MIT-MAGIC-COOKIE-1',cookie],{env,timeout:5000,stdio:'pipe'});
  resource.env={...env,DISPLAY:':'+number,XAUTHORITY:auth};resource.authenticated=true;return resource;
 };
 resource.close=async()=>{
  let ok=!resource.child;
  try{if(resource.child){const retired=await retireComparisonProcess(resource.identity);resource.retirement=retired;ok=['Absent','ReusedDifferentIdentity'].includes(retired.state);}}finally{if(resource.log)await resource.log.close();}
  return ok;
 };
 return resource;
}
