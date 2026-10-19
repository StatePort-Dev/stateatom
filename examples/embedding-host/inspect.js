import {mountAtom} from '@stateport/atom/ui';
import {createAtomClient,chromeTransport} from '@stateport/atom/transport';
const client=createAtomClient(chromeTransport(chrome)),root=document.getElementById('workbench-inspector');
let view=mountAtom(root,client,{readerURL:'../reader.html'});
// Lifecycle controls used by the embedding consumer as well as its verification.
window.embedding={mount(){view=mountAtom(root,client,{readerURL:'../reader.html'});return view.ready;},unmount(){return view.dispose();}};
addEventListener('pagehide',()=>{void Promise.resolve(view.dispose()).finally(()=>client.dispose());},{once:true});
