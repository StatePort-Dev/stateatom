// SPDX-License-Identifier: Apache-2.0
// Test-owned ordinary dev-server process; cwd is the copied application workspace.
import {readFile} from 'node:fs/promises';
import {createServer} from 'vite';
import {transformSync} from '@babel/core';
import jsx from '@babel/plugin-transform-react-jsx';
import {stateatomPlugin} from '../../src/engine/plugin.mjs';
const [workspace,enabledText,cacheDir]=process.argv.slice(2),enabled=enabledText==='true';
if(process.cwd()!==workspace)throw Error('Start ordinary server in its actual project cwd');
let server;
async function close(){await server?.close();process.exit(0);}
process.on('message',m=>{if(m?.op==='stop')void close();});
process.on('SIGTERM',()=>void close());
try{
 const html=await readFile(workspace+'/public/index.html','utf8');
 server=await createServer({
  configFile:false,root:workspace,publicDir:workspace+'/public',cacheDir,
  server:{host:'127.0.0.1',port:4176,strictPort:true,fs:{allow:[workspace]}},
  optimizeDeps:{noDiscovery:true,include:['react','react-dom','react-dom/client','react-router-dom','react/jsx-runtime','classnames']},
  plugins:[stateatomPlugin({enabled,root:workspace+'/src'}),{
   name:'a01-evaluation-environment-only',enforce:'pre',
   configureServer(s){s.middlewares.use(async(req,res,next)=>{
    if(req.url==='/base.js'){res.setHeader('Content-Type','application/javascript');res.end(await readFile(workspace+'/node_modules/todomvc-common/base.js','utf8'));return;}
    if(req.url==='/'){res.setHeader('Content-Type','text/html');res.end(await s.transformIndexHtml('/',html.replace('</body>','<script type="module" src="/src/index.js"></script></body>')));return;}next();
   });},
   transform(code,id){if(id.startsWith(workspace+'/src/')&&/\.(js|jsx)$/.test(id))return transformSync(code,{filename:id,configFile:false,babelrc:false,plugins:[[jsx,{runtime:'automatic'}]],sourceMaps:true});}
  }]
 });
 await server.listen();
 process.send({type:'ready',origin:'http://127.0.0.1:'+server.httpServer.address().port,cwd:process.cwd(),enabled});
}catch(e){process.send?.({type:'error',message:e.stack||e.message});await server?.close();process.exitCode=1;process.disconnect?.();}
