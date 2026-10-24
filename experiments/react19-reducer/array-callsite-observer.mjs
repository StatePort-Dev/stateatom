// SPDX-License-Identifier: Apache-2.0
// Self-contained research recorder. Hooks never execute application expressions.
export function createArrayCallsiteObserver({page,enabled=true}={}){
 if(typeof page!=='string'||!page||page.length>128)throw TypeError('Research page identity required');
 const nativeFilter=Array.prototype.filter,nativeMap=Array.prototype.map,apply=Reflect.apply,array=Array.isArray,descriptor=Object.getOwnPropertyDescriptor,Reference=WeakRef;
 const object=x=>x!==null&&(typeof x==='object'||typeof x==='function');
 const scope='Historical original source-call callback identity links; causal storage and selected producer unknown';
 let calls=[],tokens=new WeakMap(),ids=new WeakMap(),identity=0,callSerial=0,generation=0,sequence=0,label='initial',yields=0,stopped=false,overflow=false,invalid=false,reason=null,unsupported=[];
 const window=()=>({id:page+':window:'+generation,label});
 const id=value=>{let n=ids.get(value);if(!n){n=page+':object:'+ ++identity;ids.set(value,n);}return n;};
 const ref=value=>object(value)?new Reference(value):null;
 function clear(){calls=[];tokens=new WeakMap();yields=0;}
 function note(site,why){if(unsupported.length<32&&!unsupported.some(x=>x.siteId===site&&x.reason===why))unsupported.push({siteId:site,reason:why});}
 function refuse(why,capacity=false){reason=why;if(capacity)overflow=true;else invalid=true;clear();}
 function sourceSite(input){
  if(!object(input))return null;const s={};
  for(const key of['id','file','sourceDigest','kind','line','column','endLine','endColumn']){const d=descriptor(input,key);if(!d||!Object.hasOwn(d,'value'))return null;s[key]=d.value;}
  if(typeof s.id!=='string'||!s.id||s.id.length>200||typeof s.file!=='string'||!s.file||s.file.length>1024||typeof s.sourceDigest!=='string'||!/^[a-f0-9]{64}$/.test(s.sourceDigest)||!['filter','map'].includes(s.kind))return null;
  if(!['line','column','endLine','endColumn'].every(k=>Number.isSafeInteger(s[k])&&s[k]>0)||s.endLine<s.line||s.endLine===s.line&&s.endColumn<s.column)return null;return s;
 }
 function begin(method,receiver,site){
  if(!enabled||stopped||overflow||invalid)return null;
  try{
   if(method!==nativeFilter&&method!==nativeMap){note(null,'Non-native array method; no execution evidence');return null;}
   const s=sourceSite(site);if(!s){note(null,'Inert exact source site required');return null;}
   if(s.kind!==(method===nativeFilter?'filter':'map')||!array(receiver)){note(s.id,'Method or array receiver not admitted');return null;}
   if(calls.length>=64){refuse('Call capacity exceeded',true);return null;}
   const token={},entry={id:page+':call:'+ ++callSerial,kind:s.kind,site:s,receiver:new Reference(receiver),receiverId:id(receiver),result:null,resultId:null,started:++sequence,finished:null,done:false,yields:[]};calls.push(entry);tokens.set(token,entry);return token;
  }catch{refuse('Observation bookkeeping unavailable');return null;}
 }
 function yielded(token,item,index,receiver,result){
  if(!enabled||stopped||overflow||invalid)return result;
  try{
   const entry=object(token)?tokens.get(token):null;if(!entry)return result;
   if(entry.done||receiver!==entry.receiver.deref()||!Number.isSafeInteger(index)||index<0){refuse('Invalid or late original callback frame');return result;}
   if(yields>=512){refuse('Yield capacity exceeded',true);return result;}
   if(!object(item)||entry.kind==='map'&&!object(result))note(entry.site.id,'Primitive callback identities unsupported');
   entry.yields.push({item:ref(item),itemId:object(item)?id(item):null,index,accepted:entry.kind==='filter'?!!result:null,element:entry.kind==='map'?ref(result):null,elementId:entry.kind==='map'&&object(result)?id(result):null});++yields;
  }catch{refuse('Observation bookkeeping unavailable');}
  return result;
 }
 function finish(token,result){
  if(!enabled||stopped||overflow||invalid)return result;
  try{const entry=object(token)?tokens.get(token):null;if(!entry)return result;if(entry.done||!object(result)){refuse('Invalid or repeated call completion');return result;}entry.result=ref(result);entry.resultId=id(result);entry.finished=++sequence;entry.done=true;}catch{refuse('Observation bookkeeping unavailable');}
  return result;
 }
 function abort(token){try{const entry=object(token)?tokens.get(token):null;if(entry&&!entry.done){calls=calls.filter(x=>x!==entry);yields-=entry.yields.length;tokens.delete(token);}}catch{refuse('Observation bookkeeping unavailable');}}
 function startWindow(next){if(stopped||typeof next!=='string'||!next||next.length>80)return null;clear();++generation;label=next;sequence=0;overflow=false;invalid=false;reason=null;unsupported=[];return window();}
 function snapshot(){
  const audit=calls.map(c=>({id:c.id,kind:c.kind,site:{...c.site},sourceId:c.receiverId,resultId:c.resultId,started:c.started,finished:c.finished,status:c.done?'completed':'pending',yields:c.yields.map(y=>({index:y.index,itemId:y.itemId,elementId:y.elementId,accepted:y.accepted}))}));
  const base={schema:'stateatom.array-callsite-observation/1',status:'Unknown/Unsupported',reason:stopped?'Observer stopped':overflow||invalid?reason:!enabled?'Observer disabled':'No unique completed original callback link',scope,page,window:window(),calls:audit,links:[],unsupported:[...unsupported],causalTransfer:'Unknown/Unsupported',resultStorage:'Unknown/Unsupported',currentMembership:'Unknown/Unsupported',fieldOwnership:'Unknown/Unsupported',stateRevision:'Unknown/Unsupported',propTransfer:'Unknown/Unsupported',selectedPropertyOrigin:'Unknown/Unsupported',fullPath:false};
  if(!enabled||stopped||overflow||invalid)return base;
  const filters=calls.filter(x=>x.done&&x.kind==='filter'),maps=calls.filter(x=>x.done&&x.kind==='map'),links=[],notes=[...unsupported];
  const warn=(siteId,why)=>{if(notes.length<32&&!notes.some(x=>x.siteId===siteId&&x.reason===why))notes.push({siteId,reason:why});};
  const view=entry=>({id:entry.id,site:{...entry.site},sourceId:entry.receiverId,resultId:entry.resultId,started:entry.started,finished:entry.finished});
  for(const f of filters){const filtered=f.resultId;if(!filtered)continue;
   if(filters.filter(x=>x.resultId===filtered).length!==1){warn(f.site.id,'Ambiguous completed filter result');continue;}
   for(const m of maps){const mapped=m.resultId;if(m.receiverId!==filtered||!mapped)continue;
    if(f.finished>=m.started){warn(m.site.id,'Filter was not completed before map began');continue;}
    if(maps.filter(x=>x.receiverId===filtered&&x.resultId===mapped).length!==1){warn(m.site.id,'Ambiguous completed map result');continue;}
    for(const a of f.yields){const item=a.itemId;if(!a.accepted||!item)continue;
     if(f.yields.filter(x=>x.accepted&&x.itemId===item).length!==1){warn(f.site.id,'Ambiguous accepted alias slots');continue;}
     for(const b of m.yields){const element=b.elementId;if(b.itemId!==item||!element)continue;if(m.yields.filter(x=>x.itemId===item&&x.elementId===element).length!==1){warn(m.site.id,'Ambiguous map callback result slots');continue;}
      links.push({filter:view(f),map:view(m),itemId:item,elementId:element,sourceIndex:a.index,mapIndex:b.index});
     }
    }
   }
  }
  return{...base,status:links.length?'Observed':base.status,reason:links.length?null:base.reason,links,unsupported:notes};
 }
 return Object.freeze({apply,begin,yielded,finish,abort,startWindow,snapshot,stop(){stopped=true;clear();ids=new WeakMap();},retention:()=>({calls:calls.length,yields,pending:calls.filter(x=>!x.done).length,stopped,overflow,invalid,window:generation})});
}
