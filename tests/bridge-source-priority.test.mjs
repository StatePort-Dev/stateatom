// SPDX-License-Identifier: Apache-2.0
// Actual local helper HTTP/source analysis, synthetic workspace, no browser proof.
import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {startBridge} from '../core/bridge.mjs';
const digest=s=>createHash('sha256').update(s).digest('hex');
async function fixture(t){
 const root=await mkdtemp('/tmp/atom-priority-bridge-');t.after(()=>rm(root,{recursive:true,force:true}));
 await mkdir(root+'/src');await mkdir(root+'/src/zzz');
 for(let i=0;i<160;i++)await writeFile(root+'/src/a'+String(i).padStart(3,'0')+'.js','export const filler'+i+' = '+i+';');
 const file='src/zzz/Screen.jsx',text='export const flag = false;\nexport const Screen = () => <button id="confirm" disabled={flag}>Confirm</button>;\n';
 await writeFile(root+'/'+file,text);
 const bridge=startBridge({root,port:0,token:'b'.repeat(64)});await bridge.ready;bridge.cfg.port=bridge.server.address().port;t.after(()=>bridge.close());
 const request=async(op,body)=>(await fetch('http://127.0.0.1:'+bridge.cfg.port+'/'+op,{method:'POST',headers:{origin:'chrome-extension://'+'a'.repeat(32),authorization:'Bearer '+'b'.repeat(64),'content-type':'application/json'},body:JSON.stringify(body)})).json();
 assert.equal((await request('pair',{origin:'http://localhost:5173',sourceRoot:'src'})).ok,true);
 const selection={selector:'#confirm',id:'confirm',tag:'button',classes:[],owners:[],text:'Confirm',property:'disabled',value:false,marker:file+':2:'+digest(text).slice(0,12)+':'+(text.split('\n')[1].indexOf('<button')+1),instance:'instance-A',page:'page-A'};
 const target={id:'target',file,sourceDigest:digest(text),kind:'target',expression:'flag',value:false,deps:['read'],line:2,column:1,status:'Observed'};
 const trace={status:'Observed',target,nodes:[target,{...target,id:'read',kind:'read',deps:[]}],page:'page-A'};
 return{root,file,text,trace,analyze:async deepTrace=>request('analyze',{origin:'http://localhost:5173',selection,deepTrace,samples:[],requests:[],run:'source-priority'})};
}
test('actual helper binds late selected source and validates exact trace after160 unrelated files',async t=>{
 const f=await fixture(t),r=await f.analyze(f.trace);assert.equal(r.ok,true,r.error);assert.deepEqual(r.result.boundFiles,[f.file]);assert.equal(r.result.stateatom.runtime.status,'Observed');assert.equal(r.result.sources.length,1);assert.equal(r.result.sources[0].sourceDigest,digest(f.text));assert(r.result.sources[0].expressions.includes('flag'));
});
test('actual helper also acquires a late distinct trace dependency within the shared budget',async t=>{
 const f=await fixture(t),file='src/zzz/dependency.js',text='export const original = false;';await writeFile(f.root+'/'+file,text);
 const r=await f.analyze({...f.trace,nodes:[...f.trace.nodes,{id:'dep',file,sourceDigest:digest(text),kind:'read',expression:'original',value:false,status:'Observed'}]});assert.equal(r.ok,true,r.error);assert.equal(r.result.stateatom.runtime.status,'Observed');
});
test('prioritized source never validates a wrong executed digest',async t=>{
 const f=await fixture(t),r=await f.analyze({...f.trace,nodes:f.trace.nodes.map(n=>({...n,sourceDigest:'0'.repeat(64)}))});assert.equal(r.ok,true,r.error);assert.equal(r.result.stateatom.runtime.status,'Stale');
});
test('trace hint outside mapped sources remains unvalidated even inside workspace',async t=>{
 const f=await fixture(t),file='outside.js',text='export const privateValue = 0;';await writeFile(f.root+'/'+file,text);
 const r=await f.analyze({...f.trace,nodes:[...f.trace.nodes,{id:'outside',file,sourceDigest:digest(text),kind:'read',status:'Observed'}]});assert.equal(r.ok,true,r.error);assert.equal(r.result.stateatom.runtime.status,'Stale');assert(!r.result.boundFiles.includes(file));
});
