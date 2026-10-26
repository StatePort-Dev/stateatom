// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {parse} from '@babel/parser';
import {elementFiberGrammar} from '../helpers/react19-element-fiber-grammar.mjs';
const load=()=>import('../../experiments/react19-reducer/native-element-fiber-transform.mjs');
const file='react-dom/cjs/react-dom-client.development.js',sha=s=>createHash('sha256').update(s).digest('hex');
function run(source,kind,{observerThrows=false,propsThrows=false,nativeThrows=false,hookAccessor=false,missingHook=false,freshUpdate=false,finishThrows=false,opaqueFiber=false,mutateIntrinsics=false}={}){
 const trace=[],events=[],sentinel={},props={},component=function Item(){},prior={};let hookReads=0,fiberTraps=0;
 const trap=()=>{fiberTraps++;throw Error('opaque fiber');},fiber=opaqueFiber?new Proxy({},{get:trap,getOwnPropertyDescriptor:trap,ownKeys:trap}):{};
 const element={};for(const [key,value] of [['type',component],['key','k'],['props',props],['_owner',null]])Object.defineProperty(element,key,{get(){trace.push('get:'+key);if(key==='props'&&propsThrows)throw sentinel;return value;}});
 const sink=(...args)=>{events.push(args);if(observerThrows)throw Error('observer');return {forged:true};};
 const context=vm.createContext({exports:{},create(...args){trace.push({kind:'create',args:args.map((a,i)=>i===0?a===component:i===2?a===props:a)});if(nativeThrows)throw sentinel;return fiber;},reuse(a,b){trace.push({kind:'reuse',prior:a===prior,props:b===props});if(nativeThrows)throw sentinel;return fiber;},finish(f){trace.push({kind:'finish',same:f===fiber});if(finishThrows)throw sentinel;}});
 if(hookAccessor)Object.defineProperty(context,'__STATEATOM_ELEMENT_FIBER_TAP__',{get(){hookReads++;throw Error('hook getter');}});
 else if(!missingHook)context.__STATEATOM_ELEMENT_FIBER_TAP__=sink;
 vm.runInContext(source,context);let result,caught;
 if(mutateIntrinsics)vm.runInContext('Object.getOwnPropertyDescriptor=()=>{throw Error("late descriptor");};Reflect.apply=()=>{throw Error("late apply");};',context);
 try{result=kind==='create'?context.exports.create(element,0,1):kind==='update'?context.exports.update({},freshUpdate?null:prior,element,1):context.exports.single({},prior,element,1);}catch(e){caught=e;}
 return{trace,events,result,caught,sentinel,fiber,element,props,hookReads,fiberTraps};
}
for(const kind of ['create','update','single'])test('exact original '+kind+' result/getter/arguments/order and reference event',async()=>{
 const m=await load(),r=m.instrumentElementFiberGrammar(elementFiberGrammar,file);assert.equal(r.skipped,false);
 const original=run(elementFiberGrammar,kind),observed=run(r.code,kind);assert.deepEqual(observed.trace,original.trace);
 assert.equal(observed.result,observed.fiber);assert.equal(observed.events.length,1);
 assert.equal(observed.events[0][0],'element-fiber');assert.equal(observed.events[0][1],observed.fiber);assert.equal(observed.events[0][2],observed.element);
 assert.match(observed.events[0][3],/^[a-f0-9]{64}$/);assert.equal(observed.trace.filter(x=>x==='get:props').length,1);
 assert.equal(r.nativeVersionAdmitted,false);assert.equal(r.sourceOnly,true);assert.deepEqual(r.counts,{create:1,update:1,single:1});
});
for(const kind of ['create','update','single'])for(const fault of ['propsThrows','nativeThrows'])test(kind+' preserves exact original '+fault+' without success event',async()=>{
 const m=await load(),r=m.instrumentElementFiberGrammar(elementFiberGrammar,file),original=run(elementFiberGrammar,kind,{[fault]:true}),observed=run(r.code,kind,{[fault]:true});
 assert.equal(original.caught,original.sentinel);assert.equal(observed.caught,observed.sentinel);assert.deepEqual(observed.trace,original.trace);assert.equal(observed.events.length,0);
});
for(const option of ['observerThrows','hookAccessor','missingHook'])test(option+' does not replace native results or execute hook getters',async()=>{
 const m=await load(),r=m.instrumentElementFiberGrammar(elementFiberGrammar,file);
 for(const kind of ['create','update','single']){const a=run(elementFiberGrammar,kind),b=run(r.code,kind,{[option]:true});assert.deepEqual(b.trace,a.trace);assert.equal(b.result,b.fiber);assert.equal(b.caught,undefined);assert.equal(b.hookReads,0);assert.equal(b.events.length,option==='observerThrows'?1:0);}
});
test('native fallback branch emits only creation, never forces reuse',async()=>{
 const m=await load(),r=m.instrumentElementFiberGrammar(elementFiberGrammar,file),a=run(elementFiberGrammar,'update',{freshUpdate:true}),b=run(r.code,'update',{freshUpdate:true});
 assert.deepEqual(b.trace,a.trace);assert.equal(b.result,b.fiber);assert.equal(b.events.length,1);assert.equal(b.events[0][3],r.policy.sites.find(s=>s.role==='create').id);assert(!b.trace.some(x=>x?.kind==='reuse'));
});
test('later original failure preserves a provisional event without claiming native function completion',async()=>{
 const m=await load(),r=m.instrumentElementFiberGrammar(elementFiberGrammar,file);
 for(const kind of ['create','update','single']){const a=run(elementFiberGrammar,kind,{finishThrows:true}),b=run(r.code,kind,{finishThrows:true});assert.equal(b.caught,b.sentinel);assert.deepEqual(b.trace,a.trace);assert.equal(b.events.length,kind==='create'?0:1);}
});
test('helper leaves opaque fiber references untouched and uses captured intrinsics',async()=>{
 const m=await load(),r=m.instrumentElementFiberGrammar(elementFiberGrammar,file);
 for(const kind of ['create','update','single']){const b=run(r.code,kind,{opaqueFiber:true,mutateIntrinsics:true});assert.equal(b.result,b.fiber);assert.equal(b.caught,undefined);assert.equal(b.events.length,1);assert.equal(b.fiberTraps,0);}
});
for(const [name,change] of [
 ['missing',s=>s.replace('function updateElement','function absentUpdate')],
 ['duplicate',s=>s+'\nfunction updateElement(a,b,c,d){}'],
 ['wrong params',s=>s.replace('returnFiber,current,element,lanes','returnFiber,other,element,lanes')],
 ['computed props',s=>s.replace('useFiber(current,element.props)','useFiber(current,element["props"])')],
 ['extra args',s=>s.replace('useFiber(current,element.props)','useFiber(current,element.props,1)')],
 ['wrong return',s=>s.replace('return mode;','return {};')],
 ['shadowed callee',s=>s.replace('if(current)return','const useFiber=()=>({});if(current)return')],
 ['async owner',s=>s.replace('function updateElement','async function updateElement')],
 ['generator owner',s=>s.replace('function updateElement','function* updateElement')],
 ['dynamic eval',s=>s.replace('if(current)return','eval("current");if(current)return')],
 ['mutated element',s=>s.replace('if(current)return','element={};if(current)return')],
 ['nested element mutation',s=>s.replace('if(current)return','function mutate(){element={};}if(current)return')],
 ['duplicate reuse',s=>s.replace('if(current)return','current=useFiber(current,element.props);if(current)return')],
 ['wrong reuse target',s=>s.replace('current=useFiber(current,element.props)','lanes=useFiber(current,element.props)')],
 ['changed creation result',s=>s.replace('finish(mode);return mode;','finish(mode);mode={};return mode;')],
 ['helper collision',s=>s+'\nconst __saElementFiberTap=1;'],
])test('closed native grammar refuses '+name,async()=>{const m=await load(),source=change(elementFiberGrammar),r=m.instrumentElementFiberGrammar(source,file);assert.equal(r.skipped,true);assert.equal(r.code,source);assert.equal(r.nativeVersionAdmitted,false);});
test('malformed/foreign/overbound input cannot acquire a native recipe',async()=>{
 const m=await load();for(const [source,name] of [['function {',file],[elementFiberGrammar,'other.js'],['x'.repeat(4*1024*1024+1),file]]){const r=m.instrumentElementFiberGrammar(source,name);assert.equal(r.skipped,true);assert.equal(r.code,source);}
 assert.throws(()=>m.transformPinnedElementFiber(elementFiberGrammar,file));
});
test('actual retained vendor is pinned and compiled only, no real React execution',async()=>{
 const m=await load(),source=readFileSync('.runtime/todomvc/examples/react/node_modules/react-dom/cjs/react-dom-client.development.js','utf8'),r=m.transformPinnedElementFiber(source,file);
 assert.equal(sha(source),'806b25cf84808a5ae0104e81633caabb1aa11fce71e72ef7afe4c1f8d2ebec08');assert.equal(r.skipped,false);assert.equal(r.nativeVersionAdmitted,true);assert.equal(r.policy.version,'19.2.5');assert.equal(r.policy.sites.length,3);
 assert.deepEqual(r.counts,{create:1,update:1,single:1});assert.equal(r.baseCounts.fiber,1);assert.equal(r.baseCounts['root-current'],1);
 assert.doesNotThrow(()=>parse(r.code,{sourceType:'script'}));assert.equal(r.outputDigest,sha(r.code));
 for(const site of r.policy.sites){assert.equal(site.sourceDigest,sha(source));assert.equal(site.file,file);assert(site.line>0);assert.match(site.id,/^[a-f0-9]{64}$/);}
 assert.throws(()=>m.transformPinnedElementFiber(source+'\n',file));
});
