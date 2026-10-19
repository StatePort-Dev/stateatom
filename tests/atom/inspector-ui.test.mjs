// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {mountAtom} from '../../packages/atom/src/ui.mjs';
import {createActionUI} from '../../packages/atom/src/action-ui.mjs';
import {inspectionView} from '../../browser-extension/inspection-view.mjs';

const deferred=()=>{let resolve;return {promise:new Promise(r=>resolve=r),resolve:v=>resolve(v)};};
const tick=()=>new Promise(r=>setTimeout(r,0));
function node(){return {textContent:'',value:'',children:[],dataset:{},style:{},tagName:'SECTION',scrollTop:0,contains(){return false;},setAttribute(){},removeAttribute(){},append(...v){this.children.push(...v);},replaceChildren(...v){this.children=v;if(v.length&&this.tagName==='SELECT')this.value=String(v[0].value);},addEventListener(){},getBoundingClientRect(){return{top:0};},focus(){},close(){},querySelector(){return null;}};}
function fixture(request,options={}){
 const elements=new Map(),$=id=>{if(!elements.has(id))elements.set(id,node());return elements.get(id);};$('tabs').tagName='SELECT';$('tabs').selectedOptions=[{dataset:{origin:'http://127.0.0.1:4173'}}];
 const document={createElement:node,createElementNS:node},root={...node(),querySelector:s=>$(s.match(/data-atom-id="([^"]+)/)[1]),querySelectorAll:()=>[],remove(){}};let first=true;document.createElement=tag=>{if(first){first=false;return root;}const e=node();e.tagName=tag.toUpperCase();return e;};
 const host={ownerDocument:document,append(){}};
 const state=id=>({attached:true,tabId:id,property:'text',selection:{selector:'#target-'+id,property:'text',value:'Tab '+id,text:'Tab '+id,observedAt:100},analysis:{sources:[],actionContext:{},stateatom:{target:{property:'text',value:'Tab '+id},runtime:{status:'Unknown/Unsupported'}}}});
 const list=[{id:1,url:'http://127.0.0.1:4173/one'},{id:2,url:'http://127.0.0.1:4173/two'}];
 let onEvent;const client={request:async(m,o)=>request?.(m,o)??(m.op==='tabs'?list:m.op==='list-diagnostics'?[]:m.op==='state'?state(m.tabId):{}),subscribe:fn=>{onEvent=fn;return()=>{};}};
 return {$,state,list,emit:m=>onEvent(m),view:mountAtom(host,client,{idPrefix:'',...options})};
}
test('changing tab clears explanation and target before pending picker cleanup settles',async()=>{
 const cancel=deferred(),pick=deferred();const f=fixture(m=>m.op==='pick'?pick.promise:m.op==='cancel-pick'?cancel.promise:undefined);await f.view.ready;
 const picking=f.$('pick').onclick();await tick();f.$('action-explain').onclick();assert(f.$('action-explanation').textContent);
 f.$('tabs').value='2';const switching=f.$('tabs').onchange();assert.equal(f.$('action-explanation').textContent,'');assert.doesNotMatch(f.$('selected').textContent,/#target-1/);
 cancel.resolve({});await switching;pick.resolve({});await picking;assert.match(f.$('selected').textContent,/#target-2/);await f.view.dispose();
});
test('late tab refresh preserves the user current tab rather than its request-time tab',async()=>{
 const late=deferred();let refresh=false;const f=fixture(m=>m.op==='tabs'&&refresh?late.promise:undefined);await f.view.ready;refresh=true;
 const pending=f.$('refresh-tabs').onclick();f.$('tabs').value='2';await f.$('tabs').onchange();late.resolve(f.list);await pending;
 assert.equal(f.$('tabs').value,'2');assert.match(f.$('selected').textContent,/#target-2/);await f.view.dispose();
});
test('property change clears prior explanation before the property request returns',async()=>{
 const reply=deferred();const f=fixture(m=>m.op==='property'?reply.promise:undefined);await f.view.ready;f.$('action-explain').onclick();assert(f.$('action-explanation').textContent);
 f.$('property').value='disabled';const pending=f.$('property').onchange();assert.equal(f.$('action-explanation').textContent,'');assert.doesNotMatch(f.$('selected').textContent,/#target-1/);reply.resolve({});await pending;await f.view.dispose();
});
test('host selected tab is preferred; a missing host tab never falls back to another app',async()=>{
 for(const id of [2,999]){const f=fixture(undefined,{initialTabId:id});await f.view.ready;assert.equal(f.$('tabs').value,id===2?'2':'');if(id===999)assert.doesNotMatch(f.$('selected').textContent,/#target/);await f.view.dispose();}
});
test('equal timestamp action evidence in another tab clears the previous explanation',()=>{
 const nodes=new Map(),$=id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);};const ui=createActionUI({document:{createElement:node},$,rpc:async()=>{},tab:()=>1,action:fn=>fn()});
 const state={tabId:1,run:'a',selection:{selector:'#a',property:'text',observedAt:100},analysis:{actionContext:{}}};ui.render(state);$('action-explain').onclick();assert($('action-explanation').textContent);ui.render({...state,tabId:2});assert.equal($('action-explanation').textContent,'');ui.dispose();
});
test('short result uses validated observations and gives specific snapshot/source next steps',()=>{
 const basic={attached:true,selection:{property:'text',value:'Hello',observedAt:100}};
 assert.match(inspectionView(basic).summary,/DOM snapshot/);assert.equal(inspectionView(basic).nextStep,'connect-project');
 assert.equal(inspectionView({...basic,stale:{reason:'Changed'}}).nextStep,'inspect-again');
 const instrumented={...basic,selection:{...basic.selection,page:'p'},analysis:{capabilities:{sourceResolver:'open-ide'},stateatom:{runtime:{status:'Observed',nodes:[{status:'Observed',kind:'read',expression:'a',value:true},{status:'Skipped',kind:'read',expression:'b',value:42}]}}}};
 assert.match(inspectionView(instrumented).summary,/1 observed input/);assert.equal(inspectionView(instrumented).operands.length,1);
 assert.equal(inspectionView({...instrumented,analysis:{...instrumented.analysis,stateatom:{runtime:{status:'Unknown/Unsupported'}}}}).nextStep,'unsupported');
});
test('passive reader admits bundled fonts without relaxing script or connect security',async()=>{
 const html=await readFile(new URL('../../browser-extension/reader.html',import.meta.url),'utf8');assert.match(html,/font-src 'self'/);assert.match(html,/script-src 'self';/);assert.match(html,/connect-src 'none'/);assert.doesNotMatch(html,/unsafe-inline|unsafe-eval/);
});

test('invalidation clears old sources and explanation before refreshed state returns',async()=>{
 const pending=deferred();let hold=false;const f=fixture(m=>m.op==='state'&&hold?pending.promise:undefined);await f.view.ready;f.$('action-explain').onclick();hold=true;f.emit({event:'state-invalidated',tabId:1});
 assert.equal(f.$('action-explanation').textContent,'');assert.doesNotMatch(f.$('selected').textContent,/#target-1/);pending.resolve({...f.state(1),selection:null,analysis:null,stale:{reason:'Navigation'}});await tick();await f.view.dispose();
});

test('one finished background refresh cannot say OK while another current-context action is pending',async()=>{
 const pending=deferred();const f=fixture(m=>m.op==='property'?pending.promise:undefined);await f.view.ready;f.$('property').value='disabled';const attaching=f.$('property').onchange();await f.$('refresh-tabs').onclick();assert.equal(f.$('status').textContent,'Working…');pending.resolve({});await attaching;assert.equal(f.$('status').textContent,'OK');await f.view.dispose();
});

test('section navigation focuses the section instead of a hidden nested disclosure',async()=>{
 const f=fixture();await f.view.ready;let focused='';const section=f.$('actions-section');section.focus=()=>focused='section';section.querySelector=()=>({focus:()=>focused='nested summary'});f.$('actions-nav').onclick();assert.equal(focused,'section');await f.view.dispose();
});
