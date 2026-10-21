// SPDX-License-Identifier: Apache-2.0
// Current retained synthetic setup, unchanged phaseConfig and source files.
import {phaseConfig} from '../../scripts/inspection-server.mjs';
import {createServer} from 'vite';
import vue from '@vitejs/plugin-vue';
import {readFile} from 'node:fs/promises';
import {transformSync} from '@babel/core';
import jsx from '@babel/plugin-transform-react-jsx';
import {stateatomPlugin} from '../../src/engine/plugin.mjs';
import {root} from '../../scripts/vite-config.mjs';
const [mode,hostPropsText,cacheDir]=process.argv.slice(2);
let server;
async function stop(){await server?.close();process.exit(0);}
process.on('message',m=>{if(m?.op==='stop')void stop();});
process.on('SIGTERM',()=>void stop());
try{
 let config=phaseConfig(mode,{reactHostProps:hostPropsText==='true'});
 if(mode==='todo-react'||mode==='todo-vue'){
  const stack=mode.slice(5),base=root+'/.runtime/todomvc/examples/'+stack,html=await readFile(base+(stack==='react'?'/public/index.html':'/index.html'),'utf8');
  config={configFile:false,root:base,publicDir:base+'/public',server:{host:'127.0.0.1',port:4173,strictPort:true,fs:{allow:[root]}},resolve:{alias:{'@':base+'/src'}},optimizeDeps:{noDiscovery:true,include:stack==='react'?['react','react-dom','react-dom/client','react-router-dom','react/jsx-runtime','classnames']:['vue','vue-router']},plugins:[stateatomPlugin({enabled:true,root:base+'/src'}),vue(),{name:'retained-original-independent-environment',enforce:'pre',configureServer(s){s.middlewares.use(async(req,res,next)=>{if(req.url==='/base.js'){res.setHeader('Content-Type','application/javascript');res.end(await readFile(base+'/node_modules/todomvc-common/base.js','utf8'));return;}if(stack==='react'&&req.url==='/'){res.setHeader('Content-Type','text/html');res.end(await s.transformIndexHtml('/',html.replace('</body>','<script type="module" src="/src/index.js"></script></body>')));return;}next();});},transform(code,id){if(stack==='react'&&id.startsWith(base+'/src/')&&/\.(js|jsx)$/.test(id))return transformSync(code,{filename:id,configFile:false,babelrc:false,plugins:[[jsx,{runtime:'automatic'}]],sourceMaps:true});}}]};
 }
 server=await createServer({...config,cacheDir});
 await server.listen();process.send({type:'ready',origin:'http://127.0.0.1:'+server.httpServer.address().port,cwd:process.cwd(),mode,reactHostProps:hostPropsText==='true'});
}catch(e){process.send?.({type:'error',message:e.stack||e.message});await server?.close();process.exitCode=1;process.disconnect?.();}
