// SPDX-License-Identifier: Apache-2.0
// Bounded product collector promoted from the retained A02.3 acquisition mechanism.
// Native ancestor observations only; no fixture oracle or selected-property origin.
export function createReact19Acquisition({page,weakRef=globalThis.WeakRef}={}){
 if(typeof page!=='string'||!page||page.length>160)throw Error('React19 acquisition requires a bounded page identity');
 const describe=Object.getOwnPropertyDescriptor,same=Object.is,isArray=Array.isArray,invoke=Reflect.apply,define=Object.defineProperty,create=Object.create;
 const append=(a,v)=>{const d=create(null);d.value=v;d.enumerable=true;d.writable=true;d.configurable=true;define(a,a.length,d);};
 const object=v=>v!==null&&(typeof v==='object'||typeof v==='function');
 const own=(v,k)=>{if(!object(v))return;const d=describe(v,k);return d&&Object.hasOwn(d,'value')?d.value:undefined;};
 const strictOwn=(v,k,required=false)=>{const d=describe(v,k);if(!d){if(required)throw Error('Required native metadata unavailable');return;}if(!Object.hasOwn(d,'value'))throw Error('Native metadata accessor unavailable');return d.value;};
 const fibers=new WeakSet(),roots=new WeakSet(),ids=new WeakMap(),queues=new WeakMap(),hooks=new WeakMap(),updates=new WeakMap();
 let serial=0,events=0,queueCount=0,updateCount=0,stopped=false,capped=false,unavailable=null,current=null,commitSerial=0,multipleRoots=false;
 const supported=typeof weakRef==='function',ref=v=>new weakRef(v),id=v=>{if(!object(v))return'primitive:'+typeof v;let n=ids.get(v);if(!n){n=page+':react19:'+(++serial);ids.set(v,n);}return n;};
 const scope='Native React reducer/state machinery on exact committed DOM ancestor; public hook kind and selected-property producer unknown';
 const unknown=reason=>({schema:1,page,status:'Unknown/Unsupported',reason,scope,ancestors:[],selectedPropertyOrigin:'Unknown/Unsupported',stateToProp:'Unknown/Unsupported',fieldOwnership:'Unknown/Unsupported',fullPath:false,consumerOracle:false});
 const related=(a,b)=>a===b||fibers.has(a)&&fibers.has(b)&&own(a,'alternate')===b&&own(b,'alternate')===a;
 const revision=(result,updateId=null,reason='Initial or unobserved result origin')=>({id:page+':react19:revision:'+(++serial),resultId:id(result),updateId,reason});
 function tick(){if(events>=4096){capped=true;current=null;return false;}events++;return true;}
 function receive(kind,a,b,c,d,e,f,g,nativeReducer){
  if(stopped||capped||!supported||unavailable)return;
  if(kind==='fiber'){if(object(a))fibers.add(a);return;}
  if(kind==='root'){if(object(a))roots.add(a);return;}
  if(kind!=='dispatch'&&kind!=='begin'&&kind!=='reducer-applied'&&kind!=='reducer-ignored'&&kind!=='render-phase-unresolved'&&kind!=='state-result'&&kind!=='root-current')return;
  if(kind!=='begin'&&!tick())return;
  if(kind==='dispatch'){
   const q=queues.get(a);if(!q||!object(b)||!fibers.has(c))return;
   const isObject=object(d);updates.set(b,{id:id(b),queue:q,action:isObject?ref(d):d,actionIsObject:isObject});updateCount++;return;
  }
  if(kind==='begin'){
   const q=queues.get(c),previous=hooks.get(b);if(!q||!object(a)||!fibers.has(d)||own(a,'queue')!==c)return;
   hooks.set(a,{queue:q,fiber:ref(d),checked:false,revision:previous?.queue===q?previous.revision:revision(undefined,null,'Current hook history missing')});return;
  }
  if(kind==='reducer-ignored')return;
  if(kind==='reducer-applied'){
   // a=result, b=hook, c=queue, d=update, e=input, f=action, g=rendering Fiber.
   const q=queues.get(c),h=hooks.get(b);if(!q||h?.queue!==q||!fibers.has(g))return;
   const u=updates.get(d),action=u?.actionIsObject?u.action.deref():u?.action,known=u?.queue===q&&same(action,f);
   h.revision={...revision(a,known?u.id:null,known?null:'Cloned, changed or unobserved native update identity'),inputId:object(e)?id(e):null,inputIdentityStatus:object(e)?'Observed':'Unknown/Unsupported',reducerId:typeof nativeReducer==='function'?id(nativeReducer):null};return;
  }
  if(kind==='render-phase-unresolved'){
   const h=hooks.get(b);if(h)h.revision=revision(a,null,'Render-phase update ancestry unsupported');return;
  }
  if(kind==='state-result'){
   if(!isArray(a)||!object(b)||!fibers.has(c))return;
   const queue=own(b,'queue');if(!object(queue))return;
   let q=queues.get(queue);if(!q){q={id:id(queue),ref:ref(queue)};queues.set(queue,q);queueCount++;}
   const value=own(a,'0'),dispatch=own(a,'1');let h=hooks.get(b);
   if(!h||h.queue!==q){h={queue:q,revision:revision(value)};hooks.set(b,h);}
   if(h.revision.resultId!==id(value))h.revision=revision(value,null,'Returned state differs from retained applied revision');
   h.fiber=ref(c);h.checked=object(value)&&same(value,own(b,'memoizedState'))&&typeof dispatch==='function'&&dispatch===own(queue,'dispatch');
   if(h.checked){h.state=ref(value);h.dispatch=ref(dispatch);}else{h.state=null;h.dispatch=null;}
   return;
  }
  if(kind==='root-current'){
   if(!roots.has(a)||!fibers.has(b)||own(a,'current')!==b)return;
   if(current&&current.root.deref()!==a)multipleRoots=true;
   current={root:ref(a),finished:ref(b),commitId:page+':react19:commit:'+(++commitSerial)};
  }
 }
 function tap(){try{invoke(receive,undefined,arguments);}catch{unavailable='Native metadata acquisition unavailable';current=null;}}
 function committedRoot(node,requireNode=false){
  if(stopped||capped||!supported||unavailable)return unknown(stopped?'Observer stopped':capped?'Observation capacity refused':unavailable||'WeakRef unavailable');
  if(multipleRoots)return unknown('Multiple committed native roots outside this profile');
  const root=current?.root.deref(),finished=current?.finished.deref();
  if(requireNode&&!object(node)||!root||!finished||own(root,'current')!==finished)return unknown('No matching current committed root');
  return{root,finished};
 }
 function currentCommit(){
  const empty=reason=>({schema:'stateatom.native-commit/1',page,status:'Unknown/Unsupported',reason,rootId:null,commitId:null});
  try{const c=committedRoot();return c.status?empty(c.reason):{...empty(null),status:'Observed',rootId:id(c.root),commitId:current.commitId};}catch{return empty('Current native commit metadata unavailable');}
 }
 function committedTree(node,strict=false){
  const c=committedRoot(node,true);if(c.status)return c;
  const{root,finished}=c;
  const pending=[{fiber:finished,parent:null}],seen=new Set(),parents=new Map();let selected=null;
  while(pending.length){
   const entry=pending[pending.length-1];pending.length--;const{fiber,parent}=entry;if(!fibers.has(fiber)){if(strict)return unknown('Unregistered committed native tree edge');continue;}
   if(seen.has(fiber))return unknown('Ambiguous or cyclic committed native tree');
   seen.add(fiber);parents.set(fiber,parent);if(seen.size>512)return unknown('Committed tree capacity refused');
   const tag=strict?strictOwn(fiber,'tag',true):own(fiber,'tag');
   if(tag===5&&(strict?strictOwn(fiber,'stateNode',true):own(fiber,'stateNode'))===node){if(selected)return unknown('Ambiguous native host identity');selected=fiber;}
   const child=strict?strictOwn(fiber,'child'):own(fiber,'child'),sibling=strict?strictOwn(fiber,'sibling'):own(fiber,'sibling');
   if(strict&&(child!=null&&!object(child)||sibling!=null&&!object(sibling)))return unknown('Invalid committed native tree edge');
   if(object(child))append(pending,{fiber:child,parent:fiber});if(object(sibling))append(pending,{fiber:sibling,parent});
  }
  if(!selected)return unknown('Selected DOM node absent from current committed tree');
  return{root,finished,selected,parents};
 }
 function read(node){
  const tree=committedTree(node);if(tree.status)return tree;
  const{root,finished,selected,parents}=tree;
  const ancestors=[],walked=new Set();let fiber=selected;
  while(fibers.has(fiber)&&walked.size<64&&!walked.has(fiber)){
   walked.add(fiber);const tag=own(fiber,'tag');let hook=tag===0||tag===11||tag===15?own(fiber,'memoizedState'):null;const visited=new Set();
   while(object(hook)&&visited.size<64&&!visited.has(hook)){
    visited.add(hook);const h=hooks.get(hook),state=h?.state?.deref(),queue=h?.queue.ref.deref(),dispatch=h?.dispatch?.deref();
    if(h?.checked&&state&&queue&&dispatch&&related(fiber,h.fiber.deref())&&own(hook,'memoizedState')===state&&own(hook,'queue')===queue&&own(queue,'dispatch')===dispatch&&h.revision.resultId===id(state)){
     if(ancestors.length===64)return unknown('Ancestor result capacity refused');
     append(ancestors,{hookId:id(hook),fiberId:id(fiber),queueId:h.queue.id,dispatchId:id(dispatch),inputId:h.revision.inputId||null,inputIdentityStatus:h.revision.inputIdentityStatus||'Unknown/Unsupported',reducerId:h.revision.reducerId||null,resultId:id(state),revisionId:h.revision.id,updateId:h.revision.updateId,updateOriginStatus:h.revision.updateId?'Observed':'Unknown/Unsupported',publicHookKind:'Unknown/Unsupported',scope});
    }
    hook=own(hook,'next');
   }
   if(object(hook))return unknown('Hook capacity or cycle refused');
   if(fiber===finished)break;fiber=parents.get(fiber);
  }
  if(fiber!==finished)return unknown('Selected ancestor chain does not reach current root');
  if(!ancestors.length)return unknown('No exact eligible native reducer ancestor result');
  return{...unknown(null),status:'Observed',nodeId:id(node),rootId:id(root),commitId:current.commitId,ancestors};
 }
 const propsUnknown=reason=>({schema:'stateatom.committed-props-reference/1',page,status:'Unknown/Unsupported',reason,scope:'Supplied props/type references on the exact selected current function-component ancestor; source element and property origins unknown',match:null,suppliedReferenceOnly:true,sourceElementIdentity:'Unknown/Unsupported',selectedPropertyOrigin:'Unknown/Unsupported',stateToProp:'Unknown/Unsupported',fieldOwnership:'Unknown/Unsupported',fullPath:false});
 function matchCommittedReferences(node,props,component,expectedFiber,checkFiber,memo=false,elementType=null){
  const unavailable=why=>memo?{...propsUnknown(why),schema:'stateatom.committed-memo-props-reference/1',scope:'Supplied opaque simple-memo wrapper, actual inner function and props on exact selected current ancestor; origins unknown'}:propsUnknown(why);
  try{
   if(!object(props)||typeof component!=='function')return unavailable('Opaque props object and function component references required');
   if(memo&&(elementType===null||typeof elementType!=='object'||!object(expectedFiber)))return unavailable('Required opaque native memo references unavailable');
   const tree=committedTree(node,true);if(tree.status)return unavailable(tree.reason);
   const{root,finished,selected,parents}=tree,walked=new Set();let fiber=selected,matched=null;
   while(fibers.has(fiber)&&walked.size<64&&!walked.has(fiber)){
    walked.add(fiber);
    if(strictOwn(fiber,'tag',true)===(memo?15:0)){
     const actualProps=strictOwn(fiber,'memoizedProps',true),actualType=strictOwn(fiber,'type',true);
     const wrapper=memo?strictOwn(fiber,'elementType',true):null;
     if(actualProps===props&&actualType===component&&(!memo||wrapper===elementType)){if(matched)return unavailable('Ambiguous matching committed props ancestors');matched=fiber;}
    }
    if(fiber===finished)break;fiber=parents.get(fiber);
   }
   if(fiber!==finished||!walked.has(finished))return unavailable('Selected ancestor chain does not reach current root');
   if(!matched)return unavailable(memo?'No exact supplied memo ancestor references':'No exact supplied props/type ancestor reference');
   if(checkFiber&&matched!==expectedFiber)return unavailable(memo?'Selected committed memo ancestor differs from supplied fiber reference':'Selected committed ancestor differs from supplied fiber reference');
   const match={nodeId:id(node),rootId:id(root),commitId:current.commitId,fiberId:id(matched),propsId:id(props),componentId:id(component)};if(memo)match.memoElementTypeId=id(elementType);
   return{...unavailable(null),status:'Observed',match};
  }catch{return unavailable('Committed props metadata unavailable');}
 }
 function matchCommittedProps(node,props,component,expectedFiber){return matchCommittedReferences(node,props,component,expectedFiber,arguments.length>=4);}
 function matchCommittedMemo(node,props,elementType,component,expectedFiber){return matchCommittedReferences(node,props,component,expectedFiber,true,true,elementType);}
 return Object.freeze({tap,snapshot(node){try{return read(node);}catch{return unknown('Native metadata snapshot unavailable');}},currentCommit,matchCommittedProps,matchCommittedMemo,stop(){stopped=true;current=null;},retention(){return{events,queues:queueCount,updates:updateCount,stopped,capped,available:supported&&!unavailable};}});
}
