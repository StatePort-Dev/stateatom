// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {functionEvidence,helperWriterControl,effectFrontier} from '../stateatom-compiler-probe/effect-frontier.mjs';
const point=(source,needle)=>{const offset=source.indexOf(needle);assert(offset>=0);const lines=source.slice(0,offset).split('\n');return{lineNumber:lines.length-1,columnNumber:lines.at(-1).length};};
test('exact native header location selects the nested function without borrowing its enclosing body',()=>{
 const source='function outer(secret) { return function inner(record) { return record.quota * 2; }; }';
 const evidence=functionEvidence(source,point(source,'(record)'));assert.equal(evidence.status,'Observed');assert.equal(evidence.syntax.calls,0);assert.equal(evidence.syntax.memberExpressions,1);assert.equal(evidence.functionDigest.length,64);assert.equal(evidence.readonlyEffects,'Unknown/Unsupported');assert.equal(evidence.fullPath,false);
});
test('method body digest stays identical while a transitive helper body changes',()=>{
 const a='const api = { member(record) { return helper(record); } }; function helper(record) { return record.quota; }';
 const b='const api = { member(record) { return helper(record); } }; function helper(record) { record.quota = record.quota; return record.quota; }';
 const rootA=functionEvidence(a,point(a,'(record)')),rootB=functionEvidence(b,point(b,'(record)'));
 assert.equal(rootA.status,'Observed');assert.equal(rootA.functionDigest,rootB.functionDigest);assert.notEqual(rootA.sourceDigest,rootB.sourceDigest);
 const helperA=functionEvidence(a,point(a,'(record) { return record.quota')),helperB=functionEvidence(b,point(b,'(record) { record.quota'));
 assert.notEqual(helperA.functionDigest,helperB.functionDigest);assert.equal(helperA.syntax.assignments,0);assert.equal(helperB.syntax.assignments,1);assert.equal(helperB.readonlyEffects,'Unknown/Unsupported');
});
test('nested callback effects are counted separately, not attributed as direct parent execution',()=>{
 const source='function parent(record) { const fn = () => { record.quota++; }; return record.quota; }';const evidence=functionEvidence(source,point(source,'(record)'));assert.equal(evidence.status,'Observed');assert.equal(evidence.syntax.nestedFunctions,1);assert.equal(evidence.syntax.updates,0);assert.equal(evidence.syntax.memberExpressions,1);
});
test('ordinary constructor, spread and call syntax remain facts without a readonly conclusion',()=>{
 const source='const run = (input) => { const value = {...input}; return new Set(helper(value)); };';const evidence=functionEvidence(source,point(source,'(input)'));assert.equal(evidence.status,'Observed');assert.equal(evidence.syntax.constructors,1);assert.equal(evidence.syntax.calls,1);assert.equal(evidence.syntax.spreads,1);assert.equal(evidence.readonlyEffects,'Unknown/Unsupported');
});
test('body positions and ambiguous default-parameter function locations never select a nearby function',()=>{
 for(const[source,needle]of[['function fn(record) { return record.quota; }','return'],['function outer(fn = () => 1) { return fn; }','() =>']]){const evidence=functionEvidence(source,point(source,needle));assert.equal(evidence.status,'Unknown/Unsupported');assert.match(evidence.reason,/exact function header/);}
});
test('opaque function has no invented body or builtin identity',()=>{
 const evidence=functionEvidence('',null);assert.equal(evidence.status,'Unknown/Unsupported');assert.equal(evidence.functionDigest,undefined);assert.match(evidence.reason,/builtin identity/);assert.equal(evidence.fullPath,false);
});
test('invalid native positions and UTF-8 source budgets fail closed',()=>{
 for(const location of[{lineNumber:-1,columnNumber:0},{lineNumber:0,columnNumber:999},{lineNumber:0.5,columnNumber:0}])assert.equal(functionEvidence('function f(){}',location).status,'Unknown/Unsupported');
 const source='//'+ 'é'.repeat(131072)+'\nfunction f(){}';const evidence=functionEvidence(source,point(source,'()'));assert.equal(evidence.status,'Unknown/Unsupported');assert.match(evidence.reason,/source budget/);
});
test('native line numbers recognize every JS line terminator without borrowing a later function',()=>{
 const expected=createHash('sha256').update('function b() { return "B"; }').digest('hex');
 for(const separator of['\r','\u2028','\u2029','\r\n','\n']){
  const source='function a() {}'+separator+'function b() { return "B"; }\nfunction c() { return "C"; }';
  const evidence=functionEvidence(source,{lineNumber:1,columnNumber:10});
  assert.equal(evidence.status,'Observed');assert.equal(evidence.functionDigest,expected,JSON.stringify(separator));
  assert.equal(functionEvidence(source,{lineNumber:0,columnNumber:16}).status,'Unknown/Unsupported');
 }
});
test('one bounded final inert inline-map comment preserves full digest and exact original function offsets',()=>{
 const code='function fn(record) { return record.quota; }',source=code+'\n//# sourceMappingURL=data:application/json;base64,'+'eA=='.repeat(80000);
 // A real encoded payload has padding only at the end.
 const valid=code+'\n//# sourceMappingURL=data:application/json;base64,'+Buffer.from('x'.repeat(240000)).toString('base64');
 const evidence=functionEvidence(valid,point(valid,'(record)'));assert.equal(evidence.status,'Observed');assert.equal(evidence.functionDigest,functionEvidence(code,point(code,'(record)')).functionDigest);assert.equal(evidence.sourceDigest,createHash('sha256').update(valid).digest('hex'));assert.equal(functionEvidence(source,point(source,'(record)')).status,'Unknown/Unsupported');
});
test('declared helper writer changes only the selected helper body, with no wrapper unwrapping',()=>{
 const source='export function createObserver(){ function add(meta,value){return value;} return {member(meta,obj,key){const value=obj[key]; add(meta,value);return value;}}; }';const changed=helperWriterControl(source);
 assert.notEqual(changed,source,'Declared writer control must alter the helper body');
 assert.notEqual(functionEvidence(source,point(source,'(meta,value)')).functionDigest,functionEvidence(changed,point(changed,'(meta, value)')).functionDigest);
 const before=functionEvidence(source,point(source,'(meta,obj,key)')),after=functionEvidence(changed,point(changed,'(meta, obj, key)'));assert.equal(before.syntax.calls,after.syntax.calls);assert.equal(after.readonlyEffects,'Unknown/Unsupported');assert.throws(()=>helperWriterControl('function other(){}'),/exact add helper/);
});

