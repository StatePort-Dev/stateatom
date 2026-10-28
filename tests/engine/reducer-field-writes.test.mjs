// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';
import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {transformSync} from 'esbuild';
const load=()=>import('../../src/engine/reducer-field-writes.mjs');
const base='export const change=(rows,event)=>rows.map(row=>row.id===event.payload.id?{...row,title:event.payload.title}:row);';
const opts={binding:'change',field:'title',observerName:'recordWriter'};
async function compile(source=base,options=opts){return(await load()).instrumentReducerFieldWrites(source,'project/state.js',options);}
function run(source,{recordWriter,...values}={}){const c={exports:{},module:{exports:{}},...values,recordWriter};vm.createContext(c);vm.runInContext(transformSync(source,{format:'cjs'}).code,c);return c.module.exports;}
test('new source recipe admits the original independent reducer field sites without name/path or value oracles',async()=>{
 const file='examples/react/src/todo/reducer.js',source=await readFile(new URL('../../.runtime/todomvc/'+file,import.meta.url),'utf8');
 const old=JSON.parse(await readFile(new URL('../../docs/testing/component-body-native-case.json',import.meta.url),'utf8'));
 assert.equal(createHash('sha256').update(source).digest('hex'),old.originalManifest[file]);
 const r=(await load()).instrumentReducerFieldWrites(source,file,{...opts,binding:'todoReducer'});
 assert.equal(r.status,'Code-linked writer sites');assert.equal(r.sites.length,2);assert(r.sites.every(s=>s.field==='title'&&s.actionPath.join('.')==='payload.title'));assert.equal(r.fullPath,false);assert.equal(r.fieldOwnership,'Unknown/Unsupported');
});
test('held-out renamed reducer, action path and field are admitted with distinct source identity',async()=>{
 const r=await compile('export function revise(items,command){return items.map(item=>item.key===command.data.key?{...item,caption:command.data.caption}:item)}',{binding:'revise',field:'caption',observerName:'recordWriter'});
 assert.equal(r.sites.length,1);assert.equal(r.sites[0].field,'caption');assert.deepEqual(r.sites[0].actionPath,['data','caption']);assert.notEqual(r.sites[0].sourceDigest,(await compile()).sites[0].sourceDigest);
});
test('original action getter executes once and capture sees the exact newly returned row, never unchanged row',async()=>{
 const r=await compile(),calls=[],events=[];let reads=0;const payload={id:1,get title(){reads++;events.push('read');return 'SAME';}},row={id:1,title:'SAME'},other={id:2,title:'SAME'};
 const {change}=run(r.code,{recordWriter:(meta,value)=>{events.push('capture');calls.push({meta,value});}}),result=change([row,other],{payload});
 assert.equal(reads,1);assert.deepEqual(events,['read','capture']);assert.notEqual(result[0],row);assert.equal(result[1],other);assert.equal(calls.length,1);assert.equal(calls[0].value,result[0]);assert.equal(calls[0].meta.id,r.sites[0].id);assert.equal(calls[0].meta.field,'title');
});
test('spread and unrelated property evaluation order stays original; capture happens after completion',async()=>{
 const source='export const change=(rows,event)=>[{...rows[0],title:event.payload.title,tail:mark()}];',r=await compile(source);
 const execute=code=>{const order=[],row={get before(){order.push('spread');return 1;}},payload={get title(){order.push('field');return 'new';}},a=run(code,{recordWriter:()=>order.push('capture'),mark:()=>{order.push('tail');return 3;}}).change([row],{payload});return{order,value:JSON.stringify(a)};};
 const plain=execute(source),observed=execute(r.code);assert.deepEqual(observed.order,[...plain.order,'capture']);assert.equal(observed.value,plain.value);
});
test('original thrown object is unchanged and unsuccessful creation has no receipt',async()=>{
 const r=await compile(),original={original:true};let captures=0,reads=0;
 const {change}=run(r.code,{recordWriter:()=>captures++});assert.throws(()=>change([{id:1}],{payload:{id:1,get title(){reads++;throw original;}}}),e=>e===original);assert.equal(reads,1);assert.equal(captures,0);
});
test('observer failure or absence cannot replace the original result or throw into the app',async()=>{
 const r=await compile();for(const observer of [undefined,()=>{throw Error('observer failure');}]){const a=run(r.code,{recordWriter:observer}).change([{id:1,title:'old'}],{payload:{id:1,title:'new'}});assert.equal(a[0].title,'new');}
});
for(const [name,source] of [
 ['computed','export const change=(s,e)=>[{[key]:1,title:e.payload.title}];'],
 ['duplicate','export const change=(s,e)=>[{title:e.payload.title,title:"overwritten"}];'],
 ['late spread','export const change=(s,e)=>[{title:e.payload.title,...other}];'],
 ['accessor','export const change=(s,e)=>[{get other(){return 1},title:e.payload.title}];'],
 ['prototype','export const change=(s,e)=>[{__proto__:other,title:e.payload.title}];'],
 ['opaque field call','export const change=(s,e)=>[{title:derive(e)}];'],
 ['shadowed action','export const change=(s,event)=>s.map(event=>({title:event.payload.title}));'],
 ['reassigned action','export const change=(s,e)=>{e=other;return [{title:e.payload.title}]};'],
 ['async','export const change=async(s,e)=>[{title:e.payload.title}];'],
 ['observer binding','const recordWriter=()=>{};'+base],
 ['direct eval','export const change=(s,e)=>{eval(e.code);return [{title:e.payload.title}]};']
])test('unsupported writer form leaves original source untouched: '+name,async()=>{const r=await compile(source);assert.equal(r.status,'Unknown/Unsupported');assert.equal(r.code,source);assert.equal(r.sites.length,0);assert.equal(r.fullPath,false);});
test('invalid input or ambiguous reducer refuses without generated source',async()=>{
 for(const source of ['const change=3;','function a(){const change=(s,e)=>({title:e.title})}function b(){const change=(s,e)=>({title:e.title})}','not valid {']){const r=await compile(source);assert.equal(r.code,source);assert.equal(r.status,'Unknown/Unsupported');}
 const r=await compile(base,{...opts,observerName:'x.y'});assert.equal(r.status,'Unknown/Unsupported');assert.equal(r.code,base);
});

