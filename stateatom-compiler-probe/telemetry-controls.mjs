// SPDX-License-Identifier: Apache-2.0
// Declared synthetic controls, called after observer bootstrap and before app entry.
// All patches are restored synchronously before the original application resumes.
export function runTelemetryControls(observer){
  const define=Object.defineProperty,descriptor=Object.getOwnPropertyDescriptor,apply=Reflect.apply;
  const OriginalSet=Set,mapIterator=Object.getPrototypeOf(new Map().keys()),setIterator=Object.getPrototypeOf(new Set().values());
  const meta=(kind,extra={})=>({kind,file:'controlled.ts',sourceDigest:'controlled',line:1,column:1,key:kind,expression:kind,...extra});
  const changes=[
    ['Date.now',Date,'now'],['Map.set',Map.prototype,'set'],['Map.size',Map.prototype,'size'],['Map.keys',Map.prototype,'keys'],['Map.delete',Map.prototype,'delete'],
    ['Set constructor',globalThis,'Set'],['Set.add',Set.prototype,'add'],['Set iterator',Set.prototype,Symbol.iterator],['Set iterator next',setIterator,'next'],['Map iterator next',mapIterator,'next'],
    ['WeakMap.get',WeakMap.prototype,'get'],['Array.push',Array.prototype,'push'],['Array.pop',Array.prototype,'pop'],['Array.at',Array.prototype,'at'],['Array.slice',Array.prototype,'slice'],['Array.includes',Array.prototype,'includes'],
    ['Number.isFinite',Number,'isFinite'],['String.slice',String.prototype,'slice'],['clock accessor',Date,'now'],
  ];
  const results=[];
  for(const[name,owner,key]of changes){
    const scope=observer.scope(),data={quota:12},before=descriptor(owner,key),originalError={control:'original'};let callbacks=0,userCalls=0,getterCalls=0,errorCalls=0,value,error,sameError=false;
    const touch=()=>{callbacks++;data.quota=99;};
    const replacement=name==='Set constructor'?function(...args){touch();return new OriginalSet(...args);}:before.get?function(){touch();return apply(before.get,this,[]);}:function(...args){touch();return apply(before.value,this,args);};
    define(owner,key,name==='clock accessor'?{configurable:true,get(){touch();throw Error('replaced clock getter');}}:{...before,...(before.get?{get:replacement}:{value:replacement})});
    try{
      value=observer.capture(meta('binding',{binding:'binding'}),scope,()=>{userCalls++;return observer.read(meta('read'),scope,'input',observer.member(meta('member'),data,'quota'));});
      observer.capture(meta('string'),scope,()=>observer.member(meta('member'),{get text(){getterCalls++;return 'hello';}},'text'));
      try{observer.capture(meta('throwing'),scope,()=>{errorCalls++;throw originalError;});}catch(e){sameError=e===originalError;}
      if(name==='Map.delete'||name==='Map.keys'||name==='Map iterator next')for(let i=0;i<2010;i++)observer.member(meta('member'),data,'quota');
    }catch(e){error=String(e);}finally{define(owner,key,before);}
    const evicted=name==='Map.delete'||name==='Map.keys'||name==='Map iterator next';let retained=null;
    if(!evicted){observer.target(meta('target',{property:'text',target:'t'}),scope,()=>observer.read(meta('read'),scope,'binding',12));retained=observer.snapshot(scope+':t','text').nodes.some(n=>n.kind==='binding'&&n.value===12);}
    results.push({name,callbacks,userCalls,getterCalls,errorCalls,sameError,value,quota:data.quota,error:error||null,retained});
  }
  for(const count of[80,81]){
    const scope=observer.scope();observer.target(meta('target',{property:'text',target:'t'}),scope,()=>{for(let i=0;i<count;i++)observer.member(meta('member'),{quota:i},'quota');return 1;});
    const snapshot=observer.snapshot(scope+':t','text');results.push({name:'dependency limit '+count,count:snapshot.target.deps.length,missing:snapshot.missing,status:snapshot.status,boundary:snapshot.target.boundary||null});
  }
  return results;
}

// Same runtime body, different initialization history. Refusal evidence only.
export function runClosureControl(observer){
  const context={calls:0,data:{quota:12}},scope=observer.scope();let value,userCalls=0,error=null;
  const meta={file:'controlled.ts',sourceDigest:'controlled',line:1,column:1,key:'closure'};
  const original=globalThis.__SA_DECLARED_CLOCK_ORIGINAL__;
  if(original)Object.defineProperty(Date,'now',original);
  const publicClockRestored=!original||Object.getOwnPropertyDescriptor(Date,'now').value===original.value;
  globalThis.__SA_DECLARED_CLOCK_STATE__=context;
  try{value=observer.capture({...meta,kind:'binding'},scope,()=>{userCalls++;return observer.read(meta,scope,'input',observer.member(meta,context.data,'quota'));});}
  catch(e){error=String(e);}
  finally{
    delete globalThis.__SA_DECLARED_CLOCK_STATE__;
    if(original)Object.defineProperty(Date,'now',original);
    delete globalThis.__SA_DECLARED_CLOCK_ORIGINAL__;
  }
  return{calls:context.calls,quota:context.data.quota,value,userCalls,error,publicClockRestored};
}
