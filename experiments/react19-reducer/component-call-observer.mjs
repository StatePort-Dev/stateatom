// SPDX-License-Identifier: Apache-2.0
// Conditional research protocol consumer; no installed hooks or native/body attestation.
export function createNativeComponentCallObserver({page,enabled=true,policy,weakRef=globalThis.WeakRef}={}){
 if(typeof page!=='string'||page.length<1||page.length>128)throw TypeError('Bounded page identity required');
 if(typeof enabled!=='boolean')throw TypeError('Boolean enabled required');
 const create=Object.create,define=Object.defineProperty,freeze=Object.freeze,keys=Reflect.ownKeys,describe=Object.getOwnPropertyDescriptor,has=Object.hasOwn,apply=Reflect.apply,isArray=Array.isArray,integer=Number.isSafeInteger;
 const WM=WeakMap,get=WM.prototype.get,set=WM.prototype.set,Ref=weakRef;
 const U='Unknown/Unsupported',object=v=>v!==null&&(typeof v==='object'||typeof v==='function');
 const own=(o,k)=>{if(!object(o))throw TypeError('Owned metadata required');const d=describe(o,k);if(!d||!has(d,'value'))throw TypeError('Own data required');return d.value;};
 const data=value=>{const d=create(null);d.value=value;d.enumerable=true;return d;};
 const dto=fields=>{const out=create(null),names=keys(fields);for(let i=0;i<names.length;i++){const k=names[i];define(out,k,data(fields[k]));}return freeze(out);};
 const exact=(o,names)=>{const k=keys(o);if(k.length!==names.length)throw Error('Closed source metadata required');for(let i=0;i<k.length;i++){let found=false;for(let j=0;j<names.length;j++)if(names[j]===k[i]){found=true;break;}if(!found)throw Error('Closed source field required');}for(let i=0;i<names.length;i++)own(o,names[i]);};
 const read=(map,key)=>apply(get,map,[key]),put=(map,key,value)=>apply(set,map,[key,value]);
 let deref=null;try{if(typeof Ref==='function')deref=own(own(Ref,'prototype'),'deref');}catch{}
 const supported=typeof deref==='function',weak=r=>apply(deref,r,[]),sites=create(null);
 let unavailable=null,profile=null,records=new WM(),stack=create(null),depth=0,serial=0,events=0,stopped=false,capped=false,fault=null;
 const clear=()=>{records=new WM();stack=create(null);depth=0;};
 const fail=reason=>{fault=reason;clear();};
 const cap=()=>{capped=true;clear();};
 const hex=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v),file='react-dom/cjs/react-dom-client.development.js',digest='806b25cf84808a5ae0104e81633caabb1aa11fce71e72ef7afe4c1f8d2ebec08';
 if(enabled)try{
  const admitted=own(policy,'nativeVersionAdmitted');if(typeof admitted!=='boolean')throw Error('Source version flag required');
  exact(policy,admitted?['schema','file','sourceDigest','sites','nativeVersionAdmitted','version']:['schema','file','sourceDigest','sites','nativeVersionAdmitted']);
  const sourceDigest=own(policy,'sourceDigest');
  if(own(policy,'schema')!=='stateatom.native-component-call-source/1'||own(policy,'file')!==file||!hex(sourceDigest))throw Error('Component source policy required');
  if(admitted&&(sourceDigest!==digest||own(policy,'version')!=='19.2.5'))throw Error('Pinned source metadata required');
  const rows=own(policy,'sites'),seen=create(null),owners={initial:'renderWithHooks',again:'renderWithHooksAgain'};
  if(!isArray(rows)||own(rows,'length')!==2)throw Error('Two component source sites required');
  for(let i=0;i<2;i++){
   const s=own(rows,String(i));exact(s,['id','file','sourceDigest','kind','owner','role','callee','line','column','endLine','endColumn']);
   const id=own(s,'id'),role=own(s,'role');
   if(!hex(id)||has(sites,id)||typeof role!=='string'||!has(owners,role)||has(seen,role)||own(s,'owner')!==owners[role]||own(s,'callee')!=='callComponentInDEV'||own(s,'kind')!=='native-component-call'||own(s,'file')!==file||own(s,'sourceDigest')!==sourceDigest)throw Error('Unique closed component source site required');
   const coordinates=['line','column','endLine','endColumn'];for(let j=0;j<coordinates.length;j++){const k=coordinates[j];if(!integer(own(s,k))||own(s,k)<1)throw Error('Source coordinates required');}
   if(own(s,'endLine')<own(s,'line')||own(s,'endLine')===own(s,'line')&&own(s,'endColumn')<own(s,'column'))throw Error('Source range required');
   sites[id]=role;seen[role]=true;
  }
  profile=admitted?'pinned-source-metadata':'owned-grammar';
 }catch{unavailable='Component source policy unavailable';}
 const reason=()=>!enabled?'Observer disabled':stopped?'Observer stopped':capped?'Component call research capacity refused':fault||unavailable||(!supported?'WeakRef unavailable':null);
 const unknown=why=>dto({schema:'stateatom.native-component-call-reference/1',page,status:U,reason:why,match:null,sourceProfile:profile,sourceOnly:true,nativeOrigin:'NotAttested',componentInvocationRuntimeQualified:false,sourceEntryAssociation:U,selectedPropertyOrigin:U,fieldOwnership:U,fullPath:false});
 // No property reads on application values. These short-lived dereferences never escape.
 const refs=row=>{
  const fiber=weak(row.fiber),component=weak(row.component),props=weak(row.props),result=row.result?weak(row.result):undefined;
  if(!object(fiber)||typeof component!=='function'||!object(props)||row.result&&!object(result))return null;
  return{fiber,component,props,result};
 };
 function receive(args){
  if(reason())return undefined;
  if(events>=4096){cap();return undefined;}events++;
  const kind=args[0];
  if(kind==='component-call-begin'){
   if(args.length!==5)throw Error('Exact begin arity required');
   const fiber=args[1],component=args[2],props=args[3],site=args[4];
   if(typeof site!=='string'||!has(sites,site)||!object(fiber)||typeof component!=='function'||!object(props))throw Error('Admitted component call references required');
   if(depth&&stack[depth-1].state!=='pending')throw Error('Pending parent required');
   if(depth>=64){cap();return undefined;}
   const token=freeze(create(null)),row={token,frameId:page+':component-call:frame:'+ ++serial,parentFrameId:depth?stack[depth-1].frameId:null,ordinal:events,siteId:site,role:sites[site],fiber:new Ref(fiber),component:new Ref(component),props:new Ref(props),result:null,state:'pending'};
   put(records,token,row);stack[depth++]=row;return token;
  }
  const outcome=kind==='component-call-return'||kind==='component-call-throw',end=kind==='component-call-end';
  if(!outcome&&!end)throw Error('Known component event required');
  if(args.length!==(outcome?4:3))throw Error('Exact component event arity required');
  const token=args[1],site=args[outcome?3:2],row=object(token)?read(records,token):null;
  if(!row||depth===0||stack[depth-1]!==row||site!==row.siteId)throw Error('Exact top token and site required');
  if(outcome){
   if(row.state!=='pending')throw Error('Single component outcome required');
   if(kind==='component-call-return'){row.result=object(args[2])?new Ref(args[2]):null;row.state='returned';}
   else row.state='thrown';
  }else{
   if(row.state!=='returned'&&row.state!=='thrown')throw Error('Outcome before end required');
   row.state=row.state==='returned'?'closed-return':'closed-throw';delete stack[--depth];
  }
  return undefined;
 }
 function tap(){try{return receive(arguments);}catch{fail('Component call protocol unavailable');return undefined;}}
 function currentToken(component){
  try{if(reason()||!depth)return null;const row=stack[depth-1];if(row.state!=='pending')return null;const r=refs(row);return r&&r.component===component?row.token:null;}catch{return null;}
 }
 const complete=token=>{
  if(!object(token))return null;const row=read(records,token);if(!row||row.state!=='closed-return')return null;const r=refs(row);return r?{row,refs:r}:null;
 };
 const observed=row=>dto({...unknown(null),status:'Observed',match:dto({frameId:row.frameId,parentFrameId:row.parentFrameId,siteId:row.siteId,role:row.role,ordinal:row.ordinal})});
 function lookup(token){try{const why=reason();if(why)return unknown(why);const c=complete(token);return c?observed(c.row):unknown('Complete live component call interval unavailable');}catch{return unknown('Component call lookup unavailable');}}
 function match(token,fiber,component,props){
  try{
   const why=reason();if(why)return unknown(why);if(arguments.length!==4&&arguments.length!==5)return unknown('Exact reference query required');
   const c=complete(token);if(!c)return unknown('Complete live component call interval unavailable');
   if(c.refs.fiber!==fiber||c.refs.component!==component||c.refs.props!==props)return unknown('Different component call references');
   if(arguments.length===5&&(!object(arguments[4])||!c.row.result||c.refs.result!==arguments[4]))return unknown('Exact object return reference unavailable');
   return observed(c.row);
  }catch{return unknown('Component call match unavailable');}
 }
 function stop(){stopped=true;clear();}
 return dto({tap,currentToken,lookup,match,stop,retention:()=>dto({events,framesCreated:serial,activeDepth:depth,stopped,capped,faulted:fault!==null,available:reason()===null,strongApplicationPins:0})});
}