test('actual retained reducer executes create and same-title update with exact object capture',async()=>{
 const dir=new URL('../../.runtime/todomvc/examples/react/src/todo/',import.meta.url),source=await readFile(new URL('reducer.js',dir),'utf8'),constantsSource=await readFile(new URL('constants.js',dir),'utf8');
 const constants=run(constantsSource),observed=[],r=(await load()).instrumentReducerFieldWrites(source,'independent/reducer.js',{...opts,binding:'todoReducer'});
 const {todoReducer}=run(r.code,{require:path=>{assert.equal(path,'./constants');return constants;},recordWriter:(meta,value)=>observed.push({meta,value})});
 const created=todoReducer([],{type:constants.ADD_ITEM,payload:{title:'SAME'}});assert.equal(observed.length,1);assert.equal(observed[0].value,created[0]);
 const changed=todoReducer(created,{type:constants.UPDATE_ITEM,payload:{id:created[0].id,title:'SAME'}});assert.equal(observed.length,2);assert.equal(observed[1].value,changed[0]);assert.notEqual(created[0],changed[0]);assert.equal(created[0].title,changed[0].title);assert.notEqual(observed[0].meta.id,observed[1].meta.id);
 const toggled=todoReducer(changed,{type:constants.TOGGLE_ITEM,payload:{id:changed[0].id}});assert.equal(observed.length,2,'changing completed must not be counted as a title write');assert.equal(toggled[0].title,'SAME');assert.equal(toggled[0].completed,true);
});
test('capture helper cannot be shadowed by original nested binding and never evaluates a skipped branch',async()=>{
 const source='export const change=(s,e)=>s.map(_stateatomFieldWrite=>e.skip?_stateatomFieldWrite:{..._stateatomFieldWrite,title:e.title});',r=await compile(source);let calls=0;const {change}=run(r.code,{recordWriter:()=>calls++}),row={title:'old'};
 assert.equal(change([row],{skip:true})[0],row);assert.equal(calls,0);assert.equal(change([row],{skip:false,title:'new'})[0].title,'new');assert.equal(calls,1);
});

for(const observerName of ['metadata','value','_stateatomFieldWrite'])test('configured observer cannot be shadowed by generated helper bindings: '+observerName,async()=>{
 const r=await compile(base,{...opts,observerName});let calls=0;const {change}=run(r.code,{[observerName]:()=>calls++});
 assert.equal(r.status,'Code-linked writer sites');assert.equal(change([{id:1}],{payload:{id:1,title:'new'}})[0].title,'new');assert.equal(calls,1);
});
test('implicit arguments observer binding is refused without modifying original source',async()=>{
 const r=await compile(base,{...opts,observerName:'arguments'});assert.equal(r.status,'Unknown/Unsupported');assert.equal(r.code,base);assert.equal(r.sites.length,0);
});
