// SPDX-License-Identifier: Apache-2.0
// Conditional research reference consumer; no hook installation or native attestation.
import {createReact19Acquisition} from '../../src/engine/react19-acquisition.mjs';
export function createNativeElementFiberObserver({page,enabled=true,policy,memoPolicy,weakRef=globalThis.WeakRef}={}){
 if(typeof enabled!=='boolean')throw TypeError('Boolean enabled required');
 const create=Object.create,define=Object.defineProperty,freeze=Object.freeze,keys=Object.keys,describe=Object.getOwnPropertyDescriptor,has=Object.hasOwn,apply=Reflect.apply,isArray=Array.isArray,integer=Number.isSafeInteger;
 const WM=WeakMap,WS=WeakSet,get=WM.prototype.get,set=WM.prototype.set,add=WS.prototype.add,contains=WS.prototype.has,Ref=weakRef;
 const object=v=>v!==null&&(typeof v==='object'||typeof v==='function'),U='Unknown/Unsupported';
 const data=(value,enumerable=false,writable=false,configurable=false)=>{const d=create(null);d.value=value;d.enumerable=enumerable;d.writable=writable;d.configurable=configurable;return d;};
 const dto=fields=>{const o=create(null),names=keys(fields);for(let i=0;i<names.length;i++)define(o,names[i],data(fields[names[i]],true));return freeze(o);};
 const own=(o,k)=>{if(!object(o))throw TypeError('Owned native metadata required');const d=describe(o,k);if(!d||!has(d,'value'))throw TypeError('Own native data required');return d.value;};
 const read=(m,k)=>apply(get,m,[k]),put=(m,k,v)=>apply(set,m,[k,v]);
 const supported=typeof Ref==='function',deref=supported?own(Ref.prototype,'deref'):null,weak=r=>r?apply(deref,r,[]):undefined;
 const base=createReact19Acquisition({page,weakRef:Ref}),sites=create(null),roles={create:'createFiberFromElement',update:'updateElement',single:'reconcileChildFibersImpl'};
 let unavailable=null,stopped=false,capped=false,events=0,bindings=0,latestCommit=null,previousCommit=null,ids=new WM(),serial=0,registered=new WS(),elements=new WM(),latest=new WM(),memoRecords=new WM(),memoEnabled=false,memoOutcomes=0;
 const memoSites=create(null),memoKinds={functionUpdate:'memo-function-update-return',bailout:'memo-bailout-return'};
 const id=v=>{let n=read(ids,v);if(!n){n=page+':native-element-fiber:object:'+ ++serial;put(ids,v,n);}return n;};
 const clear=()=>{bindings=0;memoOutcomes=0;registered=new WS();elements=new WM();latest=new WM();memoRecords=new WM();ids=new WM();};
 const exact=(v,expected)=>{const names=keys(v);if(names.length!==expected.length||names.some(k=>!expected.includes(k)))throw Error('Closed policy fields required');for(let i=0;i<expected.length;i++)own(v,expected[i]);};
 const hex=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v),file='react-dom/cjs/react-dom-client.development.js',digest='806b25cf84808a5ae0104e81633caabb1aa11fce71e72ef7afe4c1f8d2ebec08';
 if(enabled)try{
  exact(policy,['schema','file','sourceDigest','nativeVersionAdmitted','version','sites']);
  if(own(policy,'schema')!=='stateatom.native-element-fiber-source/1'||own(policy,'file')!==file||own(policy,'sourceDigest')!==digest||own(policy,'version')!=='19.2.5'||own(policy,'nativeVersionAdmitted')!==true)throw Error('Closed native element profile required');
  const rows=own(policy,'sites'),seen=create(null);if(!isArray(rows)||own(rows,'length')!==3)throw Error('Three native element sites required');
  for(let i=0;i<3;i++){
   const s=own(rows,String(i));exact(s,['id','file','sourceDigest','kind','owner','role','line','column','endLine','endColumn']);
   const role=own(s,'role'),key=own(s,'id');if(typeof role!=='string'||!has(roles,role)||has(seen,role)||!hex(key)||has(sites,key)||own(s,'owner')!==roles[role]||own(s,'file')!==file||own(s,'sourceDigest')!==digest||own(s,'kind')!=='native-element-fiber')throw Error('Closed unique native element site required');
   for(const k of ['line','column','endLine','endColumn'])if(!integer(own(s,k))||own(s,k)<1)throw Error('Native source coordinates required');
   if(own(s,'endLine')<own(s,'line')||own(s,'endLine')===own(s,'line')&&own(s,'endColumn')<own(s,'column'))throw Error('Native source range required');
   sites[key]=role;seen[role]=true;
  }
 }catch{unavailable='Native element source policy unavailable';}
 if(enabled&&memoPolicy!==undefined&&!unavailable)try{
  exact(memoPolicy,['schema','file','sourceDigest','nativeVersionAdmitted','version','sites']);
  if(own(memoPolicy,'schema')!=='stateatom.native-memo-branch-source/1'||own(memoPolicy,'file')!==file||own(memoPolicy,'sourceDigest')!==digest||own(memoPolicy,'version')!=='19.2.5'||own(memoPolicy,'nativeVersionAdmitted')!==true)throw Error('Closed native memo profile required');
  const rows=own(memoPolicy,'sites'),seen=create(null);if(!isArray(rows)||own(rows,'length')!==2)throw Error('Two native memo sites required');
  for(let i=0;i<2;i++){
   const s=own(rows,String(i));exact(s,['id','file','sourceDigest','kind','owner','role','eventKind','line','column','endLine','endColumn']);
   const role=own(s,'role'),key=own(s,'id');if(typeof role!=='string'||!has(memoKinds,role)||has(seen,role)||!hex(key)||has(memoSites,key)||has(sites,key)||own(s,'eventKind')!==memoKinds[role]||own(s,'owner')!=='updateSimpleMemoComponent'||own(s,'file')!==file||own(s,'sourceDigest')!==digest||own(s,'kind')!=='native-memo-branch')throw Error('Closed unique native memo site required');
   for(const k of ['line','column','endLine','endColumn'])if(!integer(own(s,k))||own(s,k)<1)throw Error('Native memo coordinates required');
   if(own(s,'endLine')<own(s,'line')||own(s,'endLine')===own(s,'line')&&own(s,'endColumn')<own(s,'column'))throw Error('Native memo source range required');
   memoSites[key]=memoKinds[role];seen[role]=true;
  }memoEnabled=true;
 }catch{unavailable='Native memo source policy unavailable';}
 function syncCommit(){const c=base.currentCommit();if(c.status==='Observed'&&c.commitId!==latestCommit){previousCommit=latestCommit;latestCommit=c.commitId;}return c;}
 function receive(kind,fiber,element,site){
  if(!enabled||stopped||capped||unavailable||!supported)return fiber;
  const r=base.retention();if(r.stopped||r.capped||!r.available)return fiber;
  apply(base.tap,base,arguments);
  if(kind==='fiber'&&object(fiber))apply(add,registered,[fiber]);
  syncCommit();const memoKind=kind==='memo-function-update-return'||kind==='memo-bailout-return';
  if(kind!=='element-fiber'&&!(memoKind&&memoEnabled))return fiber;
  if(events>=4096){capped=true;clear();return fiber;}events++;
  if(memoKind){
   const component=element,props=site,key=arguments[4];
   if(typeof key!=='string'||!has(memoSites,key)||memoSites[key]!==kind||!object(fiber)||!apply(contains,registered,[fiber])||own(fiber,'tag')!==15||typeof component!=='function'||!object(props))throw Error('Admitted registered native memo outcome required');
   put(memoRecords,fiber,{component:new Ref(component),props:new Ref(props),beforeCommit:latestCommit,ordinal:events,kind,eventId:page+':native-element-fiber:memo-event:'+events,siteId:key});memoOutcomes++;return fiber;
  }
  if(typeof site!=='string'||!has(sites,site)||!object(fiber)||!object(element)||!apply(contains,registered,[fiber]))throw Error('Admitted registered native element event required');
  const tag=own(fiber,'tag'),memo=memoEnabled&&(tag===14||tag===15);if(tag!==0&&!memo)return fiber;
  const props=own(fiber,'pendingProps'),component=memo?null:own(fiber,'type'),wrapper=memo?own(fiber,'elementType'):null;if(!object(props)||(!memo&&typeof component!=='function')||(memo&&(wrapper===null||typeof wrapper!=='object')))throw Error('Native function/memo references required');
  const row={fiber:new Ref(fiber),element:new Ref(element),props:new Ref(props),component:memo?null:new Ref(component),wrapper:memo?new Ref(wrapper):null,memo,beforeCommit:latestCommit,ordinal:events,eventId:page+':native-element-fiber:event:'+events,siteId:site};
  let rows=read(elements,element);if(!rows){rows=[];put(elements,element,rows);}define(rows,rows.length,data(row,true,true,true));put(latest,fiber,row);bindings++;
  return fiber;
 }
 function tap(){try{return apply(receive,undefined,arguments);}catch{unavailable='Native element reference metadata unavailable';clear();return arguments[1];}}
 const unknown=reason=>dto({schema:'stateatom.native-element-committed-reference/1',page,status:U,reason,match:null,nativeElementReferenceAssociation:U,sourceOnly:true,nativeOrigin:'NotAttested',sourceElementOrigin:U,selectedPropertyOrigin:U,fieldOwnership:U,stateToProp:U,fullPath:false});
 function select(node,element,wanted){
  try{
   if(!enabled||stopped||capped||unavailable||!supported)return unknown(!enabled?'Observer disabled':stopped?'Observer stopped':capped?'Native element event capacity refused':unavailable||'WeakRef unavailable');
   const c=syncCommit();if(c.status!=='Observed'||!object(element))return unknown(c.reason||'Native element reference unavailable');
   const rows=read(elements,element);if(!rows)return unknown('No observed native element reference');
   let selected=null,selectedMemo=null,substituted=null;
   for(let i=0;i<rows.length;i++){
    const row=rows[i];if(row.beforeCommit!==previousCommit)continue;
    const fiber=weak(row.fiber);if(!object(fiber))return unknown('Current-interval native fiber reference unavailable');
    if(read(latest,fiber)!==row)continue;
    const props=weak(row.props);let component=weak(row.component),actualProps=props,wrapper=null,outcome=null;
    if(!object(props)||weak(row.element)!==element)return unknown('Current-interval native element references unavailable');
    if(row.memo){
     wrapper=weak(row.wrapper);outcome=read(memoRecords,fiber);
     if(!object(wrapper)||!outcome||outcome.beforeCommit!==row.beforeCommit||outcome.ordinal<=row.ordinal)return unknown('Complete fresh native memo outcome unavailable');
     component=weak(outcome.component);actualProps=weak(outcome.props);if(typeof component!=='function'||!object(actualProps))return unknown('Current-interval native memo references unavailable');
    }else if(typeof component!=='function')return unknown('Current-interval native element references unavailable');
    const result=row.memo?base.matchCommittedMemo(node,actualProps,wrapper,component,fiber):base.matchCommittedProps(node,props,component,fiber);
    if(result.status!=='Observed'){
     if(result.reason==='No exact supplied props/type ancestor reference'||result.reason==='Selected committed ancestor differs from supplied fiber reference'||result.reason==='No exact supplied memo ancestor references'||result.reason==='Selected committed memo ancestor differs from supplied fiber reference')continue;
     return unknown('Incomplete or ambiguous selected native ancestor association');
    }
    if(result.match.commitId!==latestCommit)return unknown('Native commit changed during selected lookup');
    if(wanted&&(fiber!==wanted.fiber||component!==wanted.component||actualProps!==wanted.props))continue;
    const proof=outcome?dto({kind:outcome.kind,eventId:outcome.eventId,siteId:outcome.siteId,propsReference:props===actualProps?'Same':'Different',fiberId:result.match.fiberId,commitId:result.match.commitId}):null;
    if(props!==actualProps){if(selected||substituted)return unknown('Ambiguous native element committed associations');substituted=proof;continue;}
    if(selected||substituted)return unknown('Ambiguous native element committed associations');selected=dto({...result.match,nativeElementId:id(element),eventId:row.eventId,siteId:row.siteId});selectedMemo=proof;
   }
   if(selected)return dto({...unknown(null),status:'Observed',nativeElementReferenceAssociation:'Observed',match:selected,...(selectedMemo?{memoOutcome:selectedMemo}:{})});
   return substituted?dto({...unknown('Incoming memo element props were not retained'),memoOutcome:substituted}):unknown('No complete exact current native element association');
  }catch{return unknown('Native element committed lookup unavailable');}
 }
 function match(node,element){return select(node,element,null);}
 function matchInvocation(node,element,fiber,component,props){
  if(arguments.length!==5)return unknown('Exact invocation query required');
  const full=select(node,element,null);if(full.status!=='Observed')return full;
  const r=select(node,element,{fiber,component,props});
  return r.status==='Observed'&&r.match.nativeElementId===full.match.nativeElementId&&r.match.fiberId===full.match.fiberId&&r.match.commitId===full.match.commitId?r:unknown('Different native invocation references');
 }
 function stop(){stopped=true;clear();latestCommit=null;previousCommit=null;base.stop();}
 function currentCommit(){const c=base.currentCommit();return !enabled||stopped||capped||unavailable||!supported?dto({...c,status:U,reason:!enabled?'Observer disabled':stopped?'Observer stopped':capped?'Native element event capacity refused':unavailable||'WeakRef unavailable',rootId:null,commitId:null}):dto(c);}
 return dto({tap,match,matchInvocation,currentCommit,stop,retention:()=>dto({events,bindings,memoEnabled,memoOutcomes,stopped,capped,available:enabled&&supported&&!unavailable,collector:dto(base.retention())})});
}
