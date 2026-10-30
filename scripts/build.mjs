import {replaceLocalExtension} from './local-extension-output.mjs';
import {fileManifest,sha256} from './atom-package-receipt.mjs';
import {buildAtom} from './build-atom.mjs';
import {build} from 'esbuild';import {dirname as pathDir} from 'node:path';import {cp,mkdir,writeFile,copyFile,readFile} from 'node:fs/promises';import {build as viteBuild} from 'vite';import {config,root} from './vite-config.mjs';
import {createRequire} from 'node:module';
import {buildUI} from '../packages/extension-ui/scripts/build.mjs';
const browserOnly=process.argv.includes('--browser-only');
const browserOutput=root+'/dist/browser';
await replaceLocalExtension(browserOutput,async browserDir=>{
await buildUI();
await buildAtom();
const resolveUI = createRequire(import.meta.url);
await mkdir(browserDir,{recursive:true});
await copyFile(root+'/packages/atom/dist/THIRD_PARTY_LICENSES.md',browserDir+'/THIRD_PARTY_LICENSES.md');
await copyFile(root+'/packages/atom/dist/atom.css',browserDir+'/atom.css');
for (const name of ['tokens.css', 'components.css', 'fonts.css', 'contract.json']) {
 await copyFile(resolveUI.resolve('@stateport/extension-ui/'+name), browserDir+'/extension-ui-'+name);
}
await mkdir(browserDir+'/assets/fonts',{recursive:true});
await copyFile(resolveUI.resolve('@stateport/extension-ui/assets/fonts/InterVariable.woff2'),browserDir+'/assets/fonts/InterVariable.woff2');
await mkdir(browserDir+'/extension-ui-licenses',{recursive:true});
for (const name of ['LICENSE', 'NOTICE']) await copyFile(root+'/packages/extension-ui/'+name, browserDir+'/extension-ui-licenses/'+name);
await copyFile(root+'/packages/extension-ui/assets/fonts/Inter-LICENSE.txt',browserDir+'/extension-ui-licenses/Inter-LICENSE.txt');
for(const name of ['manifest.json','panel.html','panel.css','reader.html','reader.css'])await copyFile(root+'/browser-extension/'+name,browserDir+'/'+name);
await copyFile(root+'/packages/atom/dist/content.js',browserDir+'/content.js');
for(const f of ['atom-guardian.html','atom-guardian.js','atom-guardian-worker.js'])await copyFile(root+'/packages/atom/dist/'+f,browserDir+'/'+f);
await copyFile(root+'/packages/atom/dist/source-analysis-worker.js',browserDir+'/source-analysis-worker.js');
await copyFile(root+'/packages/atom/dist/source-parse-worker.js',browserDir+'/source-parse-worker.js');
await build({entryPoints:[root+'/browser-extension/worker.js'],bundle:true,format:'esm',platform:'browser',outfile:browserDir+'/worker.js'});
await build({entryPoints:[root+'/browser-extension/panel.js'],bundle:true,format:'esm',platform:'browser',outfile:browserDir+'/panel.js'});
await build({entryPoints:[root+'/browser-extension/reader.mjs'],bundle:true,format:'iife',platform:'browser',outfile:browserDir+'/reader.js'});
for(const file of ['LICENSE','NOTICE','LICENSES/Apache-2.0.txt']){await mkdir(pathDir(browserDir+'/'+file),{recursive:true});await copyFile(root+'/'+file,browserDir+'/'+file);}
const builtAt=new Date().toISOString();
const manifest=JSON.parse(await readFile(browserDir+'/manifest.json','utf8'));
manifest.version_name=manifest.version+' local '+builtAt;
await writeFile(browserDir+'/manifest.json',JSON.stringify(manifest,null,2)+'\n');
const files=await fileManifest(browserDir),buildId=sha256(JSON.stringify(files));
await writeFile(browserDir+'/local-build.json',JSON.stringify({scope:'local-development',buildId,builtAt,installationPath:browserOutput,files},null,2));
});
console.log('Local extension updated: '+browserOutput+'\nKeep this installation. Reload it in Chrome; do not remove or load another folder.');
if(browserOnly)process.exit(0);
await mkdir(root+'/dist/reader',{recursive:true});for(const name of ['reader.html','reader.css','reader.js'])await copyFile(root+'/dist/browser/'+name,root+'/dist/reader/'+name);
for (const name of ['tokens.css', 'components.css', 'fonts.css', 'contract.json']) await copyFile(root+'/dist/browser/extension-ui-'+name, root+'/dist/reader/extension-ui-'+name);
await cp(root+'/dist/browser/assets',root+'/dist/reader/assets',{recursive:true});
await cp(root+'/dist/browser/extension-ui-licenses',root+'/dist/reader/extension-ui-licenses',{recursive:true});
const ideBundle=await build({metafile:true,entryPoints:[root+'/ide-extension/extension.mjs'],bundle:true,format:'cjs',platform:'node',target:'node20',external:['vscode'],outfile:root+'/ide-extension/extension.cjs',logLevel:'warning'});
const packages=new Map();for(const input of Object.keys(ideBundle.metafile.inputs)){if(!input.includes('node_modules/'))continue;let dir=pathDir(input);while(dir&&dir!=='.'){try{const p=JSON.parse(await readFile(dir+'/package.json','utf8'));if(p.name){if(!packages.has(p.name)){let license='';for(const f of ['LICENSE','LICENSE.md','LICENSE.txt','LICENSE-MIT','LICENSE-MIT.txt','license','license.md','license.txt'])try{license=await readFile(dir+'/'+f,'utf8');break;}catch{}packages.set(p.name,{version:p.version,license:p.license,text:license});}break;}}catch{}dir=pathDir(dir);}}for(const [name,p] of packages){if(!p.text.trim())throw Error('Missing bundled dependency license text: '+name);}await writeFile(root+'/ide-extension/THIRD_PARTY_LICENSES.md',[...packages].map(([name,p])=>'## '+name+' '+p.version+' ('+p.license+')\n\n'+p.text).join('\n\n'));
await cp(root+'/ide-extension',root+'/dist/ide',{recursive:true});
// Every independently usable output keeps the applicable source licenses and notices.
for (const output of ['browser', 'ide', 'reader']) {
 const dir = root + '/dist/' + output;
 await mkdir(dir + '/LICENSES', {recursive:true});
 await copyFile(root + '/LICENSE', dir + '/LICENSE');
 await copyFile(root + '/NOTICE', dir + '/NOTICE');
 await copyFile(root + '/LICENSES/Apache-2.0.txt', dir + '/LICENSES/Apache-2.0.txt');
}
console.log('Browser and IDE built');
if(!process.argv.includes('--extensions-only')){await viteBuild(config('A'));console.log('Minified fixtures built without source maps');}
