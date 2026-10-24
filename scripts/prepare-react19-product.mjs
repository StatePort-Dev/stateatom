// SPDX-License-Identifier: Apache-2.0
// One owned qualification overlay. No upstream source/dependency edits or browser launch.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,cp,readdir,symlink,realpath} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';import path from 'node:path';import {createRequire} from 'node:module';
import {build} from 'esbuild';
const root=process.cwd(),sha=b=>createHash('sha256').update(b).digest('hex'),json=async f=>JSON.parse(await readFile(f));
const [atomFile,pluginFile]=process.argv.slice(2);
assert(atomFile&&pluginFile,'Pass exact Atom and plugin handoff paths; preparation never launches a browser');
const atom=await json(atomFile),plugin=await json(pluginFile);
assert.equal(atom.package.version,'0.1.0-candidate.20261021.75');assert.equal(plugin.plugin.version,'0.1.0-candidate.20261021.7');
assert.equal(plugin.schema,'stateatom.development-plugin-artifact/1');assert(!plugin.helper);
for(const artifact of[atom.package,atom.ui,plugin.plugin])assert.equal(sha(await readFile(artifact.file)),artifact.sha256);
for(const manifest of[atom.buildSources.manifest,plugin.sourceManifest])for(const[file,hash]of Object.entries(manifest))assert.equal(sha(await readFile(path.resolve(root,file))),hash,'Package source drift: '+file);
const upstream=root+'/.runtime/todomvc',originalApp=upstream+'/examples/react',sourceFiles=await json(upstream+'/SOURCE_SHA256.json');
assert.equal((await readFile(upstream+'/REVISION','utf8')).trim(),'ff43b02e59dfa604386bb382034b2cd07c2bcd8a');
for(const[file,hash]of Object.entries(sourceFiles))assert.equal(sha(await readFile(upstream+'/'+file)),hash,'Upstream drift: '+file);
const out=root+'/.artifacts/a02/react19-product/'+new Date().toISOString().replace(/[:.]/g,'-'),app=out+'/app',consumer=out+'/plugin-consumer';
await mkdir(app,{recursive:true});await mkdir(consumer);
for(const file of['src','public','package.json','package-lock.json'])await cp(originalApp+'/'+file,app+'/'+file,{recursive:true});
await cp(upstream+'/license.md',app+'/UPSTREAM-LICENSE.md');
await writeFile(consumer+'/package.json',JSON.stringify({private:true,type:'module',dependencies:{'@stateport/vite-plugin':'file:'+plugin.plugin.file,vite:'7.3.7'}}));
execFileSync('npm',['install','--offline','--ignore-scripts','--no-audit','--no-fund'],{cwd:consumer,stdio:'pipe'});
const require=createRequire(consumer+'/package.json'),installed=require.resolve('@stateport/vite-plugin');
assert(installed.startsWith(consumer+'/node_modules/'));
const installedManifest=await json(consumer+'/node_modules/@stateport/vite-plugin/dist/source-manifest.json');assert.deepEqual(installedManifest,plugin.sourceManifest);
await mkdir(app+'/node_modules');
// Reuse unchanged locked app dependencies through declared overlay links. Keep
// original package/lock untouched; Vite is an extra qualification-tool link only.
for(const item of await readdir(originalApp+'/node_modules'))if(item!=='.bin'&&item!=='vite')await symlink(await realpath(originalApp+'/node_modules/'+item),app+'/node_modules/'+item);
await symlink(consumer+'/node_modules/vite',app+'/node_modules/vite');
const appRequire=createRequire(app+'/package.json'),pins={
 'react/cjs/react.development.js':'4325e6263375459503858c0982d50bbc25bc33e66676954698c67221d2ee8b72',
 'react-dom/cjs/react-dom-client.development.js':'806b25cf84808a5ae0104e81633caabb1aa11fce71e72ef7afe4c1f8d2ebec08'
};
const vendorFiles={};for(const[file,hash]of Object.entries(pins)){const name=file.split('/')[0],absolute=path.join(path.dirname(appRequire.resolve(name+'/package.json')),file.slice(name.length+1));assert.equal(sha(await readFile(absolute)),hash);vendorFiles[absolute]=hash;}
const config=`import {createRequire} from 'node:module';import {readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import path from 'node:path';import {pathToFileURL} from 'node:url';
const require=createRequire(${JSON.stringify(consumer+'/package.json')}),{createServer}=await import(pathToFileURL(require.resolve('vite'))),{stateatomPlugin}=await import(pathToFileURL(require.resolve('@stateport/vite-plugin'))),babel=await import(pathToFileURL(require.resolve('@babel/core'))),jsx=(await import(pathToFileURL(require.resolve('@babel/plugin-transform-react-jsx')))).default;
const app=process.cwd(),html=await readFile(app+'/public/index.html','utf8');
const server=await createServer({configFile:false,root:app,publicDir:app+'/public',cacheDir:${JSON.stringify(out+'/vite-cache')},server:{host:'127.0.0.1',port:0,strictPort:true,fs:{allow:[app,${JSON.stringify(await realpath(originalApp+'/node_modules'))},${JSON.stringify(consumer)}]}},optimizeDeps:{noDiscovery:true,include:['react','react-dom','react-dom/client','react-router-dom','react/jsx-runtime','classnames']},plugins:[stateatomPlugin({enabled:true,profile:'react19-state-ancestors',root:app+'/src'}),{name:'declared-ordinary-react-overlay',enforce:'pre',configureServer(s){s.middlewares.use(async(req,res,next)=>{if(req.url==='/base.js'){res.setHeader('Content-Type','application/javascript');res.end(await readFile(app+'/node_modules/todomvc-common/base.js','utf8'));return;}if(req.url==='/'){res.setHeader('Content-Type','text/html');res.end(await s.transformIndexHtml('/',html.replace('</body>','<script type="module" src="/src/index.js"></script></body>')));return;}if(req.url==='/favicon.ico'){res.writeHead(204).end();return;}next();});},transform(code,id){if(id.startsWith(app+'/src/')&&/\\.(js|jsx)$/.test(id))return babel.transformSync(code,{filename:id,configFile:false,babelrc:false,plugins:[[jsx,{runtime:'automatic'}]],sourceMaps:true});}}]});
await server.listen();const address=server.httpServer.address();await writeFile(${JSON.stringify(out+'/vite-ready.json')},JSON.stringify({origin:'http://127.0.0.1:'+address.port,pid:process.pid,execPath:process.execPath,node:process.versions.node,executableHash:createHash('sha256').update(await readFile(process.execPath)).digest('hex'),installedPlugin:${JSON.stringify(installed)}}));
for(const signal of['SIGTERM','SIGINT'])process.once(signal,async()=>{await server.close();process.exit(0);});
`;
await writeFile(out+'/vite-server.mjs',config,{flag:'wx'});
const closure=await build({entryPoints:[root+'/ide-extension/session.mjs'],bundle:true,platform:'node',format:'esm',write:false,metafile:true,logLevel:'silent'});
const helperInputs={};for(const file of Object.keys(closure.metafile.inputs).sort())helperInputs[file]=sha(await readFile(path.resolve(root,file)));
const copiedOriginals={};for(const[file,hash]of Object.entries(sourceFiles))if(file.startsWith('examples/react/')){const local=file.slice('examples/react/'.length);assert.equal(sha(await readFile(app+'/'+local)),hash);copiedOriginals[app+'/'+local]=hash;}
const installedFiles={};async function files(dir){for(const item of await readdir(dir,{withFileTypes:true})){const absolute=dir+'/'+item.name;if(item.isDirectory())await files(absolute);else if(item.isFile())installedFiles[absolute]=sha(await readFile(absolute));else throw Error('Unexpected plugin payload type');}}
await files(consumer+'/node_modules/@stateport/vite-plugin');
const dependencies=await build({entryPoints:[app+'/src/index.js'],outdir:out+'/static-dependency-probe',bundle:true,write:false,metafile:true,platform:'browser',format:'esm',jsx:'automatic',loader:{'.js':'jsx'},define:{'process.env.NODE_ENV':'"development"'},logLevel:'silent'});
const appDependencyInputs={};for(const file of Object.keys(dependencies.metafile.inputs)){const absolute=path.resolve(file);appDependencyInputs[absolute]=sha(await readFile(absolute));}
const toolInputs={},toolLinks={};async function tools(dir){for(const item of await readdir(dir,{withFileTypes:true})){const file=dir+'/'+item.name;if(item.isDirectory())await tools(file);else if(item.isFile())toolInputs[file]=sha(await readFile(file));else if(item.isSymbolicLink()){const target=await realpath(file);assert(target.startsWith(consumer+'/node_modules/'),'External tool link');toolLinks[file]=target;}else throw Error('Unexpected tool input type');}}
await tools(consumer+'/node_modules');
for(const file of['package.json','package-lock.json'])toolInputs[consumer+'/'+file]=sha(await readFile(consumer+'/'+file));
const dependencyTree=JSON.parse(execFileSync('npm',['ls','--all','--json'],{cwd:consumer,encoding:'utf8'}));assert(!dependencyTree.problems?.length);
const prepared={schema:'stateatom.react19-product-preparation/1',browserStarted:false,out,app,consumer,atomHandoff:path.resolve(atomFile),pluginHandoff:path.resolve(pluginFile),atom,plugin,originalRevision:'ff43b02e59dfa604386bb382034b2cd07c2bcd8a',originalSourceFiles:sourceFiles,copiedOriginals,vendorFiles,helperInputs,installedFiles,appDependencyInputs,toolInputs,toolLinks,dependencyTree,overlay:out+'/vite-server.mjs',overlayHash:sha(config),configuration:{originalBuild:'Webpack',qualificationBuild:'Vite7.3.7 overlay/automatic JSX',originalSourceAndLockUnchanged:true,extraDependencyLinks:['vite'],helper:'source API HTTP session; not installed IDE/VSIX acceptance',certificates:false,productionWrites:false}};
await writeFile(out+'/prepared.json',JSON.stringify(prepared,null,2),{flag:'wx'});console.log(out+'/prepared.json');
