import {createAtomRuntime} from '@stateport/atom/runtime';
import {createChromePlatform,createEventHub,createGuardianBroker,createNativeControlOwner} from '@stateport/atom/platform';
import {createAtomDispatcher,isInspectionOrigin} from '@stateport/atom/transport';
const events=createEventHub(),broker=createGuardianBroker(chrome),controlOwner=createNativeControlOwner(chrome);
const platform=createChromePlatform(chrome,{events,broker,controlOwner});
const runtime=createAtomRuntime(platform);
let reservation;
// Synthetic competing consumer only; no Capture implementation.
chrome.runtime.onMessage.addListener((m,s,reply)=>{
 if(s.id!==chrome.runtime.id||s.url!==chrome.runtime.getURL('workspace/inspect.html')||!m.hostControl)return false;
 void (async()=>{try{if(m.hostControl==='reserve'){reservation=await broker.acquire({tabId:m.tabId,owner:'example-other-consumer',capabilities:['read']});await reservation.attach();}else if(m.hostControl==='release'){await reservation?.release();reservation=null;}else if(m.hostControl==='shutdown')await runtime.shutdown();else throw Error('Unknown host control');reply({ok:true});}catch(e){reply({ok:false,code:e.code,error:e.message});}})();return true;
});
// Register synchronously; runtime queues events behind its own storage readiness.
chrome.debugger.onEvent.addListener((source,method,params)=>events.emit({type:'debugger',source,method,params}));
chrome.debugger.onDetach.addListener((source,reason)=>events.emit({type:'detach',source,reason}));
chrome.permissions.onRemoved.addListener(()=>events.emit({type:'permissions-removed'}));
chrome.tabs.onUpdated.addListener((tabId,change)=>{if(change.url)events.emit({type:'navigation',tabId,url:change.url});});
chrome.tabs.onRemoved.addListener(tabId=>events.emit({type:'removed',tabId}));
chrome.action.onClicked.addListener(tab=>chrome.tabs.create({url:chrome.runtime.getURL('workspace/inspect.html'),...(Number.isSafeInteger(tab?.id)&&tab.id>0?{openerTabId:tab.id}:{})}));
chrome.runtime.onMessage.addListener(createAtomDispatcher(runtime,{
 isTrusted:s=>s.id===chrome.runtime.id&&s.url===chrome.runtime.getURL('workspace/inspect.html'),
 isSelectionSender:s=>s.id===chrome.runtime.id&&s.frameId===0&&!!s.tab&&(isInspectionOrigin(s.url)||platform.approvedSite(s.url))&&new URL(s.url).origin===new URL(s.tab.url).origin
}));
