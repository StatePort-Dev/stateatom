// SPDX-License-Identifier: Apache-2.0
// Inert input-edit plans only. Adapters must supply fresh facts and independent
// admission immediately before mutation; parsing a plan never grants authority.
const encoder=new TextEncoder(),MAX_BYTES=65536,MAX_STRING=4096;
const forbidden=new Set(['__proto__','prototype','constructor']);
const grants=['read','inject','override','replay'];
function fail(code,message){const error=new Error(message);error.name='ExperimentPlanError';error.code=code;throw error;}
const invalid=message=>fail('INVALID_PLAN',message);
const unsupported=message=>fail('RESOURCE_UNSUPPORTED',message);
function string(value,max=512,empty=false){if(typeof value!=='string'||(!empty&&!value)||encoder.encode(value).length>max)invalid('Invalid or oversized plan string');return value;}
function record(value){if(!value||typeof value!=='object'||Array.isArray(value))invalid('Plan record required');return value;}
function keys(value,required,optional=[]){record(value);if(required.some(k=>!Object.hasOwn(value,k))||Object.keys(value).some(k=>!required.includes(k)&&!optional.includes(k)))invalid('Unexpected or missing plan field');}

// Copy descriptors rather than evaluating getters/toJSON supplied by a caller.
// Chrome message boundaries supply inert JSON; arbitrary in-process Proxy input
// is not an observation adapter and must not be used as application evidence.
function data(input){let nodes=0;
 function copy(value,depth=0){
  if(++nodes>4096||depth>12)invalid('Plan structure budget exceeded');
  if(value===null||value===undefined||['string','number','boolean'].includes(typeof value))return value;
  if(typeof value!=='object'||(!Array.isArray(value)&&![Object.prototype,null].includes(Object.getPrototypeOf(value))))invalid('Only inert JSON data is accepted');
  const result=Array.isArray(value)?[]:{};
  for(const key of Reflect.ownKeys(value)){
   if(Array.isArray(value)&&key==='length')continue;
   if(typeof key!=='string'||forbidden.has(key)||Array.isArray(value)&&!/^(0|[1-9]\d*)$/.test(key))invalid('Unsafe plan key');
   const d=Object.getOwnPropertyDescriptor(value,key);if(!d||!Object.hasOwn(d,'value')||!d.enumerable)invalid('Accessor/non-JSON plan data refused');
   result[key]=copy(d.value,depth+1);
  }
  if(Array.isArray(value)&&(result.length!==value.length||Object.keys(result).length!==value.length))invalid('Sparse plan array refused');
  return result;
 }
 const result=copy(input);if(encoder.encode(JSON.stringify(result)??'').length>MAX_BYTES)invalid('Plan limit is 64 KiB');return result;
}
function freeze(value){if(value&&typeof value==='object'){for(const v of Object.values(value))freeze(v);Object.freeze(value);}return value;}
function scalar(value,type,code='TYPE_MISMATCH'){
 if(typeof value!==type||!['boolean','number','string'].includes(type)||type==='number'&&(!Number.isFinite(value)||Object.is(value,-0)))fail(code,'Expected a JSON-stable '+type+' scalar');
 if(type==='string'&&encoder.encode(value).length>MAX_STRING)invalid('Input string limit is 4096 UTF-8 bytes');return value;
}
function origin(value){string(value,4096);let url;try{url=new URL(value);}catch{invalid('Invalid application origin');}if(!['http:','https:'].includes(url.protocol)||url.origin!==value||url.username||url.password)invalid('Canonical exact application origin required');return value;}
function target(input){
 keys(input,['tabId','origin','run','document','node','selector','property','value','observedAt','build']);
 if(!Number.isSafeInteger(input.tabId)||input.tabId<=0||!Number.isFinite(input.observedAt)||input.observedAt<0)invalid('Invalid target identity/time');
 if(!['text','disabled'].includes(input.property))invalid('Unsupported selected property');
 scalar(input.value,input.property==='text'?'string':'boolean','INVALID_PLAN');
 if(input.build!==null&&(typeof input.build!=='string'||!/^[a-f0-9]{64}$/.test(input.build)))invalid('Build identity must be an explicit digest or null');
 return {tabId:input.tabId,origin:origin(input.origin),run:string(input.run),document:string(input.document),node:string(input.node),selector:string(input.selector,1024),property:input.property,value:input.value,observedAt:input.observedAt,build:input.build};
}
function pointer(value){
 string(value,1024);if(!value.startsWith('/')||value.split('/').length>33||/~(?![01])/.test(value))invalid('A bounded JSON pointer leaf is required');
 if(value.slice(1).split('/').some(part=>forbidden.has(part.replace(/~1/g,'/').replace(/~0/g,'~'))))invalid('Unsafe JSON pointer');return value;
}
function resource(input){
 keys(input,['id','kind','revision','type','value','writable','locator']);
 if(!['json-response','dom-control'].includes(input.kind)||!['boolean','number','string'].includes(input.type)||input.writable!==true)unsupported('No supported writable scalar adapter');
 if(!(Number.isSafeInteger(input.revision)&&input.revision>=0)&&!(typeof input.revision==='string'&&input.revision.length>0&&encoder.encode(input.revision).length<=512))invalid('Explicit resource revision required');
 scalar(input.value,input.type);const l=input.locator;let locator;
 if(input.kind==='json-response'){
  keys(l,['url','method','requestId','requestOrdinal','pointer']);string(l.url,4096);let url;try{url=new URL(l.url);}catch{invalid('Invalid response URL');}
  if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.hash||url.href!==l.url||l.method!=='GET'||!Number.isSafeInteger(l.requestOrdinal)||l.requestOrdinal<1)invalid('Exact observed GET occurrence required');
  locator={url:l.url,method:'GET',requestId:string(l.requestId),requestOrdinal:l.requestOrdinal,pointer:pointer(l.pointer)};
 }else{
  keys(l,['document','node','selector','control'],['options']);const type={text:'string',textarea:'string',number:'number',checkbox:'boolean',select:'string'}[l.control];
  if(type!==input.type)unsupported('Native control does not expose this scalar type');
  locator={document:string(l.document),node:string(l.node),selector:string(l.selector,1024),control:l.control};
  if(l.control==='select'){
   if(!Array.isArray(l.options)||!l.options.length||l.options.length>128||new Set(l.options).size!==l.options.length)unsupported('Select requires a bounded unique option set');
   locator.options=l.options.map(value=>string(value,1024,true));if(!l.options.includes(input.value))unsupported('Selected value is absent from observed options');
  }else if(Object.hasOwn(l,'options'))invalid('Options are only valid for select controls');
 }
 return {id:string(input.id),kind:input.kind,revision:input.revision,type:input.type,value:input.value,writable:true,locator};
}
function destination(r){return JSON.stringify(r.kind==='json-response'?[r.kind,r.locator.url,r.locator.pointer]:[r.kind,r.locator.document,r.locator.node]);}
function normalize(input){
 keys(input,['schema','id','investigationId','mode','target','changes','requiredGrants','refresh','atomic','cleanup']);
 if(input.schema!=='stateatom.experiment-plan/1'||!['live','draft'].includes(input.mode)||typeof input.id!=='string'||!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(input.id)||input.refresh!=='none'||input.atomic!==false||input.cleanup!=='adapter-specific')invalid('Invalid plan version/mode/operation metadata');
 const selected=target(input.target);
 if(!Array.isArray(input.changes)||input.changes.length<1||input.changes.length>32)invalid('Plan requires 1 to 32 resource changes');
 const ids=new Set(),destinations=new Set(),required=new Set(['read']);
 const changes=input.changes.map(change=>{
  keys(change,['resource','value']);const r=resource(change.resource),key=destination(r);if(ids.has(r.id)||destinations.has(key))invalid('Duplicate resource destination in group');ids.add(r.id);destinations.add(key);scalar(change.value,r.type);
  if(r.kind==='json-response'){if(new URL(r.locator.url).origin!==selected.origin)invalid('Response resource belongs to another origin');required.add('override');}
  else{if(r.locator.document!==selected.document)invalid('Native control belongs to another document');required.add('inject');required.add('replay');if(r.locator.control==='select'&&!r.locator.options.includes(change.value))fail('TYPE_MISMATCH','Choose an observed select option');}
  return {resource:r,value:change.value};
 });
 const requiredGrants=grants.filter(g=>required.has(g));if(JSON.stringify(input.requiredGrants)!==JSON.stringify(requiredGrants))invalid('Plan cannot choose its own operation grants');
 return {schema:'stateatom.experiment-plan/1',id:input.id,investigationId:string(input.investigationId),mode:input.mode,target:selected,changes,requiredGrants,refresh:'none',atomic:false,cleanup:'adapter-specific'};
}
export function prepareExperimentPlan(input){
 const value=data(input);keys(value,['investigationId','mode','target','changes'],['id']);
 if(!Array.isArray(value.changes))invalid('Plan changes required');
 const required=new Set(['read']);for(const c of value.changes){if(c?.resource?.kind==='json-response')required.add('override');else if(c?.resource?.kind==='dom-control'){required.add('inject');required.add('replay');}}
 return parseExperimentPlan({schema:'stateatom.experiment-plan/1',...value,id:value.id===undefined?crypto.randomUUID():value.id,requiredGrants:grants.filter(g=>required.has(g)),refresh:'none',atomic:false,cleanup:'adapter-specific'});
}
export function parseExperimentPlan(input){
 if(typeof input==='string'){if(encoder.encode(input).length>MAX_BYTES)invalid('Plan limit is 64 KiB');try{input=JSON.parse(input);}catch{invalid('Invalid plan JSON');}}
 return freeze(normalize(data(input)));
}
export function validateExperimentPlan(input,current){
 const plan=parseExperimentPlan(input),fresh=data(current);keys(fresh,['target','resources','admission']);keys(fresh.admission,['available','grants'],['reason']);
 if(fresh.admission.available!==true||!Array.isArray(fresh.admission.grants)||plan.requiredGrants.some(g=>!fresh.admission.grants.includes(g)))fail('CAPABILITY_DENIED','Runtime admission does not allow this plan');
 if(JSON.stringify(target(fresh.target))!==JSON.stringify(plan.target))fail('STALE_TARGET','Selected occurrence changed; inspect again');
 if(!Array.isArray(fresh.resources)||fresh.resources.length>128)invalid('Bounded fresh resource set required');
 const resources=new Map(),destinations=new Set();for(const item of fresh.resources){const r=resource(item),key=destination(r);if(resources.has(r.id)||destinations.has(key))invalid('Ambiguous fresh resource identity');destinations.add(key);resources.set(r.id,r);}
 for(const change of plan.changes){if(JSON.stringify(resources.get(change.resource.id))!==JSON.stringify(change.resource))fail('STALE_RESOURCE','Input resource changed; refresh before editing');}
 return plan;
}
