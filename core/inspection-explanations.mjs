// SPDX-License-Identifier: Apache-2.0
// Existing inert records -> local presentation facts. This creates no evidence.
import{parseExplanationCondition,evaluateExplanationCondition}from'./explanation-condition.mjs';
const own=(o,k)=>{try{const d=o&&Object.getOwnPropertyDescriptor(o,k);return d&&'value'in d?d.value:undefined;}catch{return undefined;}};
const at=(o,...keys)=>keys.reduce((v,k)=>own(v,k),o);
const list=(o,max=128)=>{if(!Array.isArray(o))return[];const n=own(o,'length');if(!Number.isSafeInteger(n)||n<0||n>max)return[];return Array.from({length:n},(_,i)=>own(o,String(i)));};
const text=(v,max=400)=>typeof v==='string'&&v.length<=max?v:null;
const primitive=v=>v===null||typeof v==='boolean'||typeof v==='number'&&Number.isFinite(v)||typeof v==='string'&&v.length<=256;
const hash=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v)?v:null;
const freeze=o=>{for(const v of Object.values(o))if(v&&typeof v==='object')freeze(v);return Object.freeze(o);};
const unique=a=>[...new Set(a)];
const SOURCE_LIMIT='A code link or recorded computation alone does not establish the committed DOM producer; that join is not established here.';
const ORIGIN_LIMIT='Current HTTP value origin is not established by this explanation.';
function source(n){const file=text(own(n,'file'),512),sourceDigest=hash(own(n,'sourceDigest'));if(!file||!sourceDigest)return null;const r={file,sourceDigest};for(const k of['line','column','endLine','endColumn']){const v=own(n,k);if(!Number.isSafeInteger(v)||v<1)return null;r[k]=v;}return r;}
function containsSource(container,location){const s=source(container);return !!s&&s.file===location.file&&s.sourceDigest===location.sourceDigest&&(s.line<location.line||s.line===location.line&&s.column<=location.column)&&(s.endLine>location.endLine||s.endLine===location.endLine&&s.endColumn>=location.endColumn);}
function context(state,selection,analysis){const action=own(analysis,'actionContext'),runtime=at(analysis,'stateatom','runtime'),target=own(runtime,'target');return{tab:own(state,'tabId')??own(selection,'tabId')??null,frame:text(own(state,'mainFrameId'),160),run:text(own(state,'run'),160),build:hash(at(analysis,'graph','identity','build')),page:text(own(selection,'page'),160),instance:text(own(selection,'instance'),256),observedAt:Number.isFinite(own(selection,'observedAt'))?own(selection,'observedAt'):null,property:own(selection,'property')==='disabled'?'disabled':'text',sourceGeneration:own(state,'sourceGeneration')??own(action,'sourceGeneration')??null,inspection:own(state,'inspectionGeneration')??own(action,'inspection')??null,rootId:text(own(target,'id'),160),sourceDigest:hash(own(target,'sourceDigest'))};}
function baseFacts(state,question){const selection=own(state,'selection'),analysis=own(state,'analysis'),identity=context(state,selection,analysis),value=own(selection,'value');return{schema:2,kind:'inspection-explanation',question,identity,status:'Unavailable',property:identity.property,disabled:identity.property==='disabled'&&typeof value==='boolean'?value:null,evidenceIds:[],summaries:[],limitations:[],nextAction:{id:'inspect-again',label:'Inspect again'},details:primitive(value)?[{kind:'selected-property',status:'Observed',value,expression:identity.property,evidenceIds:[]}]:[],condition:null,originEstablished:false,observedBodies:0};}
function snapshotRoot(state){
 const selection=own(state,'selection'),analysis=own(state,'analysis'),rt=at(analysis,'stateatom','runtime'),claimed=own(rt,'target'),graph=own(analysis,'graph'),run=own(state,'run');
 if(!selection||!analysis||own(state,'attached')!==true||own(state,'stale')||own(rt,'status')!=='Observed'||at(analysis,'capabilities','sourceResolver')!=='open-ide'||own(rt,'missing')===true||!text(run,160)||at(graph,'identity','run')!==run||!hash(at(graph,'identity','build'))||own(rt,'page')!==own(selection,'page'))return null;
 const nodes=list(own(rt,'nodes'),120),byId=new Map();if(!nodes.length)return null;
 for(const n of nodes){const id=text(own(n,'id'),160);if(!id||byId.has(id))return null;byId.set(id,n);}
 const root=byId.get(own(claimed,'id')),location=source(root),property=own(selection,'property');
 if(!root||own(root,'kind')!=='target'||own(root,'status')!=='Observed'||!location||own(root,'property')!==property||own(root,'page')!==own(selection,'page')||own(root,'scope')+':'+own(root,'target')!==own(selection,'instance')||own(root,'id')!==own(claimed,'id')||own(root,'sourceDigest')!==own(claimed,'sourceDigest')||!Object.is(own(root,'value'),own(claimed,'value')))return null;
 const target=at(analysis,'stateatom','target');if(!target||own(target,'tab')!==(own(selection,'tabId')??null)||own(target,'frame')!==(own(selection,'frame')??0)||own(target,'page')!==own(selection,'page')||own(target,'instance')!==own(selection,'instance')||own(target,'property')!==property||!Object.is(own(target,'value'),own(selection,'value'))||property==='disabled'&&!Object.is(own(root,'value'),own(selection,'value')))return null;
 const sources=list(own(analysis,'sources'),32);if(!sources.some(s=>containsSource(s,location)))return null;
 const closure=[],seen=new Set(),active=new Set();let bad=false;
 function walk(id){if(active.has(id)){bad=true;return;}if(seen.has(id))return;const n=byId.get(id);if(!n||own(n,'missingDependencies')===true||own(n,'page')!==own(root,'page')){bad=true;return;}seen.add(id);active.add(id);closure.push(n);const deps=own(n,'deps'),children=list(deps,80);if(!Array.isArray(deps)||children.length!==own(deps,'length'))bad=true;for(const child of children)walk(child);active.delete(id);}
 walk(own(root,'id'));if(bad)return null;
 const sourceRef=list(own(graph,'nodes'),512).find(n=>containsSource(n,location)&&/^source:\d+$/.test(own(n,'id')||''));
 return{root,closure,rt,location,sourceRef:text(own(sourceRef,'id'),160)};
}
function position(expression,offset,anchor){const before=expression.slice(0,offset),lines=before.split('\n');return{line:own(anchor,'line')+lines.length-1,column:lines.length===1?own(anchor,'column')+offset:lines.at(-1).length+1};}
function conditionReadRecords(model,expression,anchor,root,closure,location){
 const records=new Map(),byId=new Map(closure.map(n=>[own(n,'id'),n]));
 function locate(n,parent){
  if(n.kind==='group'){locate(n.child,parent);return;}if(n.kind==='literal')return;
  const start=position(expression,n.start,anchor),end=position(expression,n.end,anchor),kinds=n.kind==='input'?['read','member','destructure']:n.kind==='not'?['unary']:['logical'];
  // Follow the particular structural operand, not arbitrary transitive value
  // history. A previous same-span read behind another operand is not this read.
  const matches=list(own(parent,'deps'),80).map(id=>byId.get(id)).filter(r=>r&&kinds.includes(own(r,'kind'))&&own(r,'status')==='Observed'&&own(r,'file')===location.file&&own(r,'sourceDigest')===location.sourceDigest&&own(r,'expression')===expression.slice(n.start,n.end)&&own(r,'line')===start.line&&own(r,'column')===start.column&&own(r,'endLine')===end.line&&own(r,'endColumn')===end.column&&(own(r,'scope')===undefined||own(r,'scope')===own(root,'scope'))),record=matches.length===1?matches[0]:null;
  if(n.kind==='input')records.set(n.start+':'+n.end,record);else if(n.child)locate(n.child,record);else{locate(n.left,record);locate(n.right,record);}
 }
 locate(model,root);return records;
}
function propertyFacts(state,facts){
 const admitted=snapshotRoot(state);if(!admitted){facts.summaries=['The selected value is a DOM snapshot; its condition inputs are unavailable.'];facts.limitations=[SOURCE_LIMIT,ORIGIN_LIMIT];facts.nextAction=at(state,'analysis','capabilities','sourceResolver')==='open-ide'?{id:'inspect-again',label:'Inspect again'}:{id:'connect-project',label:'Connect project for source'};return;}
 const{root,closure,location,sourceRef}=admitted,expression=text(own(root,'expression')),value=own(root,'value');facts.status='Supported';facts.evidenceIds=[own(root,'id'),...(sourceRef?[sourceRef]:[])];facts.limitations=[SOURCE_LIMIT,ORIGIN_LIMIT,'Source labels are identifiers, not verified business meaning.'];facts.nextAction={id:'view-evidence',label:'View supporting evidence'};
 facts.details.push({kind:'recorded-computation',status:'Observed',expression,value:primitive(value)?value:null,source:location,evidenceIds:[own(root,'id')]});
 const model=expression?.length<400?parseExplanationCondition(expression):null,direct=new Set(list(own(root,'deps'),80)),anchors=closure.filter(n=>direct.has(own(n,'id'))&&own(n,'expression')===expression&&own(n,'file')===location.file&&own(n,'sourceDigest')===location.sourceDigest),anchor=anchors.length===1?anchors[0]:root,inputs=[];
 if(model){
  const nodes=[];function leaves(n){if(n.kind==='input')nodes.push(n);else if(n.child)leaves(n.child);else if(n.left){leaves(n.left);leaves(n.right);}}leaves(model);
  const readRecords=conditionReadRecords(model,expression,anchor,root,closure,location);
  for(const n of nodes){const record=readRecords.get(n.start+':'+n.end),v=own(record,'value');
   if(record&&typeof v==='boolean'){inputs.push({start:n.start,end:n.end,value:v,status:'Observed'});facts.evidenceIds.push(own(record,'id'));}
   facts.details.push({kind:'condition-input',expression:n.label,status:record&&typeof v==='boolean'?'Observed':'Unavailable',...(record&&primitive(v)?{value:v}:{}),source:record?source(record):null,evidenceIds:record?[own(record,'id')]:[]});
  }
  const condition=evaluateExplanationCondition(model,inputs);
  // A disagreeing computed model is not repaired by the recorded target result.
  facts.condition=condition.value!==null&&typeof value==='boolean'&&condition.value!==value?null:condition;
  for(const n of condition.inputs.filter(n=>n.status==='Code-linked'))facts.details.push({kind:'condition-input',expression:expression.slice(n.start,n.end),status:'Code-linked',value:n.value,source:location,evidenceIds:sourceRef?[sourceRef]:[own(root,'id')]});
 }
 facts.evidenceIds=unique(facts.evidenceIds);
 const c=facts.condition;
 if(typeof value==='boolean'&&c?.masking&&c.knownTrueTerms>1)facts.summaries=['In the copied condition, two terms independently keep the result true. Changing only one would be insufficient; this is a hypothetical logical result.'];
 else if(typeof value==='boolean'&&c)facts.summaries=['The recorded condition returned '+value+'. '+(c.unknownInputs?'A skipped or unsupported input remains unavailable.':c.knownTrueTerms===1?'One known term is sufficient in this copied boolean model.':'The copied boolean inputs and source are available below.')];
 else facts.summaries=['A source-linked computation was recorded for this selection. Its detailed condition or its connection to the displayed value is not established.'];
 if(c?.masking)facts.limitations.push('Hypothetical logical consequences are not verified interventions.');
}
function currentActionContext(state){
 const a=own(state,'analysis'),s=own(state,'selection'),c=own(a,'actionContext'),native=own(s,'domIdentity');
 if(!c||own(state,'attached')!==true||own(c,'schema')!==1||own(c,'run')!==own(state,'run')||own(c,'run')!==at(a,'graph','identity','run')||own(c,'build')!==at(a,'graph','identity','build')||!hash(own(c,'build'))||own(c,'tabId')!==(own(state,'tabId')??own(s,'tabId'))||own(c,'frameId')!==own(state,'mainFrameId')||own(c,'document')!==own(native,'document')||own(c,'instance')!==own(native,'node')||own(c,'observedAt')!==own(s,'observedAt'))return null;
 for(const [field,key]of [['inspection','inspectionGeneration'],['sourceGeneration','sourceGeneration']])if(!Number.isSafeInteger(own(c,field))||own(c,field)<0||own(state,key)!==undefined&&own(c,field)!==own(state,key))return null;
 return c;
}
function sameActionContext(binding,context){const id=own(binding,'identity');return !!context&&!!id&&['schema','tabId','frameId','run','inspection','sourceGeneration','document','instance','build','observedAt'].every(k=>own(id,k)===own(context,k));}
function actionFacts(state,facts){
 const analysis=own(state,'analysis'),context=currentActionContext(state),bindings=list(own(analysis,'actionBindings'),24).filter(b=>own(b,'freshness')!=='Stale'&&sameActionContext(b,context)),knownEvents=new Set(['click','change','submit','keydown','keyup','blur','focus','input','pointerdown','pointerup']),binding=bindings.find(b=>['react-jsx','vue-template'].includes(own(b,'mechanism')))||bindings.find(b=>own(b,'mechanism')==='dom-listener'&&own(b,'registeredOn')==='selected-element'&&own(b,'status')==='Observed'),event=knownEvents.has(own(binding,'event'))?own(binding,'event'):'interaction';
 facts.status=binding?'Supported':'Unavailable';facts.summaries=[binding?(own(binding,'mechanism')==='dom-listener'?'A '+event+' listener is registered on this element.':'Source declares a '+event+' binding for this element.')+' This does not prove invocation.':'No supported action binding is available for this selection.'];facts.limitations=['A source binding or native registration does not prove invocation.','Callback-object identity and action consequences are not established.'];facts.nextAction={id:'view-evidence',label:'View action evidence'};
 const valid=new Set(list(at(analysis,'graph','edges'),512).map(e=>text(own(e,'id'),160)).filter(Boolean));
 if(binding){for(const part of['binding','entry'])for(const id of list(at(binding,part,'evidenceIds'),24))if(valid.has(id))facts.evidenceIds.push(id);const entry=own(binding,'entry'),loc=source(own(entry,'source'));facts.details.push({kind:'action-source',status:own(entry,'status')==='Code-linked'?'Code-linked':'Unknown/Unsupported',expression:text(own(entry,'symbol'),256),source:loc,evidenceIds:unique(facts.evidenceIds)});}
 facts.evidenceIds=unique(facts.evidenceIds);
}
export function inspectionExplanationFacts(state={}, {question='property',historical=false}={}){
 question=question==='action'?'action':'property';const facts=baseFacts(state,question),c=at(state,'analysis','actionContext'),sourceChanged=at(state,'analysis','actionsInvalidated')===true||c&&[['sourceGeneration','sourceGeneration'],['inspection','inspectionGeneration']].some(([k,s])=>own(state,s)!==undefined&&own(c,k)!==own(state,s)),stale=sourceChanged||!!own(state,'stale')||at(state,'analysis','stateatom','runtime','status')==='Stale'&&question==='property'||question==='action'&&list(at(state,'analysis','actionBindings'),24).some(b=>own(b,'freshness')==='Stale');
 if(historical){facts.status='Historical';for(const detail of facts.details)detail.status='Historical';facts.summaries=['This saved diagnostic is historical; current condition links are unavailable.'];facts.limitations=['Imported claims are not reverified.','Saved diagnostics omit exact computation dependency and occurrence links; no reconstruction is attempted.'];facts.nextAction={id:'view-evidence',label:'Review recorded evidence'};return freeze(facts);}
 if(stale){facts.status='Stale';for(const detail of facts.details)detail.status='Stale';facts.summaries=['The previous inspection is stale. Inspect again for a current explanation.'];facts.limitations=['No previous values are treated as current inputs.'];return freeze(facts);}
 if(question==='action')actionFacts(state,facts);else propertyFacts(state,facts);return freeze(facts);
}
export function diagnosticExplanationFacts(record){return inspectionExplanationFacts({selection:own(record,'target')},{historical:true});}
export function explanationIdentity(facts){return JSON.stringify({identity:facts.identity,status:facts.status,question:facts.question,evidenceIds:facts.evidenceIds,condition:facts.condition,details:facts.details,summaries:facts.summaries,limitations:facts.limitations});}
