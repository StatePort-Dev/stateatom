// SPDX-License-Identifier: Apache-2.0
// Install-time compatibility boundary; the historical transform remains single-source.
import {stateatomPlugin as implementation} from './plugin.mjs';
export function stateatomPlugin(options={}){
 if(options.firstReadContracts)throw Error('Controlled first-read is a separate specialised source-checkout profile, not this installed plugin recipe');
 const plugin=implementation(options);
 return {...plugin,configResolved(config){
  if(options.enabled&&options.reactHostProps&&(config.plugins?.some(p=>/^vite:react-(babel|refresh|swc)/.test(p.name))||config.esbuild?.jsx!=='transform'||config.esbuild?.jsxFactory!=='React.createElement'))throw Error('StateAtom React transform conflict: use the documented classic React.createElement JSX configuration without plugin-react; disable StateAtom for unsupported pipelines');
 }};
}
