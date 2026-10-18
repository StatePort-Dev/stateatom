import {mountAtom} from '@stateport/atom/ui';
import {createAtomClient,chromeTransport} from '@stateport/atom/transport';
const client=createAtomClient(chromeTransport(chrome));
const view=mountAtom(document.getElementById('atom'),client,{idPrefix:''});
addEventListener('pagehide',()=>{view.dispose();client.dispose();},{once:true});
