// SPDX-License-Identifier: Apache-2.0
// Synthetic hook controls; not native compiler or browser evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {ServerResponse} from 'node:http';
import {PassThrough} from 'node:stream';
import {once} from 'node:events';
import {installCompilerAcquisition} from '../stateatom-compiler-probe/acquire.mjs';
import {compilerLedger,compilerHash} from '../stateatom-compiler-probe/model.mjs';
function setup({lateClone=false,cloneDuringWarmup=false}={}){
 const input='export const x=1;',id='/project/App.tsx',ledger=compilerLedger({[id]:{file:'App.tsx',digest:compilerHash(input)}});
 let cached,original,release;const gate=new Promise(resolve=>release=resolve),mod={id,file:id};
 const observer={transform(code){return{code};}},graph={updateModuleTransformResult(_mod,result){cached=result;},invalidateModule(){}};
 const container={async transform(code,moduleId){const r=observer.transform(code,moduleId);if(lateClone)gate.then(()=>graph.updateModuleTransformResult(mod,{code:r.code}));return r;}};
 const env={config:{consumer:'client',dev:{moduleRunnerTransform:false}},async warmupRequest(){const r=await container.transform(input,id);original={code:r.code};graph.updateModuleTransformResult(mod,original);if(cloneDuringWarmup)graph.updateModuleTransformResult(mod,{code:r.code});},moduleGraph:graph,pluginContainer:container,async transformRequest(){if(cached)return cached;const r=await container.transform(input,id);original={code:r.code};graph.updateModuleTransformResult(mod,original);return original;}};
 const bodies=[],server={environments:{client:env},config:{root:'/project'},middlewares:{stack:[]}},audit=installCompilerAcquisition(server,observer,ledger,{onBody:(_url,body)=>bodies.push(body)});
 async function request({callback=false,chunks,abort=false,monitorError=false}={}){const req={url:'/App.tsx',method:'GET'},res=new ServerResponse(req);res.assignSocket(new PassThrough());const finished=monitorError?null:once(res,'finish');res.setHeader('content-type','application/javascript');await server.middlewares.stack[0].handle(req,res,async()=>{const r=await env.transformRequest(req.url);if(abort){res.write(r.code);res.emit('close');res.end();}else if(monitorError){res.write(r.code);assert.throws(()=>res.emit('error',new Error('original response error')),/original response error/);res.end();}else if(chunks){for(const [chunk,encoding] of chunks)res.write(chunk,encoding);res.end();}else if(callback)res.end(()=>{});else res.end(r.code);});if(!monitorError)await finished;else await Promise.resolve();return res;}
 return {audit,ledger,request,release,env,bodies,cached:()=>cached,original:()=>original};
}
test('valid native end(callback) passes through without acquisition TypeError',async()=>{const s=setup();try{await s.request({callback:true});}finally{s.audit.close();}});
test('capture respects native write string encoding',async()=>{const s=setup();try{await s.request({chunks:[['e9','hex']]});assert.equal(s.bodies.length,0);assert(s.audit.errors.includes('Noncanonical UTF-8 response'));}finally{s.audit.close();}});
test('receipt retention stops at 256 with sticky loss',async()=>{const s=setup();try{for(let i=0;i<300;i++)await s.request();assert.equal(s.audit.receipts.length,256);assert(s.ledger.report().gaps.includes('Receipt budget'));}finally{s.audit.close();}});
test('late graph registration cannot launder an equal-code cached clone',async()=>{const s=setup({lateClone:true});try{await s.request();assert.equal(s.audit.receipts[0].claim.status,'Observed');s.release();await Promise.resolve();assert.notEqual(s.cached(),s.original());await s.request();assert.equal(s.audit.receipts[1].claim.status,'Unknown/Unsupported');}finally{s.audit.close();}});

test('abort clears retained bytes and cannot create a finished receipt',async()=>{const s=setup();try{await s.request({abort:true});assert.deepEqual(s.audit.captureState(),{active:0,retainedBytes:0});assert.equal(s.audit.receipts.length,0);assert.equal(s.bodies.length,0);}finally{s.audit.close();}});
test('error monitoring clears capture without swallowing the original unhandled error',async()=>{const s=setup();try{await s.request({monitorError:true});assert.deepEqual(s.audit.captureState(),{active:0,retainedBytes:0});assert.equal(s.audit.receipts.length,0);}finally{s.audit.close();}});

test('Vite 7.3 warmup-only cache has no original transform-return witness and remains unsupported',async()=>{const s=setup();try{await s.env.warmupRequest('/App.tsx');await s.request();assert.equal(s.audit.receipts[0].claim.status,'Unknown/Unsupported');}finally{s.audit.close();}});
test('completed unsupported warmup and a delayed equal-code clone both remain unsupported',async()=>{const s=setup({lateClone:true});try{await s.env.warmupRequest('/App.tsx');await s.request();assert.equal(s.audit.receipts[0].claim.status,'Unknown/Unsupported');s.release();await Promise.resolve();assert.notEqual(s.cached(),s.original());await s.request();assert.equal(s.audit.receipts[1].claim.status,'Unknown/Unsupported');}finally{s.audit.close();}});

test('graph clone installed before native warmup completion cannot become an actual pipeline result witness',async()=>{const s=setup({cloneDuringWarmup:true});try{await s.env.warmupRequest('/App.tsx');await s.request();assert.equal(s.audit.receipts[0].claim.status,'Unknown/Unsupported');}finally{s.audit.close();}});
