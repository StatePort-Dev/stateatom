import {mountAtom} from '@stateport/atom/ui';
import {createAtomClient,chromeTransport} from '@stateport/atom/transport';
const client=createAtomClient(chromeTransport(chrome,{inspectorOwnership:true})),root=document.getElementById('workbench-inspector');
let view,closed=false;
addEventListener('pagehide',()=>{closed=true;void Promise.resolve(view?.dispose()).finally(()=>client.dispose());},{once:true});
void chrome.tabs.getCurrent().catch(()=>null).then(current=>{
 if(closed)return;
 // A host can supply its own selected tab; opener is the example host's context.
 const mount=(initialTabId=current?.openerTabId)=>{view=mountAtom(root,client,{readerURL:'../reader.html',initialTabId,sourceAnalysisWorkerURL:chrome.runtime.getURL('source-analysis-worker.js'),onReconnect:()=>location.reload(),requestOriginPermission:origin=>chrome.permissions.request({origins:[origin+'/*']})});return view.ready;};
 window.embedding={mount,unmount(){return view.dispose();}};
 void mount();
});
