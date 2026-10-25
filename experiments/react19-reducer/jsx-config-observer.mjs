// SPDX-License-Identifier: Apache-2.0
// Historical source-proven fresh JSX config input, not a field-storage witness.
export function createJSXConfigInputObserver({page}={}){
 if(typeof page!=='string'||!page||page.length>128)throw TypeError('Bounded JSX source page identity required');
 const Map=WeakMap,apply=Reflect.apply,get=WeakMap.prototype.get,set=WeakMap.prototype.set;
 const create=Object.create,define=Object.defineProperty,freeze=Object.freeze,keys=Object.keys,descriptor=Object.getOwnPropertyDescriptor,integer=Number.isSafeInteger;
 const object=x=>x!==null&&(typeof x==='object'||typeof x==='function');
 const read=(m,k)=>apply(get,m,[k]),put=(m,k,v)=>apply(set,m,[k,v]);
 const data=(value,enumerable=false,writable=false,configurable=false)=>{const d=create(null);d.value=value;d.enumerable=enumerable;d.writable=writable;d.configurable=configurable;return d;};
 const dto=fields=>{const out=create(null),names=keys(fields);for(let i=0;i<names.length;i++)define(out,names[i],data(fields[names[i]],true));return freeze(out);};
 const list=()=>{const out=[];define(out,'toJSON',data(undefined));return out;};
 const append=(a,v)=>define(a,a.length,data(v,true,true,true));
 let generation=0,label='initial',identity=0,serial=0,events=0,completed=0,unsupported=0;
 let stopped=false,collecting=true,overflow=false,invalid=false,reason=null;
 let configs=new Map(),elements=new Map(),ids=new Map(),rows=list();
 const window=()=>dto({id:page+':jsx-config:window:'+generation,label});
 function id(value){let n=read(ids,value);if(!n){n=page+':jsx-config:'+generation+':object:'+ ++identity;put(ids,value,n);}return n;}
 function clear(){configs=new Map();elements=new Map();ids=new Map();rows=list();completed=0;}
 function refuse(why,capacity=false){reason=why;if(capacity)overflow=true;else invalid=true;clear();}
 function tick(){if(events>=4096){refuse('JSX input event capacity refused',true);return false;}events++;return true;}
 function sourceSite(input){
  if(!object(input))return null;const s=create(null),names=['id','file','sourceDigest','line','column','endLine','endColumn'];
  for(let i=0;i<names.length;i++){const k=names[i],d=descriptor(input,k);if(!d||!descriptor(d,'value'))return null;s[k]=d.value;}
  if(typeof s.id!=='string'||!s.id||s.id.length>200||typeof s.file!=='string'||!s.file||s.file.length>1024||typeof s.sourceDigest!=='string'||s.sourceDigest.length!==64)return null;
  for(let i=0;i<64;i++){const c=s.sourceDigest[i];if(!(c>='a'&&c<='f'||c>='0'&&c<='9'))return null;}
  for(let i=3;i<names.length;i++)if(!integer(s[names[i]])||s[names[i]]<1)return null;
  if(s.endLine<s.line||s.endLine===s.line&&s.endColumn<s.column)return null;return dto(s);
 }
 function receive(kind,value,config,site){
  if(stopped||!collecting||overflow||invalid)return;
  if(kind!=='config-input'&&kind!=='jsx-element-return')return;
  if(!tick())return;
  if(kind==='config-input'){
   const s=sourceSite(site);if(!s||!object(value)||!object(config)){unsupported++;return;}
   if(read(configs,config)){refuse('Duplicate fresh config input occurrence');return;}
   if(rows.length>=64){refuse('JSX config capacity refused',true);return;}
   const row={inputId:page+':jsx-config:'+generation+':input:'+ ++serial,configId:id(config),valueId:id(value),elementId:null,site:s,done:false};
   put(configs,config,row);append(rows,row);return;
  }
  const row=object(config)?read(configs,config):null;if(!row){unsupported++;return;}
  if(row.done||!object(value)||read(elements,value)){refuse('Invalid or repeated native JSX return occurrence');return;}
  row.done=true;row.elementId=id(value);completed++;put(elements,value,row);
 }
 function tap(kind,value,config,site){try{receive(kind,value,config,site);}catch{refuse('JSX input metadata unavailable');}return value;}
 function rowView(row){return dto({inputId:row.inputId,inputKind:'source-fresh-own-data-config',field:'todo',configId:row.configId,valueId:row.valueId,elementId:row.elementId,site:row.site,status:row.done?'completed':'pending'});}
 function snapshotFor(selected=null){
  const audit=list(),links=list(),pending=rows.length-completed;
  const eligible=!stopped&&!collecting&&!overflow&&!invalid&&pending===0;
  for(let i=0;i<rows.length;i++){const r=rows[i];append(audit,rowView(r));if(eligible&&r.done&&(!selected||selected===r))append(links,rowView(r));}
  const status=links.length?'Observed':'Unknown/Unsupported';
  return dto({schema:'stateatom.react19-jsx-config-input/1',scope:'Historical fresh own-data config input and exact native JSX props/element identity; storage and selected consumer unknown',page,window:window(),status,reason:links.length?null:stopped?'Observer stopped':overflow||invalid?reason:collecting?'Collection window not sealed':pending?'No complete exact config/native-props association':'No eligible source config input',collecting,sealed:!collecting&&!stopped,inputs:freeze(audit),links:freeze(links),unsupportedCount:unsupported,nativeOrigin:'NotAttested',propStorage:'Unknown/Unsupported',propTransfer:'Unknown/Unsupported',fieldOwnership:'Unknown/Unsupported',stateRevision:'Unknown/Unsupported',selectedPropertyOrigin:'Unknown/Unsupported',fullPath:false});
 }
 function snapshot(){return snapshotFor();}
 function lookup(element){const row=object(element)?read(elements,element):null;if(row)return snapshotFor(row);const v=snapshotFor();return dto({...v,status:'Unknown/Unsupported',reason:'No exact recorded JSX element identity',links:freeze(list())});}
 function retention(){return dto({configs:rows.length,completed,pending:rows.length-completed,events,unsupported,stopped,collecting,overflow,invalid,window:generation});}
 function sealWindow(){if(stopped)return dto({sealed:false,snapshot:snapshot(),retention:retention()});collecting=false;return dto({sealed:true,snapshot:snapshot(),retention:retention()});}
 function startWindow(next){if(stopped||typeof next!=='string'||!next||next.length>80)return null;clear();generation++;label=next;identity=0;serial=0;events=0;unsupported=0;overflow=false;invalid=false;reason=null;collecting=true;return window();}
 function stop(){stopped=true;collecting=false;clear();}
 return dto({tap,snapshot,lookup,retention,sealWindow,startWindow,stop});
}
