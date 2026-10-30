// SPDX-License-Identifier: Apache-2.0
import {appOrigin,helperURL} from '../packages/atom/src/origin-policy.mjs';
export const HELPER_ID='local-research.stateatom-dev-helper',HELPER_VERSION='0.1.3',HELPER_PROTOCOL=1;
export function parseConnectionReceipt(input){
 const bad=()=>{throw Error('Invalid or unsupported connection receipt; copy a fresh receipt from the matching installed helper');};
 let r;try{r=typeof input==='string'?JSON.parse(input):input;}catch{bad();}
 if(!r||typeof r!=='object'||JSON.stringify(r).length>16384||r.schemaVersion!==1||r.helper?.id!==HELPER_ID||r.helper.version!==HELPER_VERSION||r.helper.protocol!==HELPER_PROTOCOL||!/^[-0-9a-f]{36}$/.test(r.helper.session||'')||!/^[0-9a-f]{64}$/.test(r.workspace?.id||'')||typeof r.workspace.name!=='string'||r.workspace.name.length>128||!helperURL(r.url)||!appOrigin(r.origin,{exact:true})||new URL(r.origin).protocol!=='http:'||!(/^[0-9a-f]{64}$/.test(r.token||'')))bad();
 if(typeof r.sourceRoot!=='string'||!r.sourceRoot||r.sourceRoot.length>1024||r.sourceRoot.startsWith('/')||/[\\:%\x00-\x1f]/.test(r.sourceRoot)||r.sourceRoot.split('/').some(p=>p==='..'||p===''))bad();
 if(Object.keys(r).some(k=>!['schemaVersion','helper','workspace','url','token','origin','sourceRoot'].includes(k)))bad();
 return {schemaVersion:1,helper:{id:r.helper.id,version:r.helper.version,protocol:r.helper.protocol,session:r.helper.session},workspace:{id:r.workspace.id,name:r.workspace.name},url:r.url,token:r.token,origin:r.origin,sourceRoot:r.sourceRoot};
}
export function assessProjectSetup({paired,selection,analysis,sourceMaps}={}){
 if(sourceMaps?.scripts?.some(s=>s.map?.hasContent===false))return {code:'MAP_SOURCES_MISSING',reason:'Map has positions without source content. Import an artifact containing sourcesContent or original source files; positions alone cannot show source text.'};
 if(!paired)return {code:'HELPER_DISCONNECTED',reason:'Page inspection works without an IDE. For source code, open your trusted project with the StateAtom helper, click Connect IDE in Atom and approve access in VS Code.'};
 if(!selection)return {code:'INSPECTION_REQUIRED',reason:'Attach the app and inspect a property to check source/plugin setup.'};
 if(!selection.marker)return {code:'PLUGIN_MISSING',reason:'No supported development marker observed. Install/configure the open Vite plugin, restart Vite and reload; Basic stays available. A marker alone is not execution evidence.'};
 if(!analysis?.boundFiles?.length)return {code:'SOURCE_MISMATCH',reason:'No matching workspace source revision. Choose the correct workspace/source folder, save files and reload/reinspect after HMR; do not reuse old observations.'};
 return {code:'SOURCE_CONNECTED',reason:'Source connection matched for this inspection. Only displayed supported operands are observations; unsupported executions remain Unknown.'};
}
