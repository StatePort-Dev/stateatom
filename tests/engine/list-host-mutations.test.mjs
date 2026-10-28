// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';
import {instrumentListHostMutations} from '../../src/engine/react19-field-vendor.mjs';
const source=`function setInitialProperties(domElement,tag,props){if(props.early)return props.run();props.run();}function commitUpdate(domElement,tag,oldProps,newProps){return newProps.run();}`;
test('native host brackets preserve original callbacks, early return, value and thrown identity',()=>{
 const out=instrumentListHostMutations(source),events=[],realm={__sa19Tap:(...args)=>events.push(args)};assert.equal(out.count,2);vm.runInNewContext(out.code,realm);const node={},error={sentinel:true};let calls=0;
 assert.equal(realm.setInitialProperties(node,'div',{early:true,run(){calls++;return 7}}),7);assert.equal(calls,1);assert.deepEqual(events.map(e=>[e[0],e[2]]),[['list-host-begin',undefined],['list-host-end',true]]);assert(events.every(e=>e[1]===node));events.length=0;
 assert.throws(()=>realm.commitUpdate(node,'div',{}, {run(){calls++;throw error}}),e=>e===error);assert.equal(calls,2);assert.deepEqual(events.map(e=>[e[0],e[2]]),[['list-host-begin',undefined],['list-host-end',false]]);
});
test('missing native signature and helper collision cannot acquire host interval recipe',()=>{for(const text of[source.replace('domElement,tag,props','other,tag,props'),source.replace('commitUpdate','other'),source+';let __saListHostCompleted;'])assert.throws(()=>instrumentListHostMutations(text),/host|helper|signature/);});
