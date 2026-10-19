import {mountAtom} from '@stateport/atom/ui';
import {createAtomClient,chromeTransport} from '@stateport/atom/transport';
const client=createAtomClient(chromeTransport(chrome));
let view,closed=false;
addEventListener('pagehide',()=>{closed=true;void Promise.resolve(view?.dispose()).finally(()=>client.dispose());},{once:true});
// Chrome owns openerTabId. Keep the exact trusted entry URL free of parameters.
void chrome.tabs.getCurrent().catch(()=>null).then(current=>{
 if(closed)return;
 view=mountAtom(document.getElementById('atom'),client,{idPrefix:'',initialTabId:current?.openerTabId,requestOriginPermission:origin=>chrome.permissions.request({origins:[origin+'/*']})});
});
