import {mountAtom} from '@stateport/atom/ui';
import {createAtomClient,chromeTransport} from '@stateport/atom/transport';
import {createPickerNavigationClient} from './picker-navigation.mjs';
const transportClient=createAtomClient(chromeTransport(chrome,{inspectorOwnership:true}));
let client=transportClient,view,closed=false;
addEventListener('pagehide',()=>{closed=true;void Promise.resolve(view?.dispose()).finally(()=>client.dispose());},{once:true});
// Chrome owns openerTabId. Keep the exact trusted entry URL free of parameters.
void chrome.tabs.getCurrent().catch(()=>null).then(current=>{
 if(closed)return;
 if(Number.isSafeInteger(current?.id))client=createPickerNavigationClient(transportClient,chrome,current.id);
 view=mountAtom(document.getElementById('atom'),client,{idPrefix:'',sourceAnalysisWorkerURL:chrome.runtime.getURL('source-analysis-worker.js'),onReconnect:()=>location.reload(),initialTabId:current?.openerTabId,requestOriginPermission:origin=>chrome.permissions.request({origins:[origin+'/*']})});
});
