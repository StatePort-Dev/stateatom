// Run from a clean consumer with @stateport/atom and its pinned UI peer installed.
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {mkdir,copyFile,cp} from 'node:fs/promises';
import path from 'node:path';
const require=createRequire(import.meta.url),out=path.resolve('dist');
await mkdir(out+'/workspace',{recursive:true});
for(const [input,output] of [['worker.js','host-worker.js'],['inspect.js','workspace/inspect.js']])await build({entryPoints:[input],bundle:true,platform:'browser',format:'esm',outfile:out+'/'+output});
await copyFile('manifest.json',out+'/manifest.json');await copyFile('inspect.html',out+'/workspace/inspect.html');
for(const file of ['atom.css','content.js','reader.js','reader.html','reader.css'])await copyFile(require.resolve('@stateport/atom/'+file),out+'/'+file);
for(const file of ['tokens.css','components.css','fonts.css','contract.json'])await copyFile(require.resolve('@stateport/extension-ui/'+file),out+'/extension-ui-'+file);
await mkdir(out+'/assets/fonts',{recursive:true});await copyFile(require.resolve('@stateport/extension-ui/assets/fonts/InterVariable.woff2'),out+'/assets/fonts/InterVariable.woff2');
await copyFile(path.dirname(require.resolve('@stateport/extension-ui/contract.json'))+'/assets/fonts/Inter-LICENSE.txt',out+'/Inter-LICENSE.txt');
for(const pkg of ['atom','extension-ui']){const base=path.dirname(require.resolve('@stateport/'+pkg+'/contract.json'));await cp(base+'/LICENSE',out+'/'+pkg+'-LICENSE');await cp(base+'/NOTICE',out+'/'+pkg+'-NOTICE');}
const base=path.dirname(require.resolve('@stateport/atom/contract.json'));await cp(base+'/LICENSES',out+'/LICENSES',{recursive:true});
await cp(base+'/dist/THIRD_PARTY_LICENSES.md',out+'/atom-THIRD_PARTY_LICENSES.md');
