// SPDX-License-Identifier: Apache-2.0
// Research hook-argument history only. Never reads application object properties.
export function createPropCopyObserver({page}={}){
 if(typeof page!=='string'||!page||page.length>128)throw TypeError('Bounded source page identity required');
 const NativeWeakMap=WeakMap,apply=Reflect.apply,get=WeakMap.prototype.get,set=WeakMap.prototype.set;
 const create=Object.create,define=Object.defineProperty,freeze=Object.freeze,keys=Object.keys;
 const object=x=>x!==null&&(typeof x==='object'||typeof x==='function');
 const read=(map,key)=>apply(get,map,[key]);
 const put=(map,key,value)=>apply(set,map,[key,value]);
 // Descriptor objects also need a null prototype: inherited get/set accessors
 // must not run while recording an otherwise ordinary application operation.
 const data=(value,enumerable=false,writable=false,configurable=false)=>{const d=create(null);d.value=value;d.enumerable=enumerable;d.writable=writable;d.configurable=configurable;return d;};
 // All copied fields below are recorder-owned data. No app object reaches a DTO.
 const dto=fields=>{const out=create(null),names=keys(fields);for(let i=0;i<names.length;i++)define(out,names[i],data(fields[names[i]],true));return freeze(out);};
 const list=()=>{const out=[];define(out,'toJSON',data(undefined));return out;};
 const append=(array,value)=>define(array,array.length,data(value,true,true,true));
 const scope='Historical original classic React todo copy-assignment input; storage and consumer unknown';
 let generation=0,label='initial',identity=0,copySerial=0,events=0,copyInputs=0,completed=0;
 let stopped=false,collecting=true,overflow=false,invalid=false,reason=null,unsupported=0;
 let props=new NativeWeakMap(),elements=new NativeWeakMap(),ids=new NativeWeakMap(),calls=list();
 const window=()=>dto({id:page+':prop-copy:window:'+generation,label});
 function id(value){let found=read(ids,value);if(!found){found=page+':prop-copy:'+generation+':object:'+ ++identity;put(ids,value,found);}return found;}
 function clear(){props=new NativeWeakMap();elements=new NativeWeakMap();ids=new NativeWeakMap();calls=list();copyInputs=0;completed=0;}
 function refuse(why,capacity=false){reason=why;if(capacity)overflow=true;else invalid=true;clear();}
 function tick(){if(events>=4096){refuse('Metadata event capacity refused',true);return false;}events++;return true;}
 function receive(kind,value,container,key){
  if(stopped||!collecting||overflow||invalid)return;
  if(kind!=='props-created'&&kind!=='copy-input'&&kind!=='element-return')return;
  if(!tick())return;
  if(kind==='props-created'){
   if(!object(value)){unsupported++;return;}
   if(read(props,value)){refuse('Duplicate props creation occurrence');return;}
   if(calls.length>=64){refuse('Props creation capacity refused',true);return;}
   const row={copyId:page+':prop-copy:'+generation+':copy:'+ ++copySerial,propsId:id(value),seenCopy:false,valueId:null,elementId:null,done:false};
   put(props,value,row);append(calls,row);return;
  }
  const row=object(container)?read(props,container):null;
  if(!row){unsupported++;return;}
  if(kind==='copy-input'){
   if(key!=='todo'){unsupported++;return;}
   if(row.done||row.seenCopy){refuse('Duplicate or late copy-input occurrence');return;}
   row.seenCopy=true;
   if(!object(value)){unsupported++;return;}
   row.valueId=id(value);copyInputs++;return;
  }
  if(row.done||!object(value)||read(elements,value)){refuse('Invalid or repeated element-return occurrence');return;}
  row.done=true;row.elementId=id(value);completed++;put(elements,value,row);
 }
 function tap(kind,value,container,key){try{receive(kind,value,container,key);}catch{refuse('Observation bookkeeping unavailable');}return value;}
 function rowView(row){return dto({copyId:row.copyId,propsId:row.propsId,valueId:row.valueId,elementId:row.elementId,field:'todo',status:!row.done?'pending':row.valueId?'completed':'unsupported'});}
 function snapshotFor(selected=null){
  const audit=list(),links=list();
  for(let i=0;i<calls.length;i++)append(audit,rowView(calls[i]));
  const pending=calls.length-completed;
  const admissible=!stopped&&!collecting&&!overflow&&!invalid&&pending===0;
  if(admissible)for(let i=0;i<calls.length;i++){const row=calls[i];if(row.done&&row.valueId&&(!selected||selected===row))append(links,rowView(row));}
  const status=links.length?'Observed':'Unknown/Unsupported';
  const why=stopped?'Observer stopped':overflow||invalid?reason:collecting?'Collection window not sealed':pending?'Original construction incomplete':!links.length?'No sealed eligible copy input':null;
  return dto({schema:'stateatom.react19-prop-copy-input/1',page,scope,window:window(),status,reason:why,collecting,sealed:!collecting&&!stopped,calls:freeze(audit),links:freeze(links),unsupportedCount:unsupported,nativeOrigin:'NotAttested',propStorage:'Unknown/Unsupported',propTransfer:'Unknown/Unsupported',fieldOwnership:'Unknown/Unsupported',stateRevision:'Unknown/Unsupported',selectedPropertyOrigin:'Unknown/Unsupported',fullPath:false});
 }
 function snapshot(){return snapshotFor();}
 function lookup(element){const row=object(element)?read(elements,element):null;if(row)return snapshotFor(row);const base=snapshotFor();return dto({...base,status:'Unknown/Unsupported',reason:'No exact recorded element identity',links:freeze(list())});}
 function retention(){return dto({props:calls.length,copyInputs,completed,pending:calls.length-completed,events,unsupported,stopped,collecting,overflow,invalid,window:generation});}
 function sealWindow(){if(stopped)return dto({sealed:false,snapshot:snapshot(),retention:retention()});collecting=false;return dto({sealed:true,snapshot:snapshot(),retention:retention()});}
 function startWindow(next){if(stopped||typeof next!=='string'||!next||next.length>80)return null;clear();generation++;label=next;identity=0;copySerial=0;events=0;unsupported=0;overflow=false;invalid=false;reason=null;collecting=true;return window();}
 function stop(){stopped=true;collecting=false;clear();}
 return dto({tap,snapshot,lookup,sealWindow,startWindow,stop,retention});
}
