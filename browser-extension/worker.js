import {createAtomRuntime} from '@stateport/atom/runtime';
import {createChromePlatform,createEventHub,createDebuggerBroker,migrateStandaloneDiagnostics} from '@stateport/atom/platform';
import {createAtomDispatcher,isInspectionOrigin} from '@stateport/atom/transport';
const events=createEventHub(),broker=createDebuggerBroker(chrome.debugger);
const platform=createChromePlatform(chrome,{events,broker,readOnlySites:true});platform.ready=Promise.all([platform.ready,migrateStandaloneDiagnostics(chrome.storage.local)]);
const runtime=createAtomRuntime(platform,{readOnlySites:true});
// Register synchronously; runtime queues events behind its own storage readiness.
chrome.debugger.onEvent.addListener((source,method,params)=>events.emit({type:'debugger',source,method,params}));
chrome.debugger.onDetach.addListener((source,reason)=>events.emit({type:'detach',source,reason}));
chrome.permissions.onRemoved.addListener(()=>events.emit({type:'permissions-removed'}));
chrome.tabs.onUpdated.addListener((tabId,change)=>{if(change.url)events.emit({type:'navigation',tabId,url:change.url});});
chrome.tabs.onRemoved.addListener(tabId=>events.emit({type:'removed',tabId}));
chrome.action.onClicked.addListener(tab=>chrome.tabs.create({url:chrome.runtime.getURL('panel.html'),...(Number.isSafeInteger(tab?.id)&&tab.id>0?{openerTabId:tab.id}:{})}));
chrome.runtime.onMessage.addListener(createAtomDispatcher(runtime,{
 isTrusted:s=>s.id===chrome.runtime.id&&s.url===chrome.runtime.getURL('panel.html'),
 isSelectionSender:s=>s.id===chrome.runtime.id&&s.frameId===0&&!!s.tab&&(isInspectionOrigin(s.url,true)||platform.approvedSite(s.url))&&new URL(s.url).origin===new URL(s.tab.url).origin
}));
