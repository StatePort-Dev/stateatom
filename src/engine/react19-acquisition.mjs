// SPDX-License-Identifier: Apache-2.0
// Bounded product collector promoted from the retained A02.3 acquisition mechanism.
// Native ancestor observations only; no fixture oracle or selected-property origin.
import {createComponentFieldReceipts} from './component-field-receipts.mjs';
import {createReducerWriteReceipts} from './reducer-write-receipts.mjs';
import {capturePrivateCollections} from './private-collections.mjs';
export function createReact19Acquisition({page,weakRef=globalThis.WeakRef,reducerFields=false}={}){
 if(typeof page!=='string'||!page||page.length>160)throw Error('React19 acquisition requires a bounded page identity');
 const describe=Object.getOwnPropertyDescriptor,same=Object.is,isArray=Array.isArray,invoke=Reflect.apply,define=Object.defineProperty,create=Object.create;
 const append=(a,v)=>{const d=create(null);d.value=v;d.enumerable=true;d.writable=true;d.configurable=true;define(a,a.length,d);};
 const object=v=>v!==null&&(typeof v==='object'||typeof v==='function');
 const own=(v,k)=>{if(!object(v))return;const d=describe(v,k);return d&&Object.hasOwn(d,'value')?d.value:undefined;};
 const strictOwn=(v,k,required=false)=>{const d=describe(v,k);if(!d){if(required)throw Error('Required native metadata unavailable');return;}if(!Object.hasOwn(d,'value'))throw Error('Native metadata accessor unavailable');return d.value;};
 const privateCollections=reducerFields===true?capturePrivateCollections():null;
 const makeWeakSet=()=>privateCollections?privateCollections.weakSet():new WeakSet(),makeWeakMap=()=>privateCollections?privateCollections.weakMap():new WeakMap(),makeSet=()=>privateCollections?privateCollections.set():new Set(),makeMap=()=>privateCollections?privateCollections.map():new Map();
 const fibers=makeWeakSet(),roots=makeWeakSet(),ids=makeWeakMap(),queues=makeWeakMap(),hooks=makeWeakMap(),updates=makeWeakMap();
 const fields=reducerFields===true?createReducerWriteReceipts({page,weakRef}):null;
 const fieldReads=fields?createComponentFieldReceipts({page,weakRef}):null;
 const reducerFieldNames=fields?makeWeakMap():null;
 const weakPrototype=typeof weakRef==='function'?describe(weakRef,'prototype')?.value:null,nativeDeref=weakPrototype?describe(weakPrototype,'deref')?.value:null;
 const deref=value=>value&&typeof nativeDeref==='function'?invoke(nativeDeref,value,[]):undefined;
 let serial=0,events=0,queueCount=0,updateCount=0,stopped=false,capped=false,unavailable=null,current=null,commitSerial=0,multipleRoots=false;
 const supported=typeof weakRef==='function'&&typeof nativeDeref==='function',ref=v=>new weakRef(v),id=v=>{if(!object(v))return'primitive:'+typeof v;let n=ids.get(v);if(!n){n=page+':react19:'+(++serial);ids.set(v,n);}return n;};
 const scope='Native React reducer/state machinery on exact committed DOM ancestor; public hook kind and selected-property producer unknown';
 const unknown=reason=>({schema:1,page,status:'Unknown/Unsupported',reason,scope,ancestors:[],selectedPropertyOrigin:'Unknown/Unsupported',stateToProp:'Unknown/Unsupported',fieldOwnership:'Unknown/Unsupported',fullPath:false,consumerOracle:false});
 const related=(a,b)=>a===b||fibers.has(a)&&fibers.has(b)&&own(a,'alternate')===b&&own(b,'alternate')===a;
 const revision=(result,updateId=null,reason='Initial or unobserved result origin')=>({id:page+':react19:revision:'+(++serial),resultId:id(result),updateId,reason});
 function tick(){if(events>=4096){capped=true;current=null;return false;}events++;return true;}
 function receive(kind,a,b,c,d,e,f,g,nativeReducer,nativeCall){
  if(stopped||capped||!supported||unavailable)return;
  if(fieldReads&&(kind==='component-call-begin'||kind==='component-call-return'||kind==='component-call-throw'||kind==='component-call-end'||kind==='jsx-element-return')){if(!tick())return null;if(kind==='component-call-begin'&&!fibers.has(a))return null;return fieldReads.native(kind,a,b,c);}
  if(fields&&(kind==='reducer-call-begin'||kind==='reducer-call-complete'||kind==='reducer-call-abort')){
   if(!tick())return;
   if(kind==='reducer-call-begin')fields.begin(a,b,c,d);
   else if(kind==='reducer-call-complete')fields.complete(b,a);
   else fields.discard(a);
   return;
  }
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
  if(kind==='reducer-ignored'){if(fields)fields.discard(nativeCall);return;}
  if(kind==='reducer-applied'){
   // a=result, b=hook, c=queue, d=update, e=input, f=action, g=rendering Fiber.
   const q=queues.get(c),h=hooks.get(b);if(!q||h?.queue!==q||!fibers.has(g)){if(fields)fields.discard(nativeCall);return;}
   const u=updates.get(d),action=u?.actionIsObject?deref(u.action):u?.action,known=u?.queue===q&&same(action,f);
   h.revision={...revision(a,known?u.id:null,known?null:'Cloned, changed or unobserved native update identity'),inputId:object(e)?id(e):null,inputIdentityStatus:object(e)?'Observed':'Unknown/Unsupported',reducerId:typeof nativeReducer==='function'?id(nativeReducer):null};
   if(fields){
    if(known&&typeof nativeReducer==='function'&&object(nativeCall)){h.revision.reducer=ref(nativeReducer);fields.applied(nativeCall,{result:a,input:e,action:f,reducer:nativeReducer,revisionId:h.revision.id});}
    else fields.discard(nativeCall);
   }
   return;
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
   if(current&&deref(current.root)!==a)multipleRoots=true;
   current={root:ref(a),finished:ref(b),commitId:page+':react19:commit:'+(++commitSerial)};
  }
 }
 function tap(){try{return invoke(receive,undefined,arguments);}catch{unavailable='Native metadata acquisition unavailable';current=null;}}
 function committedRoot(node,requireNode=false){
  if(stopped||capped||!supported||unavailable)return unknown(stopped?'Observer stopped':capped?'Observation capacity refused':unavailable||'WeakRef unavailable');
  if(multipleRoots)return unknown('Multiple committed native roots outside this profile');
  const root=deref(current?.root),finished=deref(current?.finished);
  if(requireNode&&!object(node)||!root||!finished||own(root,'current')!==finished)return unknown('No matching current committed root');
  return{root,finished};
 }
 function currentCommit(){
  const empty=reason=>({schema:'stateatom.native-commit/1',page,status:'Unknown/Unsupported',reason,rootId:null,commitId:null});
  try{const c=committedRoot();return c.status?empty(c.reason):{...empty(null),status:'Observed',rootId:id(c.root),commitId:current.commitId};}catch{return empty('Current native commit metadata unavailable');}
 }
 function committedTree(node,strict=false,uniqueProps=null){
  const c=committedRoot(node,true);if(c.status)return c;
  const{root,finished}=c;
  const pending=[{fiber:finished,parent:null}],seen=makeSet(),parents=makeMap();let selected=null,propsMatches=0;
  while(pending.length){
   const entry=pending[pending.length-1];pending.length--;const{fiber,parent}=entry;if(!fibers.has(fiber)){if(strict)return unknown('Unregistered committed native tree edge');continue;}
   if(seen.has(fiber))return unknown('Ambiguous or cyclic committed native tree');
   seen.add(fiber);parents.set(fiber,parent);if(seen.size>512)return unknown('Committed tree capacity refused');
   const tag=strict?strictOwn(fiber,'tag',true):own(fiber,'tag');
   if(uniqueProps&&tag===5&&strictOwn(fiber,'memoizedProps',true)===uniqueProps)propsMatches++;
   if(tag===5&&(strict?strictOwn(fiber,'stateNode',true):own(fiber,'stateNode'))===node){if(selected)return unknown('Ambiguous native host identity');selected=fiber;}
   const child=strict?strictOwn(fiber,'child'):own(fiber,'child'),sibling=strict?strictOwn(fiber,'sibling'):own(fiber,'sibling');
   if(strict&&(child!=null&&!object(child)||sibling!=null&&!object(sibling)))return unknown('Invalid committed native tree edge');
   if(object(child))append(pending,{fiber:child,parent:fiber});if(object(sibling))append(pending,{fiber:sibling,parent});
  }
  if(!selected)return unknown('Selected DOM node absent from current committed tree');
  if(uniqueProps&&propsMatches!==1)return unknown('Ambiguous current native host props identity');
  return{root,finished,selected,parents};
 }
 function read(node,visit=null){
  const tree=committedTree(node);if(tree.status)return tree;
  const{root,finished,selected,parents}=tree;
  const ancestors=[],walked=makeSet();let fiber=selected;
  while(fibers.has(fiber)&&walked.size<64&&!walked.has(fiber)){
   walked.add(fiber);const tag=own(fiber,'tag');let hook=tag===0||tag===11||tag===15?own(fiber,'memoizedState'):null;const visited=makeSet();
   while(object(hook)&&visited.size<64&&!visited.has(hook)){
    visited.add(hook);const h=hooks.get(hook),state=deref(h?.state),queue=deref(h?.queue.ref),dispatch=deref(h?.dispatch);
    if(h?.checked&&state&&queue&&dispatch&&related(fiber,deref(h.fiber))&&own(hook,'memoizedState')===state&&own(hook,'queue')===queue&&own(queue,'dispatch')===dispatch&&h.revision.resultId===id(state)){
     if(ancestors.length===64)return unknown('Ancestor result capacity refused');
     const observed={hookId:id(hook),fiberId:id(fiber),queueId:h.queue.id,dispatchId:id(dispatch),inputId:h.revision.inputId||null,inputIdentityStatus:h.revision.inputIdentityStatus||'Unknown/Unsupported',reducerId:h.revision.reducerId||null,resultId:id(state),revisionId:h.revision.id,updateId:h.revision.updateId,updateOriginStatus:h.revision.updateId?'Observed':'Unknown/Unsupported',publicHookKind:'Unknown/Unsupported',scope};append(ancestors,observed);if(visit)visit(h,state,observed,fiber);
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
   const{root,finished,selected,parents}=tree,walked=makeSet();let fiber=selected,matched=null;
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
 const readUnavailable=reason=>({schema:'stateatom.selected-field-read/1',page,status:'Unknown/Unsupported',reason,read:null,native:null,fieldOwnership:'Unknown/Unsupported',fullPath:false,scope:'Original scalar binding/JSX operand in exact native invocation and selected committed host; ordinary-data/writer/transfer authority separate'});
 function registerComponentFields(site){return !stopped&&!capped&&!unavailable&&supported&&fieldReads?fieldReads.register(site)===true:false;}
 function componentFieldSource(){return !stopped&&!capped&&!unavailable&&supported&&fieldReads?invoke(fieldReads.source,undefined,arguments):null;}
 function matchSelectedFieldRead(node,visit=null){
  if(!fieldReads)return readUnavailable('Field observation disabled');
  try{
   const initial=committedTree(node,true);if(initial.status)return readUnavailable(initial.reason);
   const hostProps=strictOwn(initial.selected,'memoizedProps',true);if(!object(hostProps))return readUnavailable('Current host props unavailable');
   const tree=committedTree(node,true,hostProps);if(tree.status)return readUnavailable(tree.reason);
   const{root,finished,selected,parents}=tree,walked=makeSet();let fiber=selected,match=null,owner=null;
   while(fibers.has(fiber)&&walked.size<64&&!walked.has(fiber)){
    walked.add(fiber);const tag=strictOwn(fiber,'tag',true);
    if(tag===0||tag===15){const candidate=fieldReads.lookup(fiber,strictOwn(fiber,'type',true),strictOwn(fiber,'memoizedProps',true),hostProps);if(candidate){if(match)return readUnavailable('Ambiguous selected source invocation');match=candidate;owner=fiber;}}
    if(fiber===finished)break;fiber=parents.get(fiber);
   }
   if(fiber!==finished||!match)return readUnavailable('No exact completed field read for current selected host');
   const{row,...read}=match;if(visit)visit(row,{fiber:owner,props:strictOwn(owner,'memoizedProps',true),parameterProp:match.parameterProp});return{...readUnavailable(null),status:'Observed',read:{...read,rowId:id(row)},native:{nodeId:id(node),rootId:id(root),commitId:current.commitId,fiberId:id(owner),hostPropsId:id(hostProps)}};
  }catch{return readUnavailable('Current selected field metadata unavailable');}
 }
 function registerComponentTransfers(site){return !stopped&&!capped&&!unavailable&&supported&&fieldReads?fieldReads.registerTransfers(site)===true:false;}
 function componentTransferSource(){return !stopped&&!capped&&!unavailable&&supported&&fieldReads?invoke(fieldReads.transferSource,undefined,arguments):null;}
 function matchSelectedListTransfers(node){
  const unknown=reason=>({schema:'stateatom.selected-list-transfers/1',page,status:'Unknown/Unsupported',reason,transfers:[],selected:null,arrayMembership:'Unknown/Unsupported',fieldOwnership:'Unknown/Unsupported',fullPath:false,scope:'Original state/parameter/JSX/map-callback reference joins on exact current native ancestors; array membership/native-method and writer exclusion remain separate'});
  if(!fieldReads)return unknown('Field observation disabled');
  try{
   const joined=matchSelectedFieldWrite(node);if(joined.status!=='Observed')return unknown(joined.reason);
   let value,child;const selected=matchSelectedFieldRead(node,(row,context)=>{value=row;child=context;});if(selected.status!=='Observed'||selected.native.commitId!==joined.native.selected.commitId)return unknown('Selected read changed');
   const tree=committedTree(node,true);if(tree.status)return unknown(tree.reason);const transfers=[],seen=makeSet();
   for(let depth=0;depth<8;depth++){
    if(!child.parameterProp)return unknown('Original parameter property unavailable');const incoming=fieldReads.incomingTransfer(child.props,child.parameterProp,value);if(!incoming||seen.has(incoming.fiber))return unknown('No unique original incoming prop transfer');seen.add(incoming.fiber);
    let parent=tree.parents.get(child.fiber),found=false;const walked=makeSet();while(parent&&!walked.has(parent)&&walked.size<64){walked.add(parent);if(parent===incoming.fiber){found=true;break;}parent=tree.parents.get(parent);}
    const tag=strictOwn(incoming.fiber,'tag',true);if(!found||!fibers.has(incoming.fiber)||(tag!==0&&tag!==15)||strictOwn(incoming.fiber,'type',true)!==incoming.component||strictOwn(incoming.fiber,'memoizedProps',true)!==incoming.props)return unknown('Original sender is not the exact current native ancestor');
    const callback=incoming.output.callback;append(transfers,{siteId:incoming.output.siteId,prop:incoming.output.prop,valueId:id(value),invocationId:incoming.invocationId,producerFiberId:id(incoming.fiber),input:{siteId:incoming.input.id,kind:incoming.input.kind,prop:incoming.input.prop,valueId:id(incoming.input.value)},callback:callback?{siteId:callback.id,method:callback.method,rowId:id(callback.row),collectionId:id(callback.collection)}:null});
    if(incoming.input.kind==='state-binding'){
     let matches=0;const native=read(node,(_h,state,observed,fiber)=>{if(fiber===incoming.fiber&&state===incoming.input.value&&observed.resultId===joined.native.ancestor.resultId&&observed.revisionId===joined.write.revisionId)matches++;});
     if(native.status!=='Observed'||matches!==1||native.commitId!==selected.native.commitId)return unknown('Original state binding does not match the applied current native result');
     return{...unknown(null),status:'Observed',transfers,selected:joined};
    }
    value=incoming.input.value;child={fiber:incoming.fiber,props:incoming.props,parameterProp:incoming.input.prop};
   }
   return unknown('Source transfer depth unavailable');
  }catch{return unknown('Current original prop transfer metadata unavailable');}
 }
 const fieldUnavailable=reason=>({schema:'stateatom.native-reducer-field-write/1',page,status:'Unknown/Unsupported',reason,write:null,native:null,scope:'Original field creation in an applied call of the exact current selected native ancestor; selected row membership and property origin unproved',currentMembership:'Unknown/Unsupported',fieldOwnership:'Unknown/Unsupported',selectedPropertyOrigin:'Unknown/Unsupported',fullPath:false});
 function registerReducerFields(reducer,sites,field=null){if(stopped||capped||unavailable||!supported||!fields||field!==null&&(typeof field!=='string'||!field||field.length>128))return false;const registered=fields.register(reducer,sites)===true;if(registered&&field)reducerFieldNames.set(reducer,field);return registered;}
 function reducerFieldSource(){return !stopped&&!capped&&!unavailable&&supported&&fields?invoke(fields.source,undefined,arguments):null;}
 function matchReducerFieldWrite(node,row){
  if(!fields)return fieldUnavailable('Field observation disabled');
  try{
   const matches=[],snapshot=read(node,(h,state,observed)=>{
    if(!h.revision.updateId)return;const reducer=deref(h.revision.reducer);if(typeof reducer!=='function')return;
    const receipt=fields.lookup({row,result:state,reducer,revisionId:h.revision.id});if(receipt.status==='Observed')append(matches,{write:{...receipt.write,field:reducerFieldNames.get(reducer)||null},ancestor:observed});
   });
   if(snapshot.status!=='Observed')return fieldUnavailable(snapshot.reason);
   if(matches.length!==1)return fieldUnavailable(matches.length?'Ambiguous current native field ancestors':'No exact applied field receipt on current ancestor');
   return{...fieldUnavailable(null),status:'Observed',write:matches[0].write,native:{nodeId:snapshot.nodeId,rootId:snapshot.rootId,commitId:snapshot.commitId,...matches[0].ancestor}};
  }catch{return fieldUnavailable('Native field receipt unavailable');}
 }
 function matchSelectedFieldWrite(node){
  const unknown=reason=>({schema:'stateatom.selected-field-write-read/1',page,status:'Unknown/Unsupported',reason,read:null,write:null,native:null,fieldOwnership:'Unknown/Unsupported',currentMembership:'Unknown/Unsupported',transferPath:'Unknown/Unsupported',fullPath:false,scope:'Original row identity joins a completed field read at the selected native host to an applied ancestor write; no exclusion of intervening alias writes or complete transfer path'});
  let row;const selected=matchSelectedFieldRead(node,value=>{row=value;});if(selected.status!=='Observed')return unknown(selected.reason);
  const applied=matchReducerFieldWrite(node,row);if(applied.status!=='Observed')return unknown(applied.reason);
  if(applied.write.field!==selected.read.field||applied.native.commitId!==selected.native.commitId||applied.native.rootId!==selected.native.rootId)return unknown('Field or current native commit differs');
  return{...unknown(null),status:'Observed',read:selected.read,write:{...applied.write,rowId:id(row)},native:{selected:selected.native,ancestor:applied.native}};
 }
 return Object.freeze({...(fields?{registerReducerFields,reducerFieldSource,matchReducerFieldWrite,registerComponentFields,componentFieldSource,registerComponentTransfers,componentTransferSource,matchSelectedListTransfers,matchSelectedFieldRead(node){return matchSelectedFieldRead(node);},matchSelectedFieldWrite}:{}),tap,snapshot(node){try{return read(node);}catch{return unknown('Native metadata snapshot unavailable');}},currentCommit,matchCommittedProps,matchCommittedMemo,stop(){stopped=true;current=null;if(fields)fields.stop();if(fieldReads)fieldReads.stop();},retention(){return{events,queues:queueCount,updates:updateCount,stopped,capped,available:supported&&!unavailable};}});
}
