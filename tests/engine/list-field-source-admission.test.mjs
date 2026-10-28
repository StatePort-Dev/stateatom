// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
const load=()=>import('../../src/engine/list-field-source-admission.mjs');
// Held-out names/structure are fixed before checker implementation; no value oracle.
const control=[
 {file:'scene.jsx',text:'import{useReducer as useList}from"react";import{reduceRows}from"./logic";import{Panel}from"./panel";export function Scene(){const[rows,dispatch]=useList(reduceRows,[]);return <Panel records={rows} dispatch={dispatch}/>;}'},
 {file:'logic.js',text:'export function reduceRows(state,event){if(event.add){const created={key:1,caption:event.data.caption,done:false};return state.concat(created)}return state.map(record=>record.key===event.data.key?{...record,caption:event.data.caption}:record)}'},
 {file:'panel.jsx',text:'import{useMemo}from"react";import{Tile}from"./tile";export function Panel({records,dispatch}){const visible=useMemo(()=>records.filter(record=>!record.done),[records]);return <section>{visible.map(entry=><Tile record={entry} key={entry.key} dispatch={dispatch}/>)}</section>}'},
 {file:'tile.jsx',text:'import{memo}from"react";export const Tile=memo(function Tile({record,dispatch}){const alias=record;const{caption,key,done}=alias;return <label data-key={key}>{caption}</label>})'}
];
const options={root:{file:'scene.jsx',export:'Scene'},field:'caption'};
async function inspect(files=control,opts=options){return(await load()).admitListFieldSources(files,opts)}
function mutate(file,from,to){return control.map(f=>f.file===file?{...f,text:f.text.replace(from,to)}:{...f})}
function refused(r){assert.equal(r.status,'Unknown/Unsupported');assert.equal(r.sourceUsesComplete,false);assert.equal(r.fullPath,false);assert(r.unsupported.length);}
test('held-out lexical imports callbacks and renamed props receive only conditional source admission',async()=>{
 const r=await inspect();assert.equal(r.status,'Conditional source admission');assert.equal(r.sourceUsesComplete,true);assert.equal(r.fullPath,false);assert.equal(r.fieldOwnership,'Unknown/Unsupported');assert.equal(r.modules.length,4);assert(r.runtimePremises.length>=4);assert(r.scalarFields.includes('caption'));assert(r.scalarFields.includes('key'));assert(r.scalarFields.includes('done'));assert(r.edges.some(e=>e.kind==='component-prop'));assert(r.edges.some(e=>e.kind==='native-array'));
});
test('actual independent reducer App Main Item Footer graph is accounted without name or selector matching',async()=>{
 const dir=new URL('../../.runtime/todomvc/examples/react/src/todo/',import.meta.url),names=['app.jsx','reducer.js','components/main.jsx','components/item.jsx','components/footer.jsx'],files=await Promise.all(names.map(async file=>({file,text:await readFile(new URL(file,dir),'utf8')}))),manifest=JSON.parse(await readFile(new URL('../../docs/testing/component-body-native-case.json',import.meta.url),'utf8')).originalManifest;
 for(const f of files.slice(0,4))assert.equal(createHash('sha256').update(f.text).digest('hex'),manifest['examples/react/src/todo/'+f.file]);
 const r=await inspect(files,{root:{file:'app.jsx',export:'App'},field:'title'});assert.equal(r.status,'Conditional source admission');assert.equal(r.modules.length,5);assert.equal(r.fieldOwnership,'Unknown/Unsupported');assert.equal(r.fullPath,false);assert(r.edges.filter(e=>e.kind==='component-prop').length>=3);
});
for(const [name,files] of [
 ['same-value row alias writer',mutate('tile.jsx','const{caption,key,done}=alias;','const{caption,key,done}=alias;alias.caption="same";')],
 ['deferred callback writer',mutate('tile.jsx','const alias=record;','const alias=record;setTimeout(()=>{record.caption="same"},0);')],
 ['opaque row call',mutate('tile.jsx','const alias=record;','const alias=record;unknown(record);')],
 ['global row escape',mutate('tile.jsx','const alias=record;','const alias=record;globalThis.saved=record;')],
 ['container row escape',mutate('tile.jsx','const alias=record;','const alias=record;unknown({wrapped:record});')],
 ['fresh producer object escapes before state',mutate('logic.js','return state.concat(created)','unknown(created);return state.concat(created)')],
 ['filter callback escape',mutate('panel.jsx','record=>!record.done','record=>{unknown(record);return !record.done}')],
 ['computed row member',mutate('tile.jsx','const alias=record;','const alias=record;unknown(record[key]);')],
 ['mutable alias',mutate('tile.jsx','const alias=record;','let alias=record;')],
 ['default props',mutate('tile.jsx','{record,dispatch}','{record={},dispatch}')],
 ['rest props',mutate('tile.jsx','{record,dispatch}','{record,dispatch,...rest}')],
 ['unknown component transfer',mutate('panel.jsx','import{Tile}from"./tile"','import{Tile}from"unknown-library"')],
 ['unknown collection receiver call',mutate('logic.js','state.concat(created)','state.custom(created)')],
 ['async callback',mutate('panel.jsx','records.filter(record=>','records.filter(async record=>')],
 ['missing component source',control.filter(f=>f.file!=='tile.jsx')]
])test('source admission refuses '+name,async()=>refused(await inspect(files)));
test('source digest changes with original source even when readonly shape stays admitted',async()=>{
 const a=await inspect(),b=await inspect(mutate('tile.jsx','<label','/* new revision */<label'));assert.equal(b.status,'Conditional source admission');assert.notEqual(a.modules.find(f=>f.file==='tile.jsx').sourceDigest,b.modules.find(f=>f.file==='tile.jsx').sourceDigest);
});
test('ambiguous source missing root and exceeded budgets refuse',async()=>{
 refused(await inspect([...control,control[0]]));refused(await inspect(control,{root:{file:'missing.jsx',export:'Scene'},field:'caption'}));refused(await inspect(control,{...options,maxSteps:1}));
});

