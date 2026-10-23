// SPDX-License-Identifier: Apache-2.0
// Install-time compatibility boundary; the historical transform remains single-source.
import {stateatomPlugin as implementation} from './plugin.mjs';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {assertVue3Profile,assertDefaultProfile} from './vite-install-profile.mjs';
const ownRequire=createRequire(import.meta.url);
function version(require,name){
 try{
  const pkg=JSON.parse(readFileSync(require.resolve(name+'/package.json'),'utf8'));
  if(pkg.name!==name)throw Error('Package metadata name mismatch');
  return pkg.version;
 }catch(error){if(error.code!=='ERR_PACKAGE_PATH_NOT_EXPORTED')throw error;}
 // Some original compiler plugins export only their entry. Resolve its path,
 // never execute it, then read the enclosing package's own metadata.
 let directory=path.dirname(require.resolve(name));
 for(let depth=0;depth<12;depth++){
  try{
   const pkg=JSON.parse(readFileSync(path.join(directory,'package.json'),'utf8'));
   if(pkg.name===name)return pkg.version;
   if(pkg.name)break;
  }catch(error){if(error.code!=='ENOENT')throw error;}
  const parent=path.dirname(directory);if(parent===directory)break;directory=parent;
 }
 throw Error('Resolved package metadata unavailable');
}
export function stateatomPlugin(options={}){
 if(options.firstReadContracts)throw Error('Controlled first-read is a separate specialised source-checkout profile, not this installed plugin recipe');
 if(options.profile!==undefined&&options.profile!=='vue3')throw Error('Unknown StateAtom installed profile; the explicit experimental profile is vue3, or omit profile for the default recipe');
 if(options.enabled&&options.profile==='vue3')for(const name of ['reactCommit','reactHostProps','fetchInitiators','reactStateHandoffs','sourceWrites','queryHandoffs','queryCallCensus','writeAccessGuards','queryWriteAccessGuards','reactWriteAccessGuards','actionTrace'])if(options[name])throw Error('StateAtom Vue profile does not admit option '+name+'; use the documented selected source/read profile');
 const plugin=implementation(options);
 return {...plugin,configResolved(config){
  if(options.enabled&&options.reactHostProps&&(config.plugins?.some(p=>/^vite:react-(babel|refresh|swc)/.test(p.name))||config.esbuild?.jsx!=='transform'||config.esbuild?.jsxFactory!=='React.createElement'))throw Error('StateAtom React transform conflict: use the documented classic React.createElement JSX configuration without plugin-react; disable StateAtom for unsupported pipelines');
  if(!options.enabled)return;
  if(options.profile==='vue3'&&!config.plugins?.some(p=>p.name==='vite:vue'))throw Error('StateAtom Vue profile requires the original @vitejs/plugin-vue plugin; keep the application compiler configuration or disable StateAtom');
  let environment;
  try{
   const appRequire=createRequire(path.resolve(config.root||options.root||process.cwd(),'package.json'));
   environment={node:process.versions.node,vite:version(ownRequire,'vite'),appVite:version(appRequire,'vite')};
   if(options.profile==='vue3')Object.assign(environment,{vue:version(appRequire,'vue'),vuePlugin:version(appRequire,'@vitejs/plugin-vue')});
  }catch{throw Error('StateAtom installed profile cannot resolve original app/plugin version metadata; install the documented dependencies in the chosen app and restart, or disable StateAtom');}
  if(options.profile==='vue3')assertVue3Profile(environment);else assertDefaultProfile(environment);
 }};
}
