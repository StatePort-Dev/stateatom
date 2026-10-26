// SPDX-License-Identifier: Apache-2.0
// OWNED protocol/grammar execution, not actual React/browser or unique source entry.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {instrumentComponentCallGrammar} from '../../experiments/react19-reducer/component-call-transform.mjs';
import {componentCallGrammar} from '../helpers/react19-component-call-grammar.mjs';
const api=await import('../../experiments/react19-reducer/component-call-observer.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return{};throw e;});
const U='Unknown/Unsupported',file='react-dom/cjs/react-dom-client.development.js';
const prepared=instrumentComponentCallGrammar(componentCallGrammar(),file);
function make(options={}){assert.equal(typeof api.createNativeComponentCallObserver,'function');return api.createNativeComponentCallObserver({page:'owned-frame',policy:prepared.policy,...options});}
function direct(options={}){
 const observer=make(options),fiber={},props={},result={},Component=function Item(){},site=prepared.policy.sites[0].id;
 const begin=()=>observer.tap('component-call-begin',fiber,Component,props,site);
 const finish=token=>{observer.tap('component-call-return',token,result,site);observer.tap('component-call-end',token,site);return token;};
 return{observer,fiber,props,result,Component,site,begin,finish};
}
function emitted(observer){const tokens=[],context=vm.createContext({__STATEATOM_COMPONENT_CALL_TAP__:function(){const token=Reflect.apply(observer.tap,undefined,arguments);if(arguments[0]==='component-call-begin')tokens.push(token);return token;}});new vm.Script(prepared.code).runInContext(context);return{f:context.__fixture,tokens};}
function unknown(dto){assert.equal(dto.status,U);assert.equal(dto.match,null);assert.equal(dto.nativeOrigin,'NotAttested');assert.equal(dto.sourceOnly,true);assert.equal(dto.componentInvocationRuntimeQualified,false);assert.equal(dto.fullPath,false);}
for(const method of ['initial','again'])test('emitted '+method+' brackets resolve only after normal end with exact live refs',()=>{
 const o=make(),{f,tokens}=emitted(o),p={},value={};let inside;
 function Component(props){assert.equal(props,p);inside=o.currentToken(Component);assert(inside);unknown(o.lookup(inside));return value;}
 assert.equal(f[method](Component,p),value);assert.equal(f.count(),1);assert.equal(tokens.length,1);assert.equal(inside,tokens[0]);assert.equal(o.currentToken(Component),null);
 const dto=o.match(inside,method==='initial'?f.work:f.againWork,Component,p,value);assert.equal(dto.status,'Observed');assert.equal(dto.match.role,method==='initial'?'initial':'again');assert.equal(dto.match.parentFrameId,null);assert.equal(dto.nativeOrigin,'NotAttested');assert.equal(dto.componentInvocationRuntimeQualified,false);assert.equal(dto.sourceOnly,true);assert.equal(dto.fullPath,false);
 assert.deepEqual({...o.retention()},{events:3,framesCreated:1,activeDepth:0,stopped:false,capped:false,faulted:false,available:true,strongApplicationPins:0});
});
test('same function reentrant parameter getter receives distinct frames and restores outer top',()=>{
 const o=make(),{f,tokens}=emitted(o),bodies=[];let outerToken;
 const inner={todo:'INNER'},outer={get todo(){outerToken=o.currentToken(Component);assert(outerToken);assert.equal(f.again(Component,inner),'INNER');assert.equal(o.currentToken(Component),outerToken);return'OUTER';}};
 function Component({todo}){bodies.push([todo,o.currentToken(Component)]);return todo;}
 assert.equal(f.initial(Component,outer),'OUTER');assert.equal(tokens.length,2);assert.notEqual(tokens[0],tokens[1]);assert.equal(bodies[0][1],tokens[1]);assert.equal(bodies[1][1],tokens[0]);assert.equal(o.lookup(tokens[1]).match.parentFrameId,o.lookup(tokens[0]).match.frameId);assert.equal(f.count(),2);
});
test('currentToken never searches lower frames and returned-but-not-ended frame is not pending',()=>{
 const d=direct(),outer=d.begin(),Other=function Other(){},inner=d.observer.tap('component-call-begin',{},Other,{},d.site);
 assert.equal(d.observer.currentToken(d.Component),null);assert.equal(d.observer.currentToken(Other),inner);d.observer.tap('component-call-return',inner,{},d.site);assert.equal(d.observer.currentToken(Other),null);d.observer.tap('component-call-end',inner,d.site);assert.equal(d.observer.currentToken(d.Component),outer);d.finish(outer);assert.equal(d.observer.lookup(outer).status,'Observed');
});
test('direct user recursion deliberately shares context, never claims unique source body entry',()=>{
 const o=make(),{f,tokens}=emitted(o),seen=[];function Component({n}){seen.push(o.currentToken(Component));return n?Component({n:n-1}):{};}
 f.initial(Component,{n:1});assert.equal(seen.length,2);assert.equal(seen[0],seen[1]);assert.equal(tokens.length,1);assert.equal(o.lookup(tokens[0]).sourceEntryAssociation,U);
});
test('original thrown opaque object remains identical, complete throw frame stays Unknown',()=>{
 const o=make(),{f,tokens}=emitted(o);let reads=0;const error={get message(){reads++;throw Error('reflection');}};
 assert.throws(()=>f.initial(()=>{throw error;},{}),e=>e===error);assert.equal(reads,0);unknown(o.lookup(tokens[0]));assert.equal(o.retention().activeDepth,0);
});
test('returned primitive supports interval only and never value-based result association',()=>{const d=direct(),t=d.begin();d.observer.tap('component-call-return',t,7,d.site);d.observer.tap('component-call-end',t,d.site);assert.equal(d.observer.lookup(t).status,'Observed');unknown(d.observer.match(t,d.fiber,d.Component,d.props,7));});
test('opaque application values are not reflected or serialized into DTOs',()=>{
 let reads=0;const hostile=()=>new Proxy({},{get(){reads++;throw Error('get');},ownKeys(){reads++;throw Error('keys');},getOwnPropertyDescriptor(){reads++;throw Error('descriptor');}}),o=make(),fiber=hostile(),props=hostile(),result=hostile(),Component=function SecretComponent(){};
 const t=o.tap('component-call-begin',fiber,Component,props,prepared.policy.sites[0].id);o.tap('component-call-return',t,result,prepared.policy.sites[0].id);o.tap('component-call-end',t,prepared.policy.sites[0].id);const dto=o.match(t,fiber,Component,props,result);assert.equal(dto.status,'Observed');const text=JSON.stringify(dto);assert(!text.includes('SecretComponent'));assert.equal(reads,0);assert.equal(Object.getPrototypeOf(dto),null);assert.equal(Object.getPrototypeOf(dto.match),null);assert(Object.isFrozen(dto));assert(Object.isFrozen(t));assert.deepEqual(Reflect.ownKeys(t),[]);
});
for(const key of ['fiber','Component','props','result'])test('equal-looking '+key+' reference cannot substitute for original',()=>{const d=direct(),t=d.finish(d.begin()),values={fiber:d.fiber,Component:d.Component,props:d.props,result:d.result};values[key]=key==='Component'?function Item(){}:{};unknown(d.observer.match(t,values.fiber,values.Component,values.props,values.result));assert.equal(d.observer.lookup(t).status,'Observed');});
for(const [name,breakIt]of [
 ['missing token',d=>d.observer.tap('component-call-return',undefined,d.result,d.site)],
 ['forged token',d=>d.observer.tap('component-call-return',{},d.result,d.site)],
 ['foreign consumer token',d=>d.observer.tap('component-call-return',direct().begin(),d.result,d.site)],
 ['wrong site',d=>d.observer.tap('component-call-return',d.active,d.result,prepared.policy.sites[1].id)],
 ['unknown site',d=>d.observer.tap('component-call-return',d.active,d.result,'not-admitted')],
 ['missing outcome',d=>d.observer.tap('component-call-end',d.active,d.site)],
 ['duplicate outcome',d=>{d.observer.tap('component-call-return',d.active,d.result,d.site);d.observer.tap('component-call-return',d.active,d.result,d.site);}],
 ['duplicate end',d=>{d.finish(d.active);d.observer.tap('component-call-end',d.active,d.site);}],
 ['out-of-order outer return',d=>{d.begin();d.observer.tap('component-call-return',d.active,d.result,d.site);}],
 ['wrong arity',d=>d.observer.tap('component-call-return',d.active,d.result,d.site,'extra')],
 ['unknown kind',d=>d.observer.tap('component-call-other',d.active,d.site)],
 ['begin on returned frame before end',d=>{d.observer.tap('component-call-return',d.active,d.result,d.site);d.begin();}]
])test('protocol '+name+' terminally invalidates all previous positives',()=>{const d=direct(),previous=d.finish(d.begin());assert.equal(d.observer.lookup(previous).status,'Observed');d.active=d.begin();assert.doesNotThrow(()=>breakIt(d));unknown(d.observer.lookup(previous));unknown(d.observer.lookup(d.active));assert.equal(d.observer.currentToken(d.Component),null);assert.equal(d.observer.retention().faulted,true);assert.equal(d.observer.retention().activeDepth,0);assert.equal(d.begin(),undefined);});
test('missing end never produces a complete interval',()=>{const d=direct(),t=d.begin();d.observer.tap('component-call-return',t,d.result,d.site);unknown(d.observer.lookup(t));assert.equal(d.observer.retention().activeDepth,1);});
class ControlledRef{static rows=[];constructor(v){this.value=v;ControlledRef.rows.push(this);}deref(){return this.value;}static clear(v){for(const r of this.rows)if(r.value===v)r.value=undefined;}}
for(const key of ['fiber','Component','props','result'])test('deterministic weak '+key+' loss refuses former complete interval without GC-cause claim',()=>{const d=direct({weakRef:ControlledRef}),t=d.finish(d.begin());assert.equal(d.observer.lookup(t).status,'Observed');ControlledRef.clear(d[key]);unknown(d.observer.lookup(t));unknown(d.observer.match(t,d.fiber,d.Component,d.props,d.result));});
test('weak top reference loss never falls back to outer frame',()=>{const d=direct({weakRef:ControlledRef}),outer=d.begin(),innerProps={},inner=d.observer.tap('component-call-begin',{},d.Component,innerProps,d.site);assert.notEqual(inner,outer);ControlledRef.clear(innerProps);assert.equal(d.observer.currentToken(d.Component),null);});
test('Stop clears complete and active records and cannot restart',()=>{const d=direct(),complete=d.finish(d.begin()),active=d.begin();d.observer.stop();unknown(d.observer.lookup(complete));unknown(d.observer.lookup(active));assert.equal(d.begin(),undefined);assert.equal(d.observer.retention().activeDepth,0);assert.equal(d.observer.retention().stopped,true);});
test('Off does not inspect policy, emit tokens or alter original getter/result behavior',()=>{let reads=0;const policy=new Proxy({},{ownKeys(){throw Error('off policy touched');}}),o=make({enabled:false,policy}),{f,tokens}=emitted(o),p={get todo(){reads++;return 9;}};assert.equal(f.initial(({todo})=>todo,p),9);assert.equal(reads,1);assert.deepEqual(tokens,[undefined]);unknown(o.lookup({}));assert.equal(o.retention().events,0);});
test('missing WeakRef has explicit refusal and no token',()=>{const d=direct({weakRef:null});assert.equal(d.begin(),undefined);unknown(d.observer.lookup({}));assert.equal(d.observer.retention().available,false);});
test('WeakRef allocation fault terminally refuses instead of leaving an older positive',()=>{let broken=false;class FaultRef{constructor(v){if(broken)throw Error('allocation');this.value=v;}deref(){return this.value;}}const d=direct({weakRef:FaultRef}),t=d.finish(d.begin());broken=true;assert.equal(d.begin(),undefined);unknown(d.observer.lookup(t));assert.equal(d.observer.retention().faulted,true);});
test('research depth overflow clears every frame instead of borrowing top or parent',()=>{const d=direct(),tokens=[];for(let i=0;i<64;i++)tokens.push(d.begin());assert(tokens.every(Boolean));assert.equal(d.observer.retention().activeDepth,64);assert.equal(d.begin(),undefined);assert.equal(d.observer.retention().capped,true);assert.equal(d.observer.retention().activeDepth,0);for(const t of tokens)unknown(d.observer.lookup(t));});
test('research event capacity invalidates already completed tokens',()=>{const d=direct();let first;for(let i=0;i<1365;i++){const t=d.finish(d.begin());if(i===0)first=t;}assert.equal(d.observer.retention().events,4095);assert.equal(d.observer.lookup(first).status,'Observed');const last=d.begin();assert(last);d.finish(last);assert.equal(d.observer.retention().capped,true);unknown(d.observer.lookup(first));assert.equal(d.observer.retention().activeDepth,0);});
for(const [name,mutate]of [
 ['schema',p=>p.schema='other'],['duplicate ID',p=>p.sites[1].id=p.sites[0].id],['wrong owner',p=>p.sites[0].owner='nearby'],['wrong callee',p=>p.sites[0].callee='nearby'],['missing coordinates',p=>delete p.sites[0].line],['extra site',p=>p.sites.push({...p.sites[0]})],['unpinned true',p=>p.nativeVersionAdmitted=true],['wrong source file',p=>p.file='other.js']
])test('policy '+name+' cannot admit events',()=>{const p=structuredClone(prepared.policy);mutate(p);const d=direct({policy:p});assert.equal(d.begin(),undefined);unknown(d.observer.lookup({}));assert.equal(d.observer.retention().available,false);});
test('own-data policy validation never invokes accessors',()=>{let reads=0;const p=structuredClone(prepared.policy);Object.defineProperty(p.sites[0],'id',{get(){reads++;throw Error('getter');},enumerable:true});const d=direct({policy:p});assert.equal(d.begin(),undefined);unknown(d.observer.lookup({}));assert.equal(reads,0);});
test('exact pinned source metadata still cannot attest native runtime or body/field origin',()=>{const p=structuredClone(prepared.policy),digest='806b25cf84808a5ae0104e81633caabb1aa11fce71e72ef7afe4c1f8d2ebec08';p.sourceDigest=digest;p.nativeVersionAdmitted=true;p.version='19.2.5';for(const s of p.sites)s.sourceDigest=digest;const d=direct({policy:p}),t=d.finish(d.begin()),dto=d.observer.lookup(t);assert.equal(dto.status,'Observed');assert.equal(dto.nativeOrigin,'NotAttested');assert.equal(dto.componentInvocationRuntimeQualified,false);assert.equal(dto.sourceEntryAssociation,U);assert.equal(dto.selectedPropertyOrigin,U);assert.equal(dto.fieldOwnership,U);assert.equal(dto.fullPath,false);});
