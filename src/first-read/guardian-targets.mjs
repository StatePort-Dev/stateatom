// SPDX-License-Identifier: Apache-2.0
// Acquire exact built guardian code through its native child session before any
// application navigation. This returns facts, not a controlled browser witness.
import {readFile} from 'node:fs/promises';import path from 'node:path';import {createHash} from 'node:crypto';
const sha=s=>createHash('sha256').update(s).digest('hex');
export async function acquireGuardianTargets({cdp,extensionWorker,base,extensionId}){
 const documentURL='chrome-extension://'+extensionId+'/atom-guardian.html',workerURL='chrome-extension://'+extensionId+'/atom-guardian-worker.js';
 const contexts=await extensionWorker.evaluate(async url=>chrome.runtime.getContexts({documentUrls:[url]}),documentURL);
 if(contexts.length!==1||contexts[0].contextType!=='OFFSCREEN_DOCUMENT'||contexts[0].documentUrl!==documentURL)throw Error('Native guardian document unavailable');
 const initial=(await cdp.send('Target.getTargets')).targetInfos,documents=initial.filter(t=>t.type==='background_page'&&t.url===documentURL);
 if(documents.length!==1)throw Error('Native guardian document identity unavailable');
 const documentId=documents[0].targetId,workers=initial.filter(t=>t.type==='worker'&&t.parentId===documentId&&t.parentFrameId===documentId);
 if(workers.length!==1)throw Error('Native guardian worker identity unavailable');
 const workerId=workers[0].targetId,expected=await readFile(path.join(base,'atom-guardian-worker.js'));
 if(expected.length>2*1024*1024)throw Error('Guardian code budget exceeded');
 const {sessionId}=await cdp.send('Target.attachToTarget',{targetId:workerId,flatten:false});let next=0,invalid=false;const pending=new Map(),scripts=[];
 const receive=event=>{if(event.sessionId!==sessionId)return;try{if(typeof event.message!=='string'||event.message.length>4*1024*1024)throw Error('budget');const m=JSON.parse(event.message);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error('Guardian native command denied')):p.resolve(m.result);}}else if(m.method==='Debugger.scriptParsed'){if(scripts.length>=8)throw Error('budget');scripts.push(m.params);}else if(m.method==='Debugger.scriptFailedToParse')invalid=true;}catch{invalid=true;}};
 cdp.on('Target.receivedMessageFromTarget',receive);
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++next,timer=setTimeout(()=>{pending.delete(id);reject(Error('Guardian native command deadline'));},2000);pending.set(id,{resolve,reject,timer});void cdp.send('Target.sendMessageToTarget',{sessionId,message:JSON.stringify({id,method,params})}).catch(error=>{clearTimeout(timer);pending.delete(id);reject(error);});});
 try{
  await send('Debugger.enable',{maxScriptsCacheSize:2*1024*1024});await send('Runtime.getIsolateId');
  if(invalid||scripts.length!==1||scripts[0].url!==workerURL||scripts[0].isLiveEdit||scripts[0].hasSourceURL)throw Error('Guardian compiled source identity unavailable');
  const source=await send('Debugger.getScriptSource',{scriptId:scripts[0].scriptId});
  if(invalid||typeof source.scriptSource!=='string'||sha(source.scriptSource)!==sha(expected))throw Error('Guardian compiled bytes differ');
  const current=(await cdp.send('Target.getTargetInfo',{targetId:workerId})).targetInfo;
  if(current.type!=='worker'||current.parentId!==documentId||current.parentFrameId!==documentId||![workerURL,''].includes(current.url))throw Error('Guardian native relationship changed');
  return Object.freeze({documentId,workerId,documentURL,workerURL,workerTargetURL:current.url,scriptDigest:sha(expected)});
 }finally{
  cdp.off('Target.receivedMessageFromTarget',receive);for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('Guardian acquisition closed'));}pending.clear();await cdp.send('Target.detachFromTarget',{sessionId});
 }
}
