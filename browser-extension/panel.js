import {mountAtom} from '@stateport/atom/ui';
import {createAtomClient,chromeTransport} from '@stateport/atom/transport';
const client=createAtomClient(chromeTransport(chrome));
const view=mountAtom(document.getElementById('atom'),client,{idPrefix:'',requestOriginPermission:origin=>chrome.permissions.request({origins:[origin+'/*']})});
addEventListener('pagehide',()=>{void Promise.resolve(view.dispose()).finally(()=>client.dispose());},{once:true});
