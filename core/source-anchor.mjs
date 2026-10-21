// SPDX-License-Identifier: Apache-2.0
// Internal pure anchor contract. Construction provenance is not runtime attestation.
import {MAP_LIMITS} from './source-maps.mjs';
const local=new WeakMap(),hex=/^[a-f\d]{64}$/i;
const own=(o,k)=>{if(o===null||!['object','function'].includes(typeof o))return undefined;const d=Object.getOwnPropertyDescriptor(o,k);return d&&Object.hasOwn(d,'value')?d.value:undefined;};
const text=(x,max=160)=>typeof x==='string'&&x.length>0&&x.length<=max&&!/[\u0000-\u001f]/.test(x);
const integer=(x,min=0)=>Number.isSafeInteger(x)&&x>=min;
const freeze=x=>{for(const v of Object.values(x))if(v&&typeof v==='object')freeze(v);return Object.freeze(x);};
const gap=(reason,status='Unknown/Unsupported')=>freeze({schema:'stateatom.generated-anchor/1',status,relation:'selected-native-listener-generated-location',reason,generated:null,execution:'not-observed',callbackIdentity:'Unknown/Unsupported',propertyProducer:'Unknown/Unsupported',httpOrigin:'Unknown/Unsupported'});
function normalize(input){
 const context=own(input,'context'),binding=own(input,'binding'),maps=own(input,'maps');
 if(own(binding,'freshness')==='Stale'||own(maps,'status')==='Stale')return gap('Selected registration or source session is stale','Stale');
 if(own(binding,'status')!=='Observed'||own(binding,'mechanism')!=='dom-listener'||own(binding,'registeredOn')!=='selected-element'||own(binding,'freshness')!=='snapshot')return gap('No current native listener registered on the selected element');
 const identity={},keys=['schema','tabId','frameId','run','inspection','sourceGeneration','document','instance','build','observedAt'];for(const key of keys)identity[key]=own(context,key);
 if(identity.schema!==1||!integer(identity.tabId,1)||!text(identity.frameId,128)||!text(identity.run)||!integer(identity.inspection,1)||!integer(identity.sourceGeneration)||typeof identity.document!=='string'||!/^cdp:[1-9]\d*$/.test(identity.document)||typeof identity.instance!=='string'||!/^cdp:[1-9]\d*$/.test(identity.instance)||typeof identity.build!=='string'||!hex.test(identity.build)||!integer(identity.observedAt,1))return gap('Selected action context is incomplete');
 const bindingIdentity=own(binding,'identity');if(keys.some(k=>own(bindingIdentity,k)!==identity[k]))return gap('Selected action occurrence/context changed','Stale');
 if(own(maps,'status')!=='Connected'||own(maps,'epoch')!==identity.run)return gap('Source session does not match this inspection epoch');
 const id=own(binding,'id'),event=own(binding,'event'),registration=own(binding,'registration');
 if(typeof id!=='string'||!/^native:(?:[0-9]|1[01])$/.test(id)||!text(event,40)||own(registration,'positionBase')!=='one-based')return gap('Native registration coordinate contract is unavailable');
 if(own(registration,'selectedDocument')!==identity.document||own(registration,'selectedNode')!==identity.instance||own(registration,'registeredNode')!==identity.instance)return gap('Native selected backend identity does not match this occurrence','Stale');
 const scriptId=own(registration,'scriptId'),line=own(registration,'line'),column1=own(registration,'column'),snapshotId=own(registration,'snapshotId'),readAt=own(registration,'readAt');
 if(!text(scriptId,80)||['undefined','null'].includes(scriptId)||!integer(line,1)||line>MAP_LIMITS.lines||!integer(column1,1)||column1-1>MAP_LIMITS.bytes||!text(snapshotId)||!integer(readAt,identity.observedAt))return gap('Native generated position or read identity is unavailable');
 const scripts=own(maps,'scripts'),length=own(scripts,'length');if(!Array.isArray(scripts)||!integer(length)||length>128)return gap('Loaded script inventory budget or identity is unavailable');
 const matches=[];for(let i=0;i<length;i++){const r=own(scripts,String(i));if(own(r,'scriptId')===scriptId)matches.push(r);}if(matches.length!==1)return gap('No unique loaded script for this native listener');
 const r=matches[0],frameId=own(r,'frameId'),executionContextId=own(r,'executionContextId'),cdpHash=own(r,'cdpHash'),cdpHashDomain=own(r,'cdpHashDomain'),endLine=own(r,'endLine'),endColumn=own(r,'endColumn');
 if(frameId!==identity.frameId||!integer(executionContextId,1)||typeof cdpHash!=='string'||!hex.test(cdpHash)||cdpHashDomain!=='v8-script-content-sha256')return gap('Handler script frame/context/native content identity is unavailable');
 if(own(r,'special')!==false||own(r,'startLine')!==0||own(r,'startColumn')!==0)return gap('Inline/sourceURL/offset scripts have no supported native anchor contract');
 if(!integer(endLine)||!integer(endColumn)||line-1>endLine||line-1===endLine&&column1-1>endColumn)return gap('Native handler coordinates exceed the known loaded script range');
 const digest=own(r,'digest'),digestDomain=own(r,'digestDomain');if(digest!==undefined&&digest!==null&&(typeof digest!=='string'||!hex.test(digest)||digestDomain!=='utf8-script-source'))return gap('Loaded UTF-8 script digest domain is unavailable');
 const map=own(r,'map'),mapStatus=own(map,'status'),mapDigest=own(map,'mapDigest'),method=own(map,'verificationMethod');
 const artifact={status:map?['Exact artifact match','Unverified','Mismatch','Stale','Unavailable'].includes(mapStatus)?mapStatus:'Unknown/Unsupported':'Unavailable',mapDigest:typeof mapDigest==='string'&&hex.test(mapDigest)?mapDigest:null,verificationMethod:text(method)?method:null};
 return freeze({schema:'stateatom.generated-anchor/1',status:'Observed',relation:'selected-native-listener-generated-location',identity,generated:{scriptId,line,column:column1-1,lineBase:1,columnBase:0},script:{scriptId,frameId,executionContextId,cdpHash,cdpHashDomain,utf8Digest:typeof digest==='string'?digest:null,utf8DigestDomain:typeof digest==='string'?digestDomain:null},artifact,acquisition:{method:'CDP DOMDebugger.getEventListeners',bindingId:id,event,snapshotId,readAt,evidenceIds:[id+':registration']},scope:'Registered listener generated location only; no invocation or property producer proof',execution:'not-observed',callbackIdentity:'Unknown/Unsupported',propertyProducer:'Unknown/Unsupported',httpOrigin:'Unknown/Unsupported'});
}
export function createNativeSourceAnchor(input){
 let result;try{result=normalize(input);}catch{return gap('Native source-anchor metadata is unavailable');}
 if(result.status==='Observed')local.set(result,JSON.stringify(result));return result;
}
export function isCurrentGeneratedAnchor(anchor,input){
 const fingerprint=local.get(anchor);if(!fingerprint)return false;
 try{const current=normalize(input);return current.status==='Observed'&&JSON.stringify(current)===fingerprint;}catch{return false;}
}
