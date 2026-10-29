// SPDX-License-Identifier: Apache-2.0
// Installed consumer packages only; synthetic ordinary React properties.
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const [workspace]=process.argv.slice(2),require=createRequire(workspace+'/package.json');
const {createServer}=await import(pathToFileURL(require.resolve('vite')));
const {stateatomPlugin}=await import(pathToFileURL(require.resolve('@stateport/vite-plugin')));
const {transformSync}=require('@babel/core'),jsx=require('@babel/plugin-transform-react-jsx');
let server;
async function close(){await server?.close();process.exit(0);}
process.on('message',m=>{if(m?.op==='stop')void close();});
process.on('SIGTERM',()=>void close());
try{
 server=await createServer({configFile:false,root:workspace,cacheDir:workspace+'/.vite',publicDir:false,
  server:{host:'127.0.0.1',port:4176,strictPort:true,cors:true,fs:{allow:[workspace]}},
  optimizeDeps:{noDiscovery:true,include:['react','react-dom','react-dom/client','react/jsx-runtime']},
  plugins:[stateatomPlugin({enabled:true,root:workspace+'/control-src'}),{
   name:'l02-ordinary-properties-jsx',enforce:'pre',
   transform(code,id){if(id.startsWith(workspace+'/control-src/')&&id.endsWith('.jsx'))return transformSync(code,{filename:id,configFile:false,babelrc:false,plugins:[[jsx,{runtime:'automatic'}]],sourceMaps:true});}
  }]
 });await server.listen();process.send({type:'ready',origin:'http://127.0.0.1:'+server.httpServer.address().port,plugin:require.resolve('@stateport/vite-plugin'),vite:require.resolve('vite')});
}catch(error){process.send?.({type:'error',message:error.stack});await server?.close();process.exitCode=1;process.disconnect?.();}
