// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
import {newCodeJournal,journalEvent,journalSource,journalSnapshot,journalReport} from '../core/code-journal.mjs';
import {fetchScriptBody,newFetchBindings} from '../core/fetch-bindings.mjs';
function setup(){const j=newCodeJournal('run',{armedBeforeNavigation:true});journalEvent(j,'Runtime.executionContextCreated',{context:{id:1,uniqueId:'main',auxData:{frameId:'frame',isDefault:true}}});return j;}
function parsed(j,id='1',context=1){journalEvent(j,'Debugger.scriptParsed',{scriptId:id,executionContextId:context,url:'',length:24});}
for(const role of ['action-observation-global','action-observation-helper'])test(role+' survives exact declaration, compilation and passive journal projection without adding authority',async()=>{
 const {declareOwnedCode}=await import('../core/owned-code.mjs'),j=setup(),source=role==='action-observation-global'?'function(){return this;}':'function(){return null;}';
 assert.equal(await declareOwnedCode(j,role,source,'main'),true);
 parsed(j);await journalSource(j,'1',source);
 const s=journalReport(JSON.parse(JSON.stringify(journalSnapshot(j,{mainFrameId:'frame'}))));
 assert.equal(s.scripts[0].ownedRole,role);assert(!s.gaps.includes('owned-code-unavailable'));
 assert.equal(s.fullPath,false);assert.equal(s.executableHistory,'Unknown/Unsupported');assert.equal(s.currentFieldAncestry,'Unknown/Unsupported');assert(!JSON.stringify(s).includes(source));
 const forged=journalReport({...s,scripts:[{...s.scripts[0],ownedRole:'action-observation-page-assertion'}]});assert.equal(forged.scripts[0].ownedRole,null);
});
test('exact registered helper source and context acquire only a bounded owned-code role, without importing runtime/effect authority',async()=>{
 const {declareOwnedCode}=await import('../core/owned-code.mjs'),j=setup(),source='(x=>x)("#p1")';await declareOwnedCode(j,'selection-helper',source,'main');parsed(j);await journalSource(j,'1',source);const s=journalSnapshot(j,{mainFrameId:'frame'});
 assert.equal(s.scripts[0].ownedRole,'selection-helper');assert.equal(s.fullPath,false);assert(!JSON.stringify(j).includes(source));assert(!JSON.stringify(s).includes(source));
});
test('late, foreign-context and changed-body compilations cannot adopt a helper registration',async()=>{
 const {declareOwnedCode}=await import('../core/owned-code.mjs');for(const kind of['late','context','body']){const j=setup(),source='(x=>x)("#p1")';if(kind==='late')parsed(j);await declareOwnedCode(j,'selection-helper',source,kind==='context'?'foreign':'main');if(kind!=='late')parsed(j);await journalSource(j,'1',kind==='body'?source+';globalThis.changed=true;':source);assert.equal(journalSnapshot(j,{mainFrameId:'frame'}).scripts[0].ownedRole,null);}
});
test('helper registry refuses arbitrary roles, source budgets and unknown context without code-body retention',async()=>{
 const {declareOwnedCode}=await import('../core/owned-code.mjs');for(const [role,source,context]of[['made-up','void 0','main'],['deep-helper','x'.repeat(32769),'main'],['deep-helper','void 0','absent']]){const j=setup();assert.equal(await declareOwnedCode(j,role,source,context),false);assert(journalSnapshot(j,{mainFrameId:'frame'}).gaps.includes('owned-code-unavailable'));}
});
test('fetch template role cannot borrow an old journal run or a different native captured source digest',async()=>{
 const {bindOwnedFetchCode}=await import('../core/owned-code.mjs'),page='a'.repeat(36),url='stateatom-fetch://'+page+'/1',body=fetchScriptBody(url);
 for(const kind of['original','run','digest']){const j=setup(),b=newFetchBindings('run');b.contexts[1]={uniqueId:'main',frameId:'frame',isDefault:true};b.scripts['1']={url,source:body,contextId:1};parsed(j);await journalSource(j,'1',kind==='digest'?'void 0;':body);if(kind==='run')j.run='foreign';await bindOwnedFetchCode(j,b,{page,run:'run',mainFrameId:'frame'});assert.equal(j.scripts['1'].ownedRole,kind==='original'?'fetch-passthrough':null);}
});
