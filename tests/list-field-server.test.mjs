// SPDX-License-Identifier: Apache-2.0
// Actual HTTP and owned compilation; no browser/installed lineage credit.
import http from 'node:http';
import test from 'node:test';import assert from 'node:assert/strict';
import {buildListFieldCompilation} from '../src/engine/list-field-compilation.mjs';
const options={appRoot:'.runtime/todomvc/examples/react',entry:'src/index.js',root:{file:'src/todo/app.jsx',export:'App'},field:'title',sources:['src/todo/app.jsx','src/todo/reducer.js','src/todo/components/main.jsx','src/todo/components/item.jsx','src/todo/components/footer.jsx']};
const load=()=>import('../src/engine/list-field-server.mjs');
test('list source server serves only acquired JS/CSS with no page proof or capability endpoint',async t=>{
 const c=await buildListFieldCompilation(options),{startListFieldServer}=await load(),s=await startListFieldServer({compilation:c,port:0});t.after(()=>s.close());const base='http://127.0.0.1:'+s.server.address().port;
 const request=(url,init)=>fetch(base+url,init);
 assert.match(await(await request('/__stateatom/list-start')).text(),/Enable inspection/);
 const html=await(await request('/list/')).text();assert(html.includes('/closed-profile/'+c.manifest.bundle.digest+'.js'));assert(!html.includes('fullPath'));
 const js=await request('/closed-profile/'+c.manifest.bundle.digest+'.js');assert.equal(await js.text(),c.code);assert.equal(js.headers.get('cache-control'),'no-store');
 for(const a of c.assets)assert.equal(await(await request('/list-assets/'+a.digest+'.css')).text(),a.code);
 for(const url of ['/__stateatom/list-manifest','/__stateatom/list-context','/closed-profile/'+ '0'.repeat(64)+'.js','/list/unknown'])assert.equal((await request(url)).status,404);
 assert.equal((await request('/list/',{method:'POST'})).status,405);
 const foreignHost=await new Promise((resolve,reject)=>{http.get(base+'/list/',{headers:{host:'localhost:'+s.server.address().port}},r=>{r.resume();resolve(r.statusCode)}).on('error',reject)});assert.equal(foreignHost,403);
 await s.close();await s.close();
});
test('serialized compilation cannot create a source-serving authority',async()=>{const {startListFieldServer}=await load();await assert.rejects(startListFieldServer({compilation:{code:'void 0;',manifest:{bundle:{digest:'a'.repeat(64)}}},port:0}),/owned|compilation/i)});
