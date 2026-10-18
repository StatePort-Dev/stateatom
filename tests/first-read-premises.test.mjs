// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
const{checkFirstReadPremises}=await import("../src/first-read/model.mjs").catch(e=>{if(e.code!=='ERR_MODULE_NOT_FOUND')throw e;return {};});
// These are synthetic protocol premises, not acquired browser/effect proof. The
// model must never upgrade them to a supported/full runtime trace on its own.
function premises(kind='member'){
 return{profile:{id:'react18-query5-first-data-render/1',sourceProof:'Code-linked',proofDigest:'a'.repeat(64),contracts:['query-fresh-client','query-direct-first-data','query-no-sharing-callback','query-no-notification-callback','query-no-retained-alias-operation','react-direct-state','react-no-foreign-exposure','app-first-read-region']},
 code:{sequenceDomain:'domain1',run:'run1',page:'page1',frame:'frame1',closedCompilerInputs:true,sourceEquivalent:true,armedBeforeNavigation:true,drained:true,pending:0,unknownScripts:0,unknownContexts:0,historyComplete:true},
 parse:{sequenceDomain:'domain1',id:'parse1',exchangeId:'exchange1',rootId:'root1',page:'page1',frame:'frame1',run:'run1',sequence:1},
 handoff:{sequenceDomain:'domain1',sequence:5,run:'run1',page:'page1',frame:'frame1',parseId:'parse1',rootId:'root1',updateId:'update1',queueId:'queue1',firstDirectObjectAction:true},
 read:{sequenceDomain:'domain1',id:'read1',kind,parseId:'parse1',rootId:'root1',receiverId:'rules1',pointer:'/rules/quota',sequence:10,firstSuccessfulDataRender:true,renderId:'render1',updateId:'update1',page:'page1',frame:'frame1',run:'run1',value:12},
 commit:{id:'commit1',renderId:'render1',targetId:'target1',status:'Observed',producer:'Observed',dependencyReadIds:['read1'],page:'page1',frame:'frame1',run:'run1'},
 exchange:{id:'exchange1',status:'Observed',requestId:'request1',page:'page1',frame:'frame1',run:'run1'},effects:[]};
}
function effect(fields){return{sequenceDomain:'domain1',run:'run1',page:'page1',frame:'frame1',...fields};}
function check(p){assert.equal(typeof checkFirstReadPremises,'function','first-read premise checker missing');return checkFirstReadPremises(p);}
test('complete member and independently acquired destructuring premises only qualify a conditional set, never invent native proof',()=>{
 for(const kind of ['member','destructure']){const result=check(premises(kind));assert.equal(result.status,'Conditional premise set');assert.equal(result.readId,'read1');assert.equal(result.pointer,'/rules/quota');assert.equal(result.fullPath,false);}
});
test('pre-read literal and unknown alias effects refuse even when scalar and pointer are unchanged',()=>{
 for(const event of [{sequence:5,kind:'potential-write',receiverId:'rules1'},{sequence:5,kind:'opaque-effect'},{sequence:5,kind:'potential-write',receiverId:'root1'}]){const p=premises();p.effects=[effect(event)];assert.equal(check(p).status,'Unknown/Unsupported');}
});
test('a later write does not rewrite the earlier receipt, and unrelated known object writes do not imply this field changed',()=>{
 const p=premises();p.effects=[effect({sequence:11,kind:'potential-write',receiverId:'rules1'}),effect({sequence:6,kind:'potential-write',receiverId:'other1'})];const result=check(p);assert.equal(result.status,'Conditional premise set');assert.equal(result.readValue,12);assert.equal(result.fullPath,false);
});
test('missing audited contracts, unknown final code and incomplete history cannot borrow a known profile id',()=>{
 for(const mutate of [p=>p.profile.contracts.pop(),p=>p.profile.sourceProof='Observed',p=>p.code.unknownScripts=1,p=>p.code.pending=1,p=>p.code.closedCompilerInputs=false,p=>p.code.sourceEquivalent=false,p=>p.code.armedBeforeNavigation=false,p=>p.code.drained=false,p=>p.code.historyComplete=false,p=>p.read.firstSuccessfulDataRender=false,p=>p.handoff.firstDirectObjectAction=false]){const p=premises();mutate(p);assert.equal(check(p).status,'Unknown/Unsupported');}
});
test('different parse/update/render/frame/exchange or missing dependency cannot join equal scalar events',()=>{
 for(const mutate of [p=>p.read.parseId='other',p=>p.read.rootId='other',p=>p.read.updateId='other',p=>p.read.frame='other',p=>p.commit.renderId='other',p=>p.commit.run='other',p=>p.exchange.id='other',p=>p.exchange.status='Unknown/Unsupported',p=>p.commit.dependencyReadIds=[],p=>p.read.sequence=1,p=>p.read.kind='nearby-member']){const p=premises();mutate(p);assert.equal(check(p).status,'Unknown/Unsupported');}
});
test('malformed or over-budget premise records fail closed instead of fabricating an eligible result',()=>{
 for(const p of [null,{}, {...premises(),effects:[{sequence:NaN,kind:'opaque-effect'}]}, {...premises(),effects:Array.from({length:4097},()=>({sequence:20,kind:'opaque-effect'}))}])assert.equal(check(p).status,'Unknown/Unsupported');
});
test('handoff context and shared interval sequence domain cannot be borrowed from a foreign ledger',()=>{
 for(const mutate of [p=>p.handoff.frame='foreign',p=>p.handoff.run='foreign',p=>p.code.sequenceDomain=undefined,p=>p.read.sequenceDomain='foreign',p=>p.effects=[{sequence:11,sequenceDomain:'foreign',run:'run1',page:'page1',frame:'frame1',kind:'potential-write',receiverId:'other'}]]){const p=premises();mutate(p);assert.equal(check(p).status,'Unknown/Unsupported');}
});
test('a handoff missing order or occurring outside the parse-to-read interval cannot qualify the read',()=>{
 for(const sequence of[undefined,NaN,0,1,10,11]){const p=premises();p.handoff.sequence=sequence;assert.equal(check(p).status,'Unknown/Unsupported');}
});
