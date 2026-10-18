// SPDX-License-Identifier: Apache-2.0
// Finite consistency gate for serialized premises. NOT an acquisition authority:
// callers must establish the reviewed source contracts and browser/runtime facts.
// A successful synthetic/caller-supplied set never establishes a full trace here.
const contracts=Object.freeze(['query-fresh-client','query-direct-first-data','query-no-sharing-callback','query-no-notification-callback','query-no-retained-alias-operation','react-direct-state','react-no-foreign-exposure','app-first-read-region']);
const id=value=>typeof value==='string'&&value.length>0&&value.length<=256;
const seq=value=>Number.isSafeInteger(value)&&value>=0;
const scalar=value=>value===null||typeof value==='boolean'||typeof value==='number'&&Number.isFinite(value)||typeof value==='string'&&value.length<=256;
export function checkFirstReadPremises(input){
 const unknown=reason=>({status:'Unknown/Unsupported',reason,fullPath:false,authority:'No acquired source/effect/runtime authority supplied by this consistency gate'});
 try{
  if(!input||typeof input!=='object')return unknown('Premise record missing');
  const{profile,code,parse,handoff,read,commit,exchange,effects}=input;
  if(profile?.id!=='react18-query5-first-data-render/1'||profile.sourceProof!=='Code-linked'||!/^[a-f0-9]{64}$/.test(profile.proofDigest)||!Array.isArray(profile.contracts)||profile.contracts.length!==contracts.length||new Set(profile.contracts).size!==contracts.length||!contracts.every(c=>profile.contracts.includes(c)))return unknown('Reviewed source/effect contract derivation missing or incompatible');
  if(!code||!['closedCompilerInputs','sourceEquivalent','armedBeforeNavigation','drained','historyComplete'].every(k=>code[k]===true)||code.pending!==0||code.unknownScripts!==0||code.unknownContexts!==0)return unknown('Closed final-code or complete drained history premise unavailable');
  if(![code.run,code.page,code.frame,code.sequenceDomain].every(id))return unknown('Code context/sequence identity unavailable');
  if(![parse,handoff,read,commit,exchange].every(r=>r&&r.run===code.run&&r.page===code.page&&r.frame===code.frame))return unknown('Mixed run/page/frame premises');
  if(![parse,handoff,read].every(r=>r.sequenceDomain===code.sequenceDomain))return unknown('Mixed interval sequence domains');
  if(![parse.id,parse.rootId,parse.exchangeId,read.id,read.receiverId,read.renderId,handoff?.updateId,handoff?.queueId,commit.id,commit.targetId,exchange.requestId].every(id))return unknown('Required occurrence identity missing');
  if(read.parseId!==parse.id||handoff.parseId!==parse.id||read.rootId!==parse.rootId||handoff.rootId!==parse.rootId||read.updateId!==handoff.updateId||handoff.firstDirectObjectAction!==true)return unknown('Read and direct native state action do not join this parsed object');
  if(!['member','destructure'].includes(read.kind)||read.firstSuccessfulDataRender!==true||typeof read.pointer!=='string'||read.pointer[0]!=='/'||read.pointer.length>512||!scalar(read.value)||!seq(parse.sequence)||!seq(handoff.sequence)||!seq(read.sequence)||parse.sequence>=handoff.sequence||handoff.sequence>=read.sequence)return unknown('Original first-render scalar read/interval unavailable');
  if(commit.status!=='Observed'||commit.producer!=='Observed'||commit.renderId!==read.renderId||!Array.isArray(commit.dependencyReadIds)||commit.dependencyReadIds.length>120||!commit.dependencyReadIds.includes(read.id))return unknown('Specific original read is not a dependency of this committed target');
  if(exchange.status!=='Observed'||exchange.id!==parse.exchangeId)return unknown('Parsed consumption is not joined to this exact observed browser exchange');
  if(!Array.isArray(effects)||effects.length>4096)return unknown('Effect interval budget or record unavailable');
  for(const effect of effects){
   if(!effect||!seq(effect.sequence))return unknown('Effect order unavailable');
   if(effect.sequenceDomain!==code.sequenceDomain||effect.run!==code.run||effect.page!==code.page||effect.frame!==code.frame)return unknown('Effect interval context/sequence domain unavailable');
   if(effect.sequence<parse.sequence||effect.sequence>read.sequence)continue;
   if(effect.kind!=='potential-write')return unknown('Unknown effect during parse-to-specific-read interval');
   if(!id(effect.receiverId)||effect.receiverId===read.receiverId||effect.receiverId===parse.rootId)return unknown('Competing potential write during parse-to-specific-read interval');
  }
  return{status:'Conditional premise set',profileId:profile.id,proofDigest:profile.proofDigest,readId:read.id,readKind:read.kind,readValue:read.value,pointer:read.pointer,parseId:parse.id,exchangeId:exchange.id,requestId:exchange.requestId,updateId:handoff.updateId,renderId:read.renderId,targetId:commit.targetId,commitId:commit.id,run:code.run,page:code.page,frame:code.frame,fullPath:false,authority:'Consistency only; source/effect derivation and actual acquisitions must be verified by the product before any trace claim'};
 }catch{return unknown('Malformed serialized premise set');}
}
