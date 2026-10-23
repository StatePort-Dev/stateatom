// SPDX-License-Identifier: Apache-2.0
// Isolated experiment companion, not a product adapter or property-origin proof.
export function installOrdinaryReducerAcquisition(){
  const descriptor=Object.getOwnPropertyDescriptor,base=descriptor(globalThis,'__R19_EXPERIMENT__')?.value,originalTap=descriptor(globalThis,'__STATEATOM_REACT19_TAP__')?.value;
  if(!base||typeof originalTap!=='function')throw Error('Pinned experimental base observer required');
  const object=x=>x!==null&&(typeof x==='object'||typeof x==='function'),own=(x,k)=>{if(!object(x))return;const d=descriptor(x,k);return d&&Object.hasOwn(d,'value')?d.value:undefined;};
  const fibers=new WeakSet(),roots=new WeakSet(),returned=new WeakMap();let current=null;
  const scope='Native useReducer hook on exact committed DOM ancestor; not selected-property producer';
  const unknown=reason=>({status:'Unknown/Unsupported',reason,scope,ancestors:[],selectedPropertyOrigin:'Unknown/Unsupported',stateToProp:'Unknown/Unsupported',fieldOwnership:'Unknown/Unsupported',fullPath:false,consumerOracle:false});
  function tap(kind,...refs){
    originalTap(kind,...refs);
    const[a,b,c]=refs;
    if(kind==='fiber'&&object(a))fibers.add(a);
    if(kind==='root'&&object(a))roots.add(a);
    if(kind==='state-result'&&fibers.has(c)&&object(b)){
      const state=own(a,'0'),dispatch=own(a,'1'),queue=own(b,'queue');
      if(object(state)&&object(queue)&&typeof dispatch==='function'&&own(b,'memoizedState')===state&&own(queue,'dispatch')===dispatch)returned.set(b,{state:new WeakRef(state),queue:new WeakRef(queue),dispatch:new WeakRef(dispatch),fiber:new WeakRef(c)});
      else returned.delete(b);
    }
    if(kind==='root-current'&&roots.has(a)&&fibers.has(b)&&own(a,'current')===b)current={root:new WeakRef(a),finished:new WeakRef(b)};
  }
  const related=(a,b)=>a===b||fibers.has(a)&&fibers.has(b)&&own(a,'alternate')===b&&own(b,'alternate')===a;
  function snapshot(node){
    const history=base.all();
    if(!history.enabled||history.stopped||history.overflow)return unknown('Observer disabled, stopped or capacity refused');
    const root=current?.root.deref(),finished=current?.finished.deref();
    if(!object(node)||!root||!finished||own(root,'current')!==finished)return unknown('No matching current committed root');
    const todo=[{fiber:finished,parent:null}],seen=new Set(),parents=new Map();let selected=null;
    while(todo.length){
      const{fiber,parent}=todo.pop();if(!fibers.has(fiber))continue;if(seen.has(fiber)){if(parents.get(fiber)!==parent)return unknown('Ambiguous committed tree parent');continue;}seen.add(fiber);parents.set(fiber,parent);
      if(seen.size>512)return unknown('Committed tree capacity refused');
      if(own(fiber,'tag')===5&&own(fiber,'stateNode')===node){if(selected)return unknown('Ambiguous native host identity');selected=fiber;}
      const child=own(fiber,'child'),sibling=own(fiber,'sibling');if(object(child))todo.push({fiber:child,parent:fiber});if(object(sibling))todo.push({fiber:sibling,parent});
    }
    if(!selected)return unknown('Selected DOM node is absent from current committed tree');
    const ancestors=[],walked=new Set();let fiber=selected;
    while(fibers.has(fiber)&&walked.size<64&&!walked.has(fiber)){
      walked.add(fiber);let hook=[0,11,15].includes(own(fiber,'tag'))?own(fiber,'memoizedState'):null;const hooks=new Set();
      while(object(hook)&&hooks.size<64&&!hooks.has(hook)){
        hooks.add(hook);const r=returned.get(hook),state=r?.state.deref(),queue=r?.queue.deref(),dispatch=r?.dispatch.deref();
        if(r&&state&&queue&&dispatch&&related(fiber,r.fiber.deref())&&own(hook,'memoizedState')===state&&own(hook,'queue')===queue&&own(queue,'dispatch')===dispatch){
          const hookId=base.id(hook),resultId=base.id(state),event=history.events.findLast(e=>e.kind==='state-result'&&e.hookId===hookId);
          if(event?.checked&&event.resultId===resultId){
            const applied=history.events.findLast(e=>e.sequence<event.sequence&&e.kind==='reducer-applied'&&e.hookId===hookId&&e.queueId===event.queueId);
            const sameResult=applied?.resultId===resultId;
            ancestors.push({hookId,fiberId:base.id(fiber),queueId:event.queueId,resultId,revisionId:event.revisionId,updateId:sameResult?applied.updateId:null,updateOriginStatus:sameResult&&applied.updateId?'Observed':'Unknown/Unsupported',scope});
          }
        }
        hook=own(hook,'next');
      }
      if(hooks.size>=64&&object(hook))return unknown('Hook capacity refused');
      if(fiber===finished)break;
      fiber=parents.get(fiber);
    }
    if(fiber!==finished)return unknown('Selected ancestor chain does not reach current root');
    if(!ancestors.length)return unknown('No exact eligible native reducer ancestor result');
    return{...unknown(null),status:'Observed',nodeId:base.id(node),rootId:base.id(root),commitId:history.current?.commitId??null,ancestors};
  }
  Object.defineProperty(globalThis,'__STATEATOM_REACT19_TAP__',{value:tap,configurable:true});
  const api={snapshot};
  Object.defineProperty(globalThis,'__R19_ORDINARY__',{value:api,configurable:true});
}
