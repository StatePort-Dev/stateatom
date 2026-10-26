// SPDX-License-Identifier: Apache-2.0
// Conditional source protocol consumer; no native/body authenticity or field ownership claim.
export function createComponentBodyObserver({page,nativeCalls,policy,enabled=true,weakRef=globalThis.WeakRef}={}){
 if(typeof page!=='string'||page.length<1||page.length>128||typeof enabled!=='boolean')throw TypeError('Bounded page and boolean enabled required');
 const create=Object.create,freeze=Object.freeze,define=Object.defineProperty,keys=Reflect.ownKeys,describe=Object.getOwnPropertyDescriptor,has=Object.hasOwn,apply=Reflect.apply,isArray=Array.isArray,integer=Number.isSafeInteger;
 const WM=WeakMap,get=WM.prototype.get,set=WM.prototype.set,Ref=weakRef,U='Unknown/Unsupported';
 const object=v=>v!==null&&(typeof v==='object'||typeof v==='function');
 const own=(o,k)=>{if(!object(o))throw Error('Own metadata required');const d=describe(o,k);if(!d||!has(d,'value'))throw Error('Own data required');return d.value;};
 const exact=(o,fields)=>{const names=keys(o);if(names.length!==fields.length)throw Error('Closed metadata required');for(let i=0;i<names.length;i++){let found=false;for(let j=0;j<fields.length;j++)if(fields[j]===names[i]){found=true;break;}if(!found)throw Error('Closed metadata required');}for(let i=0;i<fields.length;i++)own(o,fields[i]);};
 const dto=fields=>{const out=create(null),names=keys(fields);for(let i=0;i<names.length;i++){const k=names[i],d=create(null);d.value=fields[k];d.enumerable=true;define(out,k,d);}return freeze(out);};
 const append=(a,v)=>{const d=create(null);d.value=v;d.enumerable=true;d.writable=true;d.configurable=true;define(a,a.length,d);};
 const read=(map,k)=>apply(get,map,[k]),put=(map,k,v)=>apply(set,map,[k,v]);
 let entries=new WM(),frames=new WM(),current=null,nativeMatch=null,deref=null,unavailable=null,entrySite=null,returnSite=null,labels=null,events=0,serial=0,stopped=false,capped=false,fault=null;
 const clear=()=>{entries=new WM();frames=new WM();};
 const fail=()=>{fault='Component body protocol unavailable';clear();};
 const hex=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
 if(enabled)try{
  exact(policy,['schema','file','sourceDigest','owner','parameters','sites']);
  const file=own(policy,'file'),digest=own(policy,'sourceDigest'),owner=own(policy,'owner');
  if(own(policy,'schema')!=='stateatom.component-body-source/1'||typeof file!=='string'||!file||file.length>1024||!hex(digest)||typeof owner!=='string'||!owner||owner.length>256)throw Error('Body source metadata required');
  const params=own(policy,'parameters'),sites=own(policy,'sites');
  if(!isArray(params)||own(params,'length')!==2||!isArray(sites)||own(sites,'length')!==2)throw Error('Two parameters/sites required');
  const names=[];for(let i=0;i<2;i++){const p=own(params,String(i));exact(p,['key','binding']);const key=own(p,'key'),binding=own(p,'binding');if(typeof key!=='string'||!key||key.length>256||typeof binding!=='string'||!binding||binding.length>256)throw Error('Parameter labels required');append(names,dto({key,binding}));}
  if(names[0].key===names[1].key||names[0].binding===names[1].binding)throw Error('Distinct parameters required');
  for(let i=0;i<2;i++){
   const s=own(sites,String(i));exact(s,['id','file','sourceDigest','kind','owner','line','column','endLine','endColumn']);
   const id=own(s,'id'),kind=own(s,'kind');if(!hex(id)||own(s,'file')!==file||own(s,'sourceDigest')!==digest||own(s,'owner')!==owner)throw Error('Exact source site required');
   const coordinates=['line','column','endLine','endColumn'];for(let j=0;j<coordinates.length;j++){const k=coordinates[j];if(!integer(own(s,k))||own(s,k)<1)throw Error('Source coordinates required');}
   if(own(s,'endLine')<own(s,'line')||own(s,'endLine')===own(s,'line')&&own(s,'endColumn')<own(s,'column'))throw Error('Source range required');
   if(kind==='component-body-entry'&&!entrySite)entrySite=id;else if(kind==='component-body-return'&&!returnSite)returnSite=id;else throw Error('Unique body sites required');
  }
  if(entrySite===returnSite)throw Error('Distinct sites required');
  current=own(nativeCalls,'currentToken');nativeMatch=own(nativeCalls,'match');deref=own(own(Ref,'prototype'),'deref');
  if(typeof current!=='function'||typeof nativeMatch!=='function'||typeof deref!=='function')throw Error('Conditional native observer and WeakRef required');
  labels=dto({file,sourceDigest:digest,owner,parameter1:names[0],parameter2:names[1],entrySite,returnSite});
 }catch{unavailable='Component body source/native/WeakRef policy unavailable';}
 const reason=()=>!enabled?'Body observer disabled':stopped?'Body observer stopped':capped?'Body research capacity refused':fault||unavailable;
 const unknown=why=>dto({schema:'stateatom.component-body-reference/1',page,status:U,reason:why,match:null,sourceOnly:true,nativeOrigin:'NotAttested',componentInvocationRuntimeQualified:false,fieldOwnership:U,selectedPropertyOrigin:U,fullPath:false});
 const weak=r=>apply(deref,r,[]),top=self=>apply(current,nativeCalls,[self]);
 function receive(args){
  if(reason())return undefined;
  if(events>=4096){capped=true;clear();return undefined;}events++;
  if(args[0]==='component-body-entry'){
   if(args.length!==5||args[4]!==entrySite||typeof args[1]!=='function')throw Error('Exact body entry required');
   const self=args[1],native=top(self);if(native===null)return undefined;if(!object(native))throw Error('Opaque native token required');
   let group=read(frames,native);if(!group){group={count:0,stack:create(null),depth:0,only:null};put(frames,native,group);}group.count++;
   // Non-reference parameters cannot yield an exact object-reference association.
   const token=freeze(create(null)),row={native,group,self:new Ref(self),a:object(args[2])?new Ref(args[2]):null,b:object(args[3])?new Ref(args[3]):null,result:null,returned:false,id:page+':body:'+ ++serial};
   group.stack[group.depth++]=row;if(group.count===1)group.only=row;put(entries,token,row);return token;
  }
  if(args[0]!=='component-body-return'||args.length!==4||args[3]!==returnSite)throw Error('Exact body return required');
  const row=object(args[1])?read(entries,args[1]):null,self=row?weak(row.self):null;
  if(!row||row.returned||!self||top(self)!==row.native||row.group.depth===0||row.group.stack[row.group.depth-1]!==row)throw Error('Original top body/native frame required');
  row.returned=true;row.result=object(args[2])?new Ref(args[2]):null;delete row.group.stack[--row.group.depth];return undefined;
 }
 function tap(){try{return receive(arguments);}catch{fail();return undefined;}}
 function match(native,fiber,self,props,a,b,result){
  try{
   const why=reason();if(why)return unknown(why);if(arguments.length!==7||!object(native))return unknown('Exact body query required');
   const group=read(frames,native),row=group?.only;
   if(!group||group.count!==1||group.depth!==0||!row?.returned||!row.a||!row.b||!row.result)return unknown('Unique complete body entry unavailable');
   const refs=[weak(row.self),weak(row.a),weak(row.b),weak(row.result)];
   if(!object(refs[0])||!object(refs[1])||!object(refs[2])||!object(refs[3])||refs[0]!==self||refs[1]!==a||refs[2]!==b||refs[3]!==result)return unknown('Exact live body references unavailable');
   const nativeDTO=apply(nativeMatch,nativeCalls,[native,fiber,self,props,result]);if(own(nativeDTO,'status')!=='Observed')return unknown('Complete native interval unavailable');
   return dto({...unknown(null),status:'Observed',match:dto({id:row.id,source:labels,nativeFrame:own(own(nativeDTO,'match'),'frameId')})});
  }catch{return unknown('Body reference match unavailable');}
 }
 function stop(){stopped=true;clear();}
 return dto({tap,match,stop,retention:()=>dto({events,entriesCreated:serial,stopped,capped,faulted:fault!==null,available:reason()===null,strongApplicationPins:0})});
}
