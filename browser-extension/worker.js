import {createAtomRuntime} from '@stateport/atom/runtime';
import {createChromePlatform,createEventHub,createDebuggerBroker,migrateStandaloneDiagnostics} from '@stateport/atom/platform';
import {createAtomDispatcher} from '@stateport/atom/transport';
const events=createEventHub(),broker=createDebuggerBroker(chrome.debugger);
const platform=createChromePlatform(chrome,{events,broker});platform.ready=migrateStandaloneDiagnostics(chrome.storage.local);
const runtime=createAtomRuntime(platform);
// Register synchronously; runtime queues events behind its own storage readiness.
chrome.debugger.onEvent.addListener((source,method,params)=>events.emit({type:'debugger',source,method,params}));
chrome.debugger.onDetach.addListener((source,reason)=>events.emit({type:'detach',source,reason}));
chrome.tabs.onRemoved.addListener(tabId=>events.emit({type:'removed',tabId}));
chrome.action.onClicked.addListener(()=>chrome.tabs.create({url:chrome.runtime.getURL('panel.html')}));
chrome.runtime.onMessage.addListener(createAtomDispatcher(runtime,{
 isTrusted:s=>s.id===chrome.runtime.id&&s.url===chrome.runtime.getURL('panel.html'),
 isSelectionSender:s=>s.id===chrome.runtime.id&&s.frameId===0&&!!s.tab&&/^http:\/\/127\.0\.0\.1:(4173|4174|4175)\//.test(s.url||'')&&new URL(s.url).origin===new URL(s.tab.url).origin
}));
