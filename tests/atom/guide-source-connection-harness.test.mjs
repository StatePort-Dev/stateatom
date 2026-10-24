// SPDX-License-Identifier: Apache-2.0
import test from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';
const file=new URL('../integration/guide-source-connection-native.mjs',import.meta.url),AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
for(const rejected of ['inspector','worker-observer','worker-session','browser','ide-session','ide-transport','code','vite','log','desktop','ports','none'])test('actual independent finalizer attempts every owned boundary after '+rejected+' refusal',async()=>{
 const s=await readFile(file,'utf8'),body=s.split('// Independent cleanup begins\n')[1]?.split('// Independent cleanup ends')[0];assert(body,'actual finalizer missing');
 const events=[],errors=[],r={};const fn=new AsyncFunction('attempt','closeInspector','closeObserver','closeWorker','closeBrowser','closeIDESession','closeIDE','closeCode','closeVite','closeLog','closeDesktop','closePorts',body);
 const names=['inspector','worker-observer','worker-session','browser','ide-session','ide-transport','code','vite','log','desktop','ports'];const callbacks=names.map(name=>async()=>{events.push(name);if(name===rejected)throw Error('refused '+name);});
 await fn(async(stage,fn)=>{try{await fn();}catch(e){errors.push(stage);}},...callbacks);assert.deepEqual(events,names);assert.deepEqual(errors,rejected==='none'?[]:[rejected]);
});
test('actual case read stays inside protected initialization and result finalizer',async()=>{const s=await readFile(file,'utf8');assert(s.indexOf('try{\n r.phase=')<s.indexOf('scenario=await json(caseFile)'));assert(s.includes("r.inputInventoryUnavailable=true"));assert(s.includes("writeFile(out+'/results.json'"));});
test('actual browser close retains rejected handle and explicitly records unconfirmed outcome',async()=>{const s=await readFile(file,'utf8'),body=s.split('// Owned browser close begins\n')[1]?.split('// Owned browser close ends')[0];assert(body);const r={},events=[];let count=0;const browser={context:{async close(){events.push('browser');if(++count===1)throw Error('close refused');}}};await new AsyncFunction('browser','r','assert',body+'\nawait assert.rejects(closeBrowser());assert.equal(r.ownedBrowserClosed,false);assert(browser);await closeBrowser();assert.equal(browser,null);assert.equal(r.ownedBrowserClosed,true);')(browser,r,assert);assert.deepEqual(events,['browser','browser']);});
for(const failure of ['fill','connect','wait','clear','none'])test('actual receipt interaction and reporting boundary excludes synthetic secret after '+failure,async()=>{
 const source=await readFile(file,'utf8'),raw=JSON.stringify({token:'SYNTHETIC-PRIVATE-TOKEN-DO-NOT-RETAIN',origin:'http://127.0.0.1:9'}),sentinel='SYNTHETIC-PRIVATE-TOKEN-DO-NOT-RETAIN';
 const {nativeInspectorUI}=await import('../helpers/native-inspector-ui.mjs');let reads=0;
 const panel={async evaluate(fn){if(fn.toString().includes('document.querySelector(s).value')){reads++;const value=failure==='fill'?'mismatched':reads===1||failure==='clear'?raw:'';return new Function('document','s','return ('+fn.toString()+')(s)')({querySelector:()=>({value})},null);}return undefined;}};
 const ui=await nativeInspectorUI(panel,{context:{newCDPSession:async()=>({send:async()=>({})})}});ui.click=async()=>{if(failure==='connect')throw Error(raw);};ui.waitOK=async()=>{if(failure==='wait')throw Error(raw);};
 const wrapper=source.split('// Private receipt interaction begins\n')[1]?.split('// Private receipt interaction ends')[0];
 const original=source.slice(source.indexOf("await ui.fill('connection-receipt',raw)"),source.indexOf('await ui.select(\'site-mode\'',source.indexOf("await ui.fill('connection-receipt',raw)")));
 const action=wrapper?'await connectPrivateReceipt(raw);':original;
 assert(action.includes('Receipt')||action.includes('ui.fill'),'actual receipt interaction missing');
 const failed=source.split('const failed=')[1].split('\n')[0],catchBody=source.split('}catch(error){')[1].split('}\nfinally{')[0];
 const r={phase:'private-receipt',privateReceipt:{},errors:[]},printed=[];
 await new AsyncFunction('assert','ui','panel','r','process','console','raw','const failed='+failed+'\n'+(wrapper||'')+'\ntry{'+action+'}catch(error){'+catchBody+'}')(assert,ui,panel,r,{exitCode:0},{error:s=>printed.push(s)},raw);
 const output=JSON.stringify({r,printed});assert(!output.includes(sentinel),'Synthetic secret reached actual persisted/printed failure');
 if(failure==='none'){assert.equal(r.privateReceipt.secretCleared,true);assert.equal(r.errors.length,0);assert.equal(printed.length,0);}else{assert.equal(r.errors.length,1);assert.equal(r.errors[0].code,'PRIVATE_RECEIPT_UI_FAILED');assert.match(r.errors[0].message,new RegExp('Private receipt '+failure));assert.equal(printed.length,1);}
});
