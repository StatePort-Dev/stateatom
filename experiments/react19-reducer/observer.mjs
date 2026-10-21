// SPDX-License-Identifier: Apache-2.0
// Self-contained experiment runtime. Never installed in Atom or arbitrary apps.
export function installReact19Experiment({enabled=false}={}){
 const ownDescriptor=Object.getOwnPropertyDescriptor,clone=structuredClone,same=Object.is;
 const object=x=>x!==null&&(typeof x==='object'||typeof x==='function');
 const own=(x,k)=>{if(!object(x))return undefined;const d=ownDescriptor(x,k);return d&&Object.hasOwn(d,'value')?d.value:undefined;};
 const ids=new WeakMap(),fibers=new WeakSet(),roots=new WeakSet(),props=new WeakSet(),queues=new WeakMap(),hooks=new WeakMap(),updates=new WeakMap(),hostApplied=new WeakMap(),consumers=new WeakMap(),oracleResults=new Map();
 let serial=0,sequence=0,revision=0,commit=0,stopped=false,overflow=false,lastCommit=null;
 const events=[],commits=[];
 const id=x=>{if(!object(x))return x===null?'primitive:null':typeof x==='undefined'?'primitive:undefined':'primitive:'+typeof x;let n=ids.get(x);if(!n){n='object:'+(++serial);ids.set(x,n);}return n;};
 const push=row=>{if(stopped||overflow)return;if(events.length>=4096){overflow=true;lastCommit=null;return;}events.push({sequence:++sequence,...row});};
 const unsupported=reason=>({stateResultStatus:'Unknown/Unsupported',updateOriginStatus:'Unknown/Unsupported',updateId:null,valueOrigin:'Unknown/Unsupported',fullPath:false,reason});
 const related=(a,b)=>a===b||fibers.has(a)&&fibers.has(b)&&own(a,'alternate')===b&&own(b,'alternate')===a;
 function committedHook(start,stateId){
  let fiber=start,count=0;const seen=new Set();
  while(fibers.has(fiber)&&count++<64&&!seen.has(fiber)){
   seen.add(fiber);
   if(own(fiber,'tag')===0){
    let hook=own(fiber,'memoizedState');const visited=new Set();
    while(object(hook)&&hooks.has(hook)&&visited.size<64&&!visited.has(hook)){
     visited.add(hook);const r=hooks.get(hook),q=r.queue.ref.deref(),renderFiber=r.fiber?.deref();
     if(r.checked&&q&&own(hook,'queue')===q&&related(fiber,renderFiber)&&id(own(hook,'memoizedState'))===r.resultId&&r.resultId===stateId)return{r,hook,fiber};
     hook=own(hook,'next');
    }
   }
   fiber=own(fiber,'return');
  }
  return null;
 }
 function captureRoot(root,finished){
  if(!roots.has(root)||!fibers.has(finished)||own(root,'current')!==finished)return;
  const todo=[finished],seen=new Set(),rows=[];
  while(todo.length){
   const fiber=todo.pop();if(!fibers.has(fiber)||seen.has(fiber))continue;seen.add(fiber);
   if(seen.size>512){overflow=true;lastCommit=null;return;}
   const child=own(fiber,'child'),sibling=own(fiber,'sibling');if(object(child))todo.push(child);if(object(sibling))todo.push(sibling);
   if(own(fiber,'tag')!==5)continue;
   const p=own(fiber,'memoizedProps'),consumer=object(p)?consumers.get(p):null;if(!consumer)continue;
   const node=own(fiber,'stateNode'),match=props.has(p)&&hostApplied.get(node)===p&&same(own(p,'children'),consumer.title)?committedHook(fiber,consumer.stateId):null;
   const base={slot:consumer.slot,nodeId:id(node),nativePropsId:id(p),rowId:consumer.rowId,consumerStateId:consumer.stateId,title:consumer.title,syntheticConsumerOracle:true,valueOrigin:'Unknown/Unsupported',fullPath:false,fieldOwnership:'Unknown/Unsupported',propTransfer:'Explicit synthetic oracle only; ordinary transfer Unknown/Unsupported'};
   if(!match){rows.push({...base,...unsupported('Current native host props/ancestor hook result does not match this exact synthetic consumer')});continue;}
   const {r}=match,rev=r.revision,oracle=oracleResults.get(r.resultId),replacement=oracle?.replacements.some(pair=>pair.outputRowId===consumer.rowId);
   rows.push({...base,stateResultStatus:'Observed',updateOriginStatus:rev.updateId?'Observed':'Unknown/Unsupported',queueId:r.queue.id,hookId:id(match.hook),fiberId:id(match.fiber),revisionId:rev.id,resultId:r.resultId,inputId:rev.inputId??null,updateId:rev.updateId??null,updateObjectId:rev.updateObjectId??null,reducerId:rev.reducerId??null,fixtureReplacementUpdateId:replacement&&rev.updateId?rev.updateId:null,reason:rev.reason??null});
  }
  lastCommit={commitId:'commit:'+(++commit),rootId:id(root),finishedFiberId:id(finished),rows};commits.push(clone(lastCommit));if(commits.length>64)commits.shift();push({kind:'root-current',commitId:lastCommit.commitId,rootId:lastCommit.rootId,rows:rows.length});
 }
 function tap(kind,a,b,c,d,e,f,g,h){
  if(!enabled||stopped||overflow)return;
  if(kind==='fiber'){if(object(a))fibers.add(a);return;}
  if(kind==='root'){if(object(a))roots.add(a);return;}
  if(kind==='element'){if(object(b))props.add(b);return;}
  if(kind==='host-applied'){if(object(a)&&props.has(b))hostApplied.set(a,b);return;}
  if(kind==='dispatch'){
   const q=queues.get(a);if(!q||!object(b)||!fibers.has(c))return;
   const u={id:'update:'+id(b),queueId:q.id,actionId:id(d)};updates.set(b,u);push({kind,queueId:q.id,updateId:u.id,updateObjectId:id(b),fiberId:id(c),actionId:u.actionId});return;
  }
  if(kind==='begin'){
   const q=queues.get(c),prior=hooks.get(b);if(!q||!object(a)||!fibers.has(d))return;
   hooks.set(a,{queue:q,fiber:new WeakRef(d),checked:false,revision:prior?.queue===q?prior.revision:{id:'revision:'+(++revision),updateId:null,reason:'Original current hook history not observed'}});return;
  }
  if(kind==='reducer-applied'||kind==='reducer-ignored'){
   // a=result,b=hook,c=queue,d=update,e=input,f=action,g=fiber,h=reducer.
   const q=queues.get(c),r=hooks.get(b);if(!q||r?.queue!==q||!fibers.has(g))return;
   const u=updates.get(d),known=u?.queueId===q.id&&u.actionId===id(f),row={kind,queueId:q.id,hookId:id(b),fiberId:id(g),updateId:known?u.id:null,updateObjectId:id(d),inputId:id(e),resultId:id(a),actionId:id(f),reducerId:id(h),updateOriginStatus:known?'Observed':'Unknown/Unsupported'};
   push(row);
   if(kind==='reducer-applied')r.revision={id:'revision:'+(++revision),...row,reason:known?null:'Rebased/cloned/unobserved native update pointer; equal action is not identity'};
   return;
  }
  if(kind==='render-phase-unresolved'){
   const r=hooks.get(b);if(r)r.revision={id:'revision:'+(++revision),updateId:null,resultId:id(a),reason:'Render-phase update ancestry explicitly unsupported'};push({kind,hookId:id(b),resultId:id(a)});return;
  }
  if(kind==='state-result'){
   // Native literal [state,dispatch], original native hook and rendering Fiber.
   if(!Array.isArray(a)||!object(b)||!fibers.has(c))return;
   const queue=own(b,'queue');if(!object(queue))return;
   let q=queues.get(queue),r=hooks.get(b);if(!q){q={id:'queue:'+id(queue),ref:new WeakRef(queue)};queues.set(queue,q);}
   const value=own(a,'0'),resultId=id(value);
   if(!r){r={queue:q,revision:{id:'revision:'+(++revision),resultId,updateId:null,reason:'Initial/unobserved replacement origin'}};hooks.set(b,r);}
   r.queue=q;r.fiber=new WeakRef(c);r.resultId=resultId;r.checked=object(value)&&same(value,own(b,'memoizedState'))&&own(a,'1')===own(queue,'dispatch');
   if(r.revision.resultId!==resultId)r.revision={id:'revision:'+(++revision),resultId,updateId:null,reason:'Returned state differs from the observed applied-result revision'};
   push({kind,queueId:q.id,hookId:id(b),fiberId:id(c),resultId,revisionId:r.revision.id,checked:r.checked});return;
  }
  if(kind==='root-current')captureRoot(a,b);
 }
 const oracle={
  reducerResult(input,action,result,replacements){
   if(stopped||oracleResults.size>=4096)return;
   // Replacements is a fresh fixture-owned array of already captured local refs.
   oracleResults.set(id(result),{inputId:id(input),actionId:id(action),resultId:id(result),replacements:replacements.map(pair=>({inputRowId:id(pair[0]),outputRowId:id(pair[1])}))});
  },
  consumer(element,row,state,title,slot){
   if(stopped||typeof title!=='string'||title.length>256||typeof slot!=='string')return;
   const p=own(element,'props');if(object(p))consumers.set(p,{rowId:id(row),stateId:id(state),title,slot});
  }
 };
 const api={id,oracle,snapshot(slot){if(!enabled||stopped||overflow)return unsupported(stopped?'Observer stopped':overflow?'Observation capacity refused':'Observer disabled');const row=lastCommit?.rows.find(r=>r.slot===slot);return row?clone({...row,commitId:lastCommit.commitId,rootId:lastCommit.rootId}):unsupported('No selected current committed synthetic consumer');},all(){return clone({enabled,stopped,overflow,events,commits,oracleResults:[...oracleResults.values()],current:enabled&&!stopped&&!overflow?lastCommit:null,fullPath:false});},stop(){stopped=true;lastCommit=null;}};
 Object.defineProperty(globalThis,'__STATEATOM_REACT19_TAP__',{configurable:true,value:tap});
 Object.defineProperty(globalThis,'__R19_EXPERIMENT__',{configurable:true,value:api});
}
