// SPDX-License-Identifier: Apache-2.0
// Isolated synthetic grammar fixture on the copied independent app's locked React.
import {createServer} from 'vite';
import {transformSync} from '@babel/core';
import jsx from '@babel/plugin-transform-react-jsx';
import {stateatomPlugin} from '../../src/engine/plugin.mjs';
const [workspace,enabledText,cacheDir]=process.argv.slice(2),enabled=enabledText==='true';
if(process.cwd()!==workspace)throw Error('Start grammar server in its actual project cwd');
let server;
async function close(){await server?.close();process.exit(0);}
process.on('message',m=>{if(m?.op==='stop')void close();});
process.on('SIGTERM',()=>void close());
try{
 server=await createServer({configFile:false,root:workspace,cacheDir,publicDir:false,
  server:{host:'127.0.0.1',port:4176,strictPort:true,fs:{allow:[workspace]}},
  optimizeDeps:{noDiscovery:true,include:['react','react-dom','react-dom/client','react/jsx-runtime']},
  plugins:[stateatomPlugin({enabled,root:workspace+'/control-src'}),{
   name:'a01-ordinary-grammar-jsx',enforce:'pre',
   transform(code,id){if(id.startsWith(workspace+'/control-src/')&&id.endsWith('.jsx'))return transformSync(code,{filename:id,configFile:false,babelrc:false,plugins:[[jsx,{runtime:'automatic'}]],sourceMaps:true});}
  }]
 });await server.listen();
 process.send({type:'ready',origin:'http://127.0.0.1:'+server.httpServer.address().port,cwd:process.cwd(),enabled,fixture:'synthetic ordinary grammar'});
}catch(e){process.send?.({type:'error',message:e.stack||e.message});await server?.close();process.exitCode=1;process.disconnect?.();}