function frontierFixture({large='function helper() {}',failure=false,foreign=false}={}){
 const rootSource='function member() {}',fn=name=>({type:'function',objectId:name}),member=fn('member'),keys=['object','mapRead','ownDescriptor','potentialObject','add','pointer','telemetryOps'];
 const refs={guard(){},location:async f=>({scriptId:f===member?'root':'large',lineNumber:0,columnNumber:10}),data:(p,k)=>p.result.find(v=>v.name===k).value,properties:async r=>{
  if(r===member)return{result:[],internalProperties:[{name:'[[Scopes]]',value:{objectId:'scopes'}}]};
  if(r.objectId==='scopes')return{result:[{name:'0',value:{objectId:'scope',subtype:'internal#scope'}}]};
  if(r.objectId==='scope')return{result:keys.map(name=>({name,value:fn(name)}))};
  throw Error('End mock after source probes');
 }};
 const requests=[],cdp={send:async(_,args)=>{requests.push(args.scriptId);if(failure&&args.scriptId==='large')throw Error('Declared unavailable script');return{scriptSource:args.scriptId==='root'?rootSource:large};}};
 const contexts=new Map([[1,{auxData:{isDefault:true,frameId:'frame'},uniqueId:'context'}],[2,{auxData:{isDefault:true,frameId:'foreign'},uniqueId:'foreign'}]]),scripts=new Map([['root',{executionContextId:1}],['large',{executionContextId:foreign?2:1}]]);
 return{requests,run:()=>effectFrontier({refs,cdp,member,binding:{frameId:'frame',contextUniqueId:'context',callee:{sourceDigest:createHash('sha256').update(rootSource).digest('hex')}},scripts,contexts})};
}
test('source budget overflow stops subsequent source requests, including the same oversized helper',async()=>{
 const fixture=frontierFixture({large:'function helper() {}/*'+'x'.repeat(1050000)+'*/'}),inventory=await fixture.run();
 assert.deepEqual(fixture.requests,['root','large']);assert.equal(inventory.sourceRequests,2);assert.equal(inventory.sourceBudgetExceeded,true);assert(inventory.sourceBytes>inventory.limits.sourceBytes);assert.equal(inventory.readonlyEffects,'Unknown/Unsupported');assert.equal(inventory.complete,false);
});
test('failed script requests are cached as Unknown without a repeated protocol fetch',async()=>{
 const fixture=frontierFixture({failure:true}),inventory=await fixture.run();assert.deepEqual(fixture.requests,['root','large']);
 assert(inventory.nodes.filter(n=>n.key!=='member').every(n=>n.evidence.status==='Unknown/Unsupported'));assert.equal(inventory.fullPath,false);
});
test('a foreign-context helper never borrows the bound entry source context',async()=>{
 const fixture=frontierFixture({foreign:true}),inventory=await fixture.run();assert.deepEqual(fixture.requests,['root']);
 assert(inventory.nodes.filter(n=>n.key!=='member').every(n=>n.evidence.status==='Unknown/Unsupported'));assert.equal(inventory.readonlyEffects,'Unknown/Unsupported');
});
test('add edges use the actual add closure slots rather than borrowing member telemetryOps',async()=>{
 const fn=objectId=>({type:'function',objectId}),obj=objectId=>({type:'object',objectId}),rootSource='function member() {}',dependencySource='function dependencies() { return 1; }';
 const member=fn('member'),slots={member:{object:fn('object'),mapRead:fn('mapRead'),ownDescriptor:fn('ownDescriptor'),potentialObject:fn('potentialObject'),add:fn('add'),pointer:fn('pointer'),telemetryOps:obj('memberOps')},add:{primitive:fn('primitive'),feed:fn('feed'),telemetryOps:obj('addOps')},now:{clock:fn('clock')},dependencies:{S:fn('S'),describe:fn('describe'),append:fn('append')},mapSet:{set:fn('set'),invoke:fn('invoke')},potentialObject:{nativeWeakSetHas:fn('nativeWeakSetHas')}};
 const memberOps=Object.fromEntries(['weakGet','weakHas','string','dependencies','now','mapSet','mapSize','mapDelete','firstKey'].map(k=>[k,fn(k==='dependencies'?'borrowedDependencies':k)])),addOps=Object.fromEntries(['dependencies','now','mapSet','mapSize','mapDelete','firstKey'].map(k=>[k,fn(k)]));
 const props=values=>({result:Object.entries(values).map(([name,value])=>({name,value}))}),requests=[];
 const refs={guard(){},data:(p,k)=>p.result.find(v=>v.name===k).value,location:async f=>({scriptId:f.objectId==='dependencies'?'deps':f.objectId==='borrowedDependencies'?'borrowed':'root',lineNumber:0,columnNumber:10}),properties:async r=>{
  const id=r.objectId;if(id==='memberOps')return props(memberOps);if(id==='addOps')return props(addOps);
  if(id.startsWith('scopes:'))return props({'0':{...obj('scope:'+id.slice(7)),subtype:'internal#scope'}});
  if(id.startsWith('scope:'))return props(slots[id.slice(6)]);
  return{result:[],internalProperties:slots[id]?[{name:'[[Scopes]]',value:obj('scopes:'+id)}]:[]};
 }};
 const cdp={send:async(_,args)=>{requests.push(args.scriptId);return{scriptSource:args.scriptId==='deps'?dependencySource:rootSource};}},scripts=new Map(['root','deps','borrowed'].map(id=>[id,{executionContextId:1}])),contexts=new Map([[1,{auxData:{isDefault:true,frameId:'frame'},uniqueId:'context'}]]);
 const inventory=await effectFrontier({refs,cdp,member,binding:{frameId:'frame',contextUniqueId:'context',callee:{sourceDigest:createHash('sha256').update(rootSource).digest('hex')}},scripts,contexts});
 assert.equal(inventory.referenceStatus,'Observed');assert.equal(inventory.nodes.length,25);assert.equal(inventory.nodes.find(n=>n.key==='dependencies').evidence.sourceDigest,createHash('sha256').update(dependencySource).digest('hex'));assert(requests.includes('deps'));assert(!requests.includes('borrowed'));assert.equal(inventory.readonlyEffects,'Unknown/Unsupported');
});
