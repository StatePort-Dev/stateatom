// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {diagnosticMessages,compareMessages} from '../helpers/vue-warning-comparison.mjs';
const warning=(...values)=>({method:'Runtime.consoleAPICalled',params:{type:'warning',timestamp:123,args:values.map(value=>({type:'string',value})),stackTrace:{callFrames:[]}}});
test('later arguments and extra unknown errors cannot disappear behind the same first warning string',()=>{
 const a=diagnosticMessages([warning('same','left')]),b=diagnosticMessages([warning('same','right')]);assert.equal(compareMessages(a,b).equal,false);
 const error={method:'Runtime.consoleAPICalled',params:{type:'error',args:[{type:'string',value:'new unknown error'}]}};
 assert.equal(compareMessages(a,diagnosticMessages([warning('same','left'),error])).equal,false);
});
test('warning multiplicity matters while delivery order does not',()=>{
 const a=diagnosticMessages([warning('A'),warning('A'),warning('B')]),b=diagnosticMessages([warning('B'),warning('A'),warning('A')]);assert.equal(compareMessages(a,b).equal,true);
 const delta=compareMessages(a,diagnosticMessages([warning('A'),warning('B')]));assert.equal(delta.equal,false);assert.equal(delta.onlyLeft.length,1);assert.equal(delta.onlyLeft[0].count,1);
});
test('same text at a different severity remains a different observation',()=>{
 const w=warning('same'),e=structuredClone(w);e.params.type='error';assert.equal(compareMessages(diagnosticMessages([w]),diagnosticMessages([e])).equal,false);
});
test('transport/time/stack metadata is omitted only from comparison and raw input stays unchanged',()=>{
 const a=warning('same'),b=structuredClone(a);b.params.timestamp=999;b.params.stackTrace.callFrames=[{url:'http://different.test',lineNumber:17}];const original=structuredClone(b);
 assert.equal(compareMessages(diagnosticMessages([a]),diagnosticMessages([b])).equal,true);assert.deepEqual(b,original);
});
test('remote objects keep type/subtype/description/unavailable values and ignore only transient objectId',()=>{
 const a=warning();a.params.args=[{type:'object',subtype:'array',description:'Array(2)',objectId:'first'}];const b=structuredClone(a);b.params.args[0].objectId='second';
 assert.equal(compareMessages(diagnosticMessages([a]),diagnosticMessages([b])).equal,true);b.params.args[0].description='Array(3)';assert.equal(compareMessages(diagnosticMessages([a]),diagnosticMessages([b])).equal,false);
 assert.equal(diagnosticMessages([a])[0].args[0].valueAvailable,false);
});
test('exceptions and Log warning/error entries remain visible alongside console messages',()=>{
 const events=[warning('A'),{method:'Runtime.exceptionThrown',params:{exceptionDetails:{text:'Uncaught',exception:{description:'Error: broken'}}}},{method:'Log.entryAdded',params:{entry:{level:'warning',source:'network',text:'resource warning'}}},{method:'Log.entryAdded',params:{entry:{level:'error',source:'javascript',text:'resource error'}}}];
 const messages=diagnosticMessages(events);assert.equal(messages.length,4);assert.equal(compareMessages(messages,diagnosticMessages([warning('A')])).onlyLeft.length,3);
});
test('ordinary info is outside the original warning gate but never changes a warning descriptor',()=>{
 const info=warning('info');info.params.type='log';assert.deepEqual(diagnosticMessages([info]),[]);assert.equal(diagnosticMessages([info,warning('A')]).length,1);
});
