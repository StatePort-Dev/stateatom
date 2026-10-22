// SPDX-License-Identifier: Apache-2.0
// Explicit synthetic domains, one private CA and local HTTPS server. No trust installation.
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:https';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
export async function sourceAccessHTTPSFixture(out,{js,map,manifest,zip,marker}){
 await mkdir(out,{recursive:true,mode:0o700});
 const run=args=>execFileSync('openssl',args,{stdio:['ignore','ignore','pipe']});
 run(['req','-x509','-newkey','rsa:2048','-nodes','-keyout',out+'/root.key','-out',out+'/root.pem','-days','2','-sha256','-subj','/CN=StateAtom P03 workflow disposable root','-addext','basicConstraints=critical,CA:TRUE','-addext','keyUsage=critical,keyCertSign,cRLSign']);
 run(['req','-new','-newkey','rsa:2048','-nodes','-keyout',out+'/server.key','-out',out+'/server.csr','-subj','/CN=app.p03.test']);
 await writeFile(out+'/server.ext','basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\nsubjectAltName=DNS:app.p03.test,DNS:artifacts.p03.test,DNS:forbidden.p03.test,DNS:switch.p03.test,DNS:pending.p03.test\n');
 run(['x509','-req','-in',out+'/server.csr','-CA',out+'/root.pem','-CAkey',out+'/root.key','-CAcreateserial','-out',out+'/server.pem','-days','2','-sha256','-extfile',out+'/server.ext']);
 const traffic=[],pending=[];
 const server=createServer({key:await readFile(out+'/server.key'),cert:await readFile(out+'/server.pem')},(req,res)=>{
  const host=req.headers.host.split(':')[0],route=new URL(req.url,'https://fixture').pathname;
  traffic.push({host,url:req.url,cookie:!!req.headers.cookie,referrer:!!req.headers.referer,at:new Date().toISOString()});
  if(host==='app.p03.test'){
   if(route==='/app.js'){res.setHeader('Content-Type','text/javascript');res.end(js);}
   else if(route==='/favicon.ico'){res.writeHead(204);res.end();}
   else{res.setHeader('Content-Type','text/html');res.setHeader('Set-Cookie','P03_APP_PRIVATE=synthetic; Path=/; Secure');res.end('<!doctype html><title>P03 ordinary HTTPS app</title><style>body{font:18px system-ui;padding:32px}button{font:inherit;padding:18px;margin:12px}</style><h1>Ordinary HTTPS app</h1><button id="first">Confirm</button><button id="second">Confirm</button><script src="/app.js"></script>');}
  }else if(['artifacts.p03.test','switch.p03.test','pending.p03.test'].includes(host)){
   if(route==='/manifest.json'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(manifest));}
   else if(route==='/app.js'){res.setHeader('Content-Type','text/javascript');res.end(js);}
   else if(route==='/app.js.map'){res.setHeader('Content-Type','application/json');res.end(map);}
   else if(route==='/release.zip'){res.setHeader('Content-Type','application/zip');res.end(zip);}
   else if(route==='/denied.map'){res.writeHead(403);res.end(marker);}
   else if(route==='/signin.map'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><form>'+marker+'</form></html>');}
   else if(route==='/redirect.map'){res.writeHead(302,{location:'https://forbidden.p03.test:'+server.address().port+'/private-'+marker});res.end();}
   else if(route==='/boundary.json'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({...manifest,assets:[{...manifest.assets[0],sourceMap:'https://forbidden.p03.test/private.map'}]}));}
   else if(route==='/pending.map'){const p={at:new Date().toISOString(),closed:false};pending.push(p);res.on('close',()=>p.closed=true);}
   else if(route==='/cookie'){res.setHeader('Set-Cookie','P03_ARTIFACT_PRIVATE=synthetic; Path=/; Secure');res.end('<!doctype html><title>P03 synthetic artifact session</title>Ordinary browser session cookie.');}
   else{res.writeHead(404);res.end(marker);}
  }else{res.writeHead(451);res.end('REFUSED SYNTHETIC HOST');}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;
 const info={out,port,app:'https://app.p03.test:'+port,artifact:'https://artifacts.p03.test:'+port,mismatch:'https://mismatch.p03.test:'+port,root:path.resolve(out+'/root.pem'),rootDER:execFileSync('openssl',['x509','-in',out+'/root.pem','-outform','DER']),chromeArguments:['--no-proxy-server','--host-resolver-rules=MAP app.p03.test 127.0.0.1, MAP artifacts.p03.test 127.0.0.1, MAP forbidden.p03.test 127.0.0.1, MAP mismatch.p03.test 127.0.0.1, MAP switch.p03.test 127.0.0.1, MAP pending.p03.test 127.0.0.1'],traffic,pending};
 const stop=async()=>{server.closeAllConnections();if(server.listening)await new Promise(r=>server.close(r));};
 return{...info,stop,restart:()=>new Promise(r=>server.listen(port,'127.0.0.1',r)),close:stop};
}
