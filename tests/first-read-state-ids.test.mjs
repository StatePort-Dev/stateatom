// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';import {createStateHandoffLedger} from '../stateatom-phase2/engine/react-state.mjs';
test('optional shared identity callback joins the applied queue/update and cannot borrow a later equal-object action',()=>{
 const identities=new WeakMap();let serial=0,reads=0;const objectId=o=>{if(!identities.has(o))identities.set(o,'native'+(++serial));return identities.get(o);},fiber={},queue={dispatch(){}},hook={queue,memoizedState:null,next:null},account={rules:{quota:12}},a={action:account},b={action:account};fiber.memoizedState=hook;
 const ledger=createStateHandoffLedger({page:'test',field:(o,k)=>o&&Object.getOwnPropertyDescriptor(o,k)?.value,isFiber:o=>o===fiber,origin:o=>o===account?{consumptionId:'parse'}:null,add:(m)=>({...m,id:'read'+(++reads)}),weakRef:WeakRef,objectId});
 ledger.tap('state-mount',hook,queue,fiber);ledger.tap('state-dispatch',queue,a,fiber);ledger.tap('state-dispatch',queue,b,fiber);ledger.tap('state-applied',hook,a,account);hook.memoizedState=account;
 const result=[account,queue.dispatch];ledger.tap('state-result',result,hook,fiber);ledger.stage({binding:'data'},'scope',result);const n=ledger.associate({binding:'data'},'scope',account,queue.dispatch),w=ledger.witness([n],new Set([fiber]))[0];
 assert.equal(w.status,'Observed');assert.equal(w.firstReadNativeIds.queueId,objectId(queue));assert.equal(w.firstReadNativeIds.updateId,objectId(a));assert.notEqual(w.firstReadNativeIds.updateId,objectId(b));ledger.stop();
});