for(const [name,statement] of [
 ['object pattern','({value:record.caption}={value:"same"});'],
 ['array pattern','[record.caption]=["same"];'],
 ['for-of target','for(record.caption of ["same"]){}'],
 ['for-in target','for(record.caption in {same:1}){}'],
 ['deferred pattern','setTimeout(()=>{[record.caption]=["same"]},0);'],
 ['implicit arguments props alias','globalThis.saved=arguments[0].record;'],
 ['arrow inherited arguments alias','setTimeout(()=>{globalThis.saved=arguments[0].record},0);'],
 ['direct eval','eval("globalThis.saved=record");']
])test('review regression refuses hidden row effect: '+name,async()=>refused(await inspect(mutate('tile.jsx','const alias=record;','const alias=record;'+statement))));
test('review regression refuses native callback arguments alias write',async()=>refused(await inspect(mutate('panel.jsx','record=>!record.done','function(record){arguments[0].caption="same";return !record.done}'))));
test('review regression refuses opaque incoming concat object despite unused valid creation site',async()=>refused(await inspect(mutate('logic.js','state.concat(created)','state.concat(event.data)'))));
test('review regression binds every resolved import-export bridge source revision',async()=>{
 const files=[...mutate('panel.jsx','from"./tile"','from"./bridge"'),{file:'bridge.js',text:'import{Tile as Local}from"./tile";export{Local as Tile};'}],r=await inspect(files);assert.equal(r.status,'Conditional source admission');assert.equal(r.modules.length,5);assert.equal(r.modules.find(m=>m.file==='bridge.js')?.sourceDigest,createHash('sha256').update(files.at(-1).text).digest('hex'));
});

test('finite data recipe identifies original creation and native call sites by source range',async()=>{
 const r=await inspect();assert.equal(r.status,'Conditional source admission');assert(Array.isArray(r.dataSites));assert.equal(r.dataSites.filter(s=>s.kind==='empty-array').length,1);assert.equal(r.dataSites.filter(s=>s.kind==='row-literal').length,2);assert.equal(r.dataSites.filter(s=>s.kind==='array-call').length,4);
 for(const site of r.dataSites){const file=control.find(f=>f.file===site.file);assert.equal(site.sourceDigest,createHash('sha256').update(file.text).digest('hex'));assert(Number.isSafeInteger(site.start));assert(site.end>site.start);assert.equal(typeof site.id,'string');assert(file.text.slice(site.start,site.end).length);}
 assert.equal(r.fieldOwnership,'Unknown/Unsupported');assert.equal(r.fullPath,false);
});
