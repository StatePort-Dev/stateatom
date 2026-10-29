// SPDX-License-Identifier: Apache-2.0
// Pure bounded consistency bookkeeping. This module cannot issue a browser
// witness and does not establish the authenticity of caller-supplied facts.
const MAX_TARGETS=128,MAX_EVENTS=4096;
const text=(v,max=256)=>typeof v==='string'&&v.length>0&&v.length<=max&&!/[\x00-\x1f\x7f]/.test(v);
const APP_URLS=new Set(['about:blank','http://127.0.0.1:4173/__stateatom/first-read-start','http://127.0.0.1:4173/react/']);
// The finite reviewed list uses HashRouter for these three filters. No other
// same-document navigation acquires authority merely by retaining its origin.
const LIST_URLS=new Set(['about:blank','http://127.0.0.1:4173/__stateatom/list-start',
 'http://127.0.0.1:4173/list/','http://127.0.0.1:4173/list/#/',
 'http://127.0.0.1:4173/list/#/active','http://127.0.0.1:4173/list/#/completed']);
// Exact native browser UI documents from the retained Chromium diagnostic.
const UI_URLS=new Set(['chrome://webui-toolbar.top-chrome/','chrome://omnibox-popup.top-chrome/','chrome://omnibox-popup.top-chrome/omnibox_popup_aim.html']);

export function createTargetHistory({appId,panelId,workerId,panelURL,workerURL,initial,guardian=null,profile='first-read'}){
 const appURLs=profile==='first-read'?APP_URLS:profile==='selected-list'?LIST_URLS:null;
 if(!appURLs)throw Error('Target profile denied');
 if(guardian&&(![guardian.documentId,guardian.workerId].every(id=>text(id))||new Set([appId,panelId,workerId,guardian.documentId,guardian.workerId]).size!==5||guardian.documentURL!==panelURL.replace('panel.html','atom-guardian.html')||guardian.workerURL!==panelURL.replace('panel.html','atom-guardian-worker.js')||guardian.workerTargetURL!==undefined&&![guardian.workerURL,''].includes(guardian.workerTargetURL)))throw Error('Guardian target identity denied');
 const records=new Map(),seen=new Set(),retiredUI=new Set();let denied=false,closed=false,events=0,lastInventoryCount=null;
 const deny=()=>{denied=true;return false;};
 if(![appId,panelId,workerId].every(id=>text(id))||new Set([appId,panelId,workerId]).size!==3||!/^chrome-extension:\/\/[a-p]{32}\/panel\.html$/.test(panelURL)||workerURL!==panelURL.replace(/panel\.html$/,'worker.js'))throw Error('Target history identity denied');
 function record(info){
  if(!info||!text(info.targetId)||!text(info.type,40)||!(text(info.url,512)||guardian&&info.targetId===guardian.workerId&&guardian.workerTargetURL===''&&info.url==='')||typeof info.title!=='string'||info.title.length>4096||typeof info.attached!=='boolean'||typeof info.canAccessOpener!=='boolean'||info.subtype!==undefined||info.embedderData!==undefined)return null;
  for(const key of ['openerId','openerFrameId','browserContextId'])if(info[key]!==undefined&&!text(info[key]))return null;
  const guardianWorker=guardian&&info.targetId===guardian.workerId;
  if(guardianWorker?(info.parentId!==undefined&&info.parentId!==guardian.documentId||info.parentFrameId!==(guardian.documentFrameId??guardian.documentId)):(info.parentId!==undefined||info.parentFrameId!==undefined))return null;
  let role;
  if(info.targetId===appId){if(info.type!=='page'||!appURLs.has(info.url)||info.openerId!==undefined||info.openerFrameId!==undefined||info.canAccessOpener)return null;role='app';}
  else if(info.targetId===panelId){if(info.type!=='page'||info.url!==panelURL)return null;role='panel';}
  else if(info.targetId===workerId){if(info.type!=='service_worker'||info.url!==workerURL)return null;role='worker';}
  else if(guardian&&info.targetId===guardian.documentId){if(info.type!=='background_page'||info.url!==guardian.documentURL||info.openerId||info.openerFrameId||info.canAccessOpener)return null;role='guardian-document';}
  else if(guardianWorker){if(info.type!=='worker'||info.url!==(guardian.workerTargetURL??guardian.workerURL)||info.openerId||info.openerFrameId||info.canAccessOpener)return null;role='guardian-worker';}
  else {if(info.type!=='browser_ui'||!UI_URLS.has(info.url))return null;role='ui';}
  // Titles and debugger attachment are mutable presentation/connection facts.
  // Only bounded producer identity/relationship metadata is retained.
  return {role,url:info.url,relation:JSON.stringify([info.openerId??null,info.openerFrameId??null,info.browserContextId??null,info.canAccessOpener,guardianWorker?guardian.documentId:info.parentId??null,info.parentFrameId??null])};
 }
 if(!Array.isArray(initial)||initial.length>MAX_TARGETS)throw Error('Target inventory denied');
 for(const info of initial){const entry=record(info);if(!entry||records.has(info.targetId))throw Error('Target inventory denied');records.set(info.targetId,entry);}
 if(![appId,panelId,workerId,...(guardian?[guardian.documentId,guardian.workerId]:[])].every(id=>records.has(id)))throw Error('Target inventory incomplete');
 return Object.freeze({
  observe(kind,info){
   if(denied||closed)return false;
   if(events>=MAX_EVENTS)return deny();events++;
   if(kind==='destroyed'&&records.get(info?.targetId)?.role==='ui'){records.delete(info.targetId);seen.delete(info.targetId);retiredUI.add(info.targetId);return true;}
   if(kind!=='created'&&kind!=='changed'||retiredUI.has(info?.targetId))return deny();
   const next=record(info);if(!next)return deny();
   const old=records.get(info.targetId);
   if(kind==='changed'&&!seen.has(info.targetId))return deny();
   if(!old){if(kind!=='created'||next.role!=='ui'||records.size>=MAX_TARGETS)return deny();records.set(info.targetId,next);}
   else{
    if(old.role!==next.role||old.relation!==next.relation||(old.role!=='app'||kind==='created')&&old.url!==next.url)return deny();
    records.set(info.targetId,next);
   }
   seen.add(info.targetId);return true;
  },
  diagnostic(){return{denied,closed,events,known:records.size,seen:seen.size,lastInventoryCount,unseen:[...records.keys()].filter(id=>!seen.has(id)),roles:[...records].map(([id,r])=>({id,role:r.role}))};},
  consistent(inventory){
   lastInventoryCount=Array.isArray(inventory)?inventory.length:null;
   if(denied||closed)return false;
   if(!Array.isArray(inventory)||inventory.length>MAX_TARGETS||inventory.length!==records.size)return deny();
   const ids=new Set();
   for(const info of inventory){
    const next=record(info),old=records.get(info?.targetId);
    if(!next||!old||ids.has(info.targetId)||next.role!==old.role||next.url!==old.url||next.relation!==old.relation)return deny();
    ids.add(info.targetId);
   }
   return seen.size===records.size;
  },
  close(){closed=true;records.clear();seen.clear();retiredUI.clear();}
 });
}
