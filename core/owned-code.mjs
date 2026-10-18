// SPDX-License-Identifier: Apache-2.0
// Extension-private source declarations, made before the owned operation. These
// bind code bodies/context/roles only; they are not invocation or effect proofs.
import {journalGap} from './code-journal.mjs';
import {fetchScriptBody} from './fetch-bindings.mjs';
export const ownedCodeRoles=Object.freeze(['selection-helper','deep-helper','fetch-policy-helper']);
export async function declareOwnedCode(j,role,source,contextUniqueId){
 if(!ownedCodeRoles.includes(role)||typeof source!=='string'||source.length>32768||!Object.values(j.contexts).some(c=>c.uniqueId===contextUniqueId&&c.isDefault===true)){
  journalGap(j,'owned-code-unavailable');return false;
 }
 const bytes=new TextEncoder().encode(source);if(bytes.length>32768){journalGap(j,'owned-code-unavailable');return false;}
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join(''),key=digest+':'+contextUniqueId;
 j.ownedCode??=Object.create(null);if(j.ownedCode[key])return true;
 if(Object.keys(j.ownedCode).length>=256){journalGap(j,'owned-code-budget');return false;}
 j.generation++;j.ownedCode[key]={digest,contextUniqueId,role,generation:j.generation};return true;
}
// Chromium scripting's finite canonical IIFE form. Actual CDP bytes must agree;
// changed browser serialization remains unknown rather than fuzzy-matched.
export function ownedInjectionSource(func,args){return '('+Function.prototype.toString.call(func)+')('+args.map(v=>JSON.stringify(v)).join(',')+')';}
// Native captured template matching, not a page's URL/marker assertion. Complete
// profile eligibility still checks the entire graph, aliases and exact exchange.
export async function bindOwnedFetchCode(j,bindings,{page,run,mainFrameId}={}){
 if(j.run!==run||!bindings||bindings.epoch!==run||bindings.overflow||typeof page!=='string')return;
 for(const[id,script]of Object.entries(bindings.scripts)){
  const c=bindings.contexts[script.contextId],r=j.scripts[id],prefix='stateatom-fetch://'+page+'/';
  if(!script.url.startsWith(prefix)||!/^[1-9][0-9]{0,2}$/.test(script.url.slice(prefix.length))||script.source!==fetchScriptBody(script.url)||!r||r.sourceStatus!=='Hashed'||r.contextUniqueId!==c?.uniqueId||c?.isDefault!==true||c.frameId!==mainFrameId||r.frameId!==mainFrameId)continue;
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(script.source))),x=>x.toString(16).padStart(2,'0')).join('');if(r.digest!==digest)continue;
  if(r.ownedRole!=='fetch-passthrough'){r.ownedRole='fetch-passthrough';j.generation++;}
 }
}
