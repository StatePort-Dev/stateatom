// Dev-only synchronous observations; no application object serialization or extra body reads.
export function createObserver(w) {
  if (w.__STATEATOM__?.active) return w.__STATEATOM__;
  let active=true, serial=0, scopeSerial=0, exchangeSerial=0, stale=null, dropped=0;
  const page=w.crypto.randomUUID(), limits={records:2000,exportBytes:512000,closure:120};
  const nodes=new Map(), targets=new Map(), bindings=new Map(), captures=new Map(), urlCounts=new Map();
  const origins=new WeakMap(), descriptors=new WeakMap(), responses=new WeakMap(), writes=new WeakMap();
  const stack=[], exchanges=[];
  const object=v=>v!==null&&(typeof v==='object'||typeof v==='function');
  const primitive=v=>v===null||['boolean','number'].includes(typeof v)?(typeof v==='number'&&!Number.isFinite(v)?String(v):v):typeof v==='string'?v.slice(0,256):{kind:typeof v};
  const pointer=k=>String(k).replaceAll('~','~0').replaceAll('/','~1');
  function put(map,key,value,max=limits.records){map.set(key,value);while(map.size>max)map.delete(map.keys().next().value);}
  function feed(id){if(id&&stack.length)stack.at(-1).deps.add(id);}
  function add(meta,value,deps=[],extra={}){
    if(!active)return null;
    try{const n={...meta,...extra,id:page+':'+(++serial),at:Date.now(),page,value:primitive(value),deps:[...new Set(deps)].slice(0,80),status:'Observed'};
      nodes.set(n.id,n);while(nodes.size>limits.records){nodes.delete(nodes.keys().next().value);dropped++;}feed(n.id);return n;
    }catch{return null;}
  }
  function tagJSON(value,origin,budget,depth=0){
    if(!object(value)||depth>20||budget.remaining<=0)return;
    origins.set(value,origin);const own=Object.create(null);descriptors.set(value,own);let count=0;
    // JSON.parse produces plain data. Stop before allocating an unbounded descriptor copy.
    for(const key in value){if(!Object.hasOwn(value,key))continue;if(++count>128||--budget.remaining<0){budget.exceeded=true;break;}
      const d=Object.getOwnPropertyDescriptor(value,key);if(!d||!('value'in d))continue;own[key]=d;
      const field={...origin,pointer:origin.pointer+'/'+pointer(key)};
      if(field.pointer.length>512){budget.exceeded=true;continue;}
      if(object(d.value))tagJSON(d.value,field,budget,depth+1);
      else{const leaf={pointer:field.pointer,value:primitive(d.value)};const bytes=JSON.stringify(leaf).length;
        if(budget.bytes+bytes<=8192&&budget.leaves.length<128){budget.bytes+=bytes;budget.leaves.push(leaf);}else budget.exceeded=true;
      }
    }
  }
  function capture(meta,scope,fn){
    if(!active)return fn();const context={deps:new Set(),meta,scope};stack.push(context);let value;
    try{value=fn();}catch(error){stack.pop();add({...meta,kind:'throw',scope},undefined,context.deps,{boundary:'original exception propagated'});throw error;}
    stack.pop();const origin=object(value)?origins.get(value):null;
    const n=add({...meta,scope},value,context.deps,origin?{origin}:{});
    if(n){put(captures,scope+':'+meta.key,{node:n,object:meta.kind==='destructure-root'&&object(value)?value:null});if(meta.binding&&!meta.historyUnknown)put(bindings,scope+':'+meta.binding,n.id);if(meta.target)put(targets,scope+':'+meta.target+':'+meta.property,n.id);}
    return value;
  }
  const api={version:1,get active(){return active;},page,limits,
    scope(){return page+':scope'+(++scopeSerial);},capture,
    // Dev-only Vue computed debug events: actual reads, never toRaw()/getter re-execution.
    // Deliberately an observation, not a synthetic operand or framework commit edge.
    vueComputed(computed,args){
      if(!active||args.length>2)return Reflect.apply(computed,undefined,args);
      // Do not inspect/clone arbitrary application debug objects (including Proxies).
      // Existing debug options are passed through unchanged; this adapter is not enabled there.
      if(args[1]!=null)return Reflect.apply(computed,undefined,args);
      const options={onTrack(event){
        if(!active||!stack.length)return;
        try{
          if(event.type!=='get'||typeof event.key!=='string')return;
          const origin=origins.get(event.target),original=descriptors.get(event.target)?.[event.key];
          if(!origin||!original||!('value'in original))return;
          const current=Object.getOwnPropertyDescriptor(event.target,event.key);
          if(!current||!('value'in current)||current.value!==original.value||writes.get(event.target)?.has(event.key))return;
          const context=stack.at(-1),path=origin.pointer+'/'+pointer(event.key);if(path.length>512)return;
          add({...context.meta,kind:'framework-read',scope:context.scope,framework:'Vue computed onTrack',expression:'actual Vue get '+event.key},current.value,[],{objectIdentity:{...origin,pointer:path,scope:'parsed raw object/key identity only; not current value provenance'},valueOrigin:'Unknown/Unsupported',boundary:'actual raw framework read; same-value/local writes not excluded; exact operand/state-write/commit correspondence not established'});
        }catch{} // Optional telemetry must not alter the application's read/error behavior.
      }};
      return Reflect.apply(computed,undefined,[args[0],options]);
    },
    target(meta,scope,fn){return capture({...meta,kind:'target'},scope,fn);},
    read(meta,scope,binding,value){if(!active)return value;
      const previous=meta.historyUnknown?null:bindings.get(scope+':'+binding),origin=object(value)?origins.get(value):null;
      add({...meta,kind:'read',scope,binding},value,previous?[previous]:[],{...(origin?{origin}:{}),...(meta.historyUnknown?{boundary:'mutable or block/loop binding history unsupported'}:previous||origin?{}:{boundary:'binding write/parameter provenance not observed'})});return value;
    },
    member(meta,obj,key){
      const value=obj[key]; // The original property read, including its one ToPropertyKey/getter invocation.
      if(!active)return value;
      if(object(key)){add({...meta,kind:'member'},value,[],{boundary:'computed object key history unsupported; key not coerced again'});return value;}
      const write=object(obj)?writes.get(obj)?.get(key):null;
      const original=object(obj)?descriptors.get(obj)?.[key]:null;
      const current=original?Object.getOwnPropertyDescriptor(obj,key):null;
      const changed=original&&(!current||!('value'in current)||current.value!==original.value);
      const origin=original&&!changed&&object(obj)?origins.get(obj):null;
      add({...meta,kind:'member',key:typeof key==='symbol'?'[symbol]':String(key)},value,write?[write]:[],
        write?{boundary:'local property write; HTTP leaf no longer authoritative'}:changed?{boundary:'JSON property changed since parse; local history unknown'}:origin?{origin:{...origin,pointer:origin.pointer+'/'+pointer(key)}}:{boundary:'object/property history not observed; not an original own JSON data field'});
      return value;
    },
    write(meta,scope,obj,key,fn){const value=capture({...meta,kind:'local-write'},scope,fn);obj[key]=value;
      if(active&&object(obj)&&!object(key)){let map=writes.get(obj);if(!map){map=new Map();writes.set(obj,map);}const n=captures.get(scope+':'+meta.key)?.node;if(n)put(map,key,n.id,128);}return value;
    },
    pattern(meta,scope,binding,value,initKey,keys,last=false){
      const init=captures.get(scope+':'+initKey);let origin=init?.object?origins.get(init.object):null,current=init?.object;
      for(const key of keys){const original=current&&descriptors.get(current)?.[key],d=original?Object.getOwnPropertyDescriptor(current,key):null;
        if(!original||!d||!('value'in d)||d.value!==original.value||writes.get(current)?.has(key)){origin=null;break;}current=original.value;
      }
      const n=add({...meta,kind:'destructure',scope,binding},value,init?[init.node.id]:[],origin?{origin:{...origin,pointer:origin.pointer+keys.map(k=>'/'+pointer(k)).join('')}}:{boundary:'destructure root/property history unknown'});
      if(n&&!meta.historyUnknown)put(bindings,scope+':'+binding,n.id);if(last&&init)init.object=null;return value;
    },
    snapshot(instance,property){
      if(!active)return {schema:1,page,status:'Unknown/Unsupported',reason:'observer stopped; old history is not current',target:null,nodes:[],recentExchanges:[],limits};
      const targetId=targets.get(instance+':'+property),target=nodes.get(targetId),out=[],seen=new Set();let missing=false;
      const walk=id=>{if(seen.has(id)||out.length>=limits.closure){if(!seen.has(id))missing=true;return;}seen.add(id);const n=nodes.get(id);if(!n){missing=true;return;}out.push(n);for(const d of n.deps)walk(d);};if(targetId)walk(targetId);
      const result={schema:1,page,status:stale?'Stale':target&&!missing?'Observed':'Unknown/Unsupported',reason:stale||(missing?'trace closure/retention budget':!target?'No dev target execution observed':null),target:target||null,nodes:out,
        independentObservations:[...nodes.values()].filter(n=>n.scope===target?.scope&&n.kind==='binding'&&!seen.has(n.id)).slice(-20).map(n=>({...n,separateFromTarget:true})),
        exchanges:exchanges.filter(e=>out.some(n=>n.origin?.exchangeId===e.id)),recentExchanges:exchanges.slice(-32),dropped,missing,
        retention:{nodes:nodes.size,captures:captures.size,bindings:bindings.size,targets:targets.size,objectRoots:[...captures.values()].filter(c=>c.object).length},boundaries:[...new Set(out.map(n=>n.boundary).filter(Boolean))],limits};
      if(JSON.stringify(result).length>limits.exportBytes)return {schema:1,page,status:'Unknown/Unsupported',reason:'export byte budget',target:null,nodes:[],exchanges:[],recentExchanges:[],limits};return result;
    },
    invalidate(reason){stale=reason;},
    stop(){active=false;if(w.fetch===wrappedFetch)w.fetch=originalFetch;if(proto.json===wrappedJSON)proto.json=originalJSON;},
  };
  const originalFetch=w.fetch,proto=w.Response.prototype,originalJSON=proto.json;
  function wrappedFetch(...args){
    const promise=Reflect.apply(originalFetch,this,args),id=page+':exchange'+(++exchangeSerial);let url='[unsupported input]';
    if(typeof args[0]==='string')try{url=new URL(args[0],w.location.href).href;}catch{}
    let urlOrdinal=null;
    if(/^http:\/\/127\.0\.0\.1:(4173|4174|4175)\//.test(url)&&url.length<1024){urlOrdinal=(urlCounts.get(url)||0)+1;put(urlCounts,url,urlOrdinal,128);}
    promise.then(response=>{if(!active||urlOrdinal===null)return;try{responses.set(response,{id,url,urlOrdinal,method:'not inspected; browser owns method',startedAt:Date.now()});}catch{}},()=>{}).catch(()=>{});
    return promise;
  }
  function wrappedJSON(...args){
    const promise=Reflect.apply(originalJSON,this,args),exchange=responses.get(this);
    promise.then(value=>{if(!active||!exchange)return;try{const budget={remaining:2048,bytes:0,leaves:[],exceeded:false};tagJSON(value,{exchangeId:exchange.id,url:exchange.url,urlOrdinal:exchange.urlOrdinal,pointer:'',body:'actual parsed JSON object identity'},budget);
      exchanges.push({...exchange,consumedAt:Date.now(),body:'application called Response.json',parsedLeaves:budget.leaves,budgetExceeded:budget.exceeded});while(exchanges.length>32)exchanges.shift();
    }catch{}},()=>{}).catch(()=>{});return promise;
  }
  w.fetch=wrappedFetch;proto.json=wrappedJSON;w.__STATEATOM__=api;return api;
}
