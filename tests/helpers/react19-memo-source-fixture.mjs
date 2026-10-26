// SPDX-License-Identifier: Apache-2.0
// OWNED complete source factories plus synthetic memo event stream, not native proof.
import {committedSourcePolicy,feedCommittedSource,attachCommittedNative} from './react19-committed-source-fixture.mjs';
import {memoReferencePolicy} from './react19-memo-reference-fixture.mjs';
export {feedCommittedSource};
export const memoSourcePolicy=()=>({...committedSourcePolicy(),memoBranch:memoReferencePolicy()});
export function attachMemoSource(o,p,source,{kinds=[],usedProps=[],emitElements=true,emitOutcomes=true,commit=true,existingRoot=null}={}){
 const n=attachCommittedNative(o,p,source,{emit:false,commit:false,existingRoot}),stream=memoReferencePolicy(),wrappers=[],components=[];
 for(let i=0;i<n.components.length;i++){
  const fiber=n.components[i],component=fiber.type,wrapper={};wrappers.push(wrapper);components.push(component);fiber.tag=14;fiber.type=wrapper;fiber.elementType=wrapper;
  if(emitElements===true||Array.isArray(emitElements)&&emitElements[i])o.referenceTap('element-fiber',fiber,source.elements[i],p.elementFiber.sites[0].id);
  const actual=usedProps[i]||source.elements[i].props,kind=kinds[i]||'memo-function-update-return';fiber.tag=15;fiber.type=component;fiber.memoizedProps=actual;fiber.pendingProps=actual;
  if(emitOutcomes===true||Array.isArray(emitOutcomes)&&emitOutcomes[i])o.referenceTap(kind,fiber,component,actual,stream.sites.find(s=>s.eventKind===kind).id);
 }
 if(commit)n.publish();return{...n,wrappers,innerComponents:components,stream};
}
