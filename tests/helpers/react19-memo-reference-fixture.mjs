// SPDX-License-Identifier: Apache-2.0
// OWNED synthetic policy and frame transitions, never actual React/Memo evidence.
import {elementFiberPolicy,elementFiberTree} from './react19-committed-element-fixture.mjs';
export {elementFiberPolicy};
export function memoReferencePolicy(){
 const file='react-dom/cjs/react-dom-client.development.js',sourceDigest='806b25cf84808a5ae0104e81633caabb1aa11fce71e72ef7afe4c1f8d2ebec08';
 return{schema:'stateatom.native-memo-branch-source/1',file,sourceDigest,nativeVersionAdmitted:true,version:'19.2.5',sites:[['functionUpdate','memo-function-update-return'],['bailout','memo-bailout-return']].map(([role,eventKind],i)=>({id:String(i+4).repeat(64),file,sourceDigest,kind:'native-memo-branch',owner:'updateSimpleMemoComponent',role,eventKind,line:i+1,column:1,endLine:i+1,endColumn:2}))};
}
export function memoReferenceTree(){
 const t=elementFiberTree(),wrapper={};t.componentFiber.tag=14;t.componentFiber.type=wrapper;t.componentFiber.elementType=wrapper;
 return{...t,wrapper};
}
