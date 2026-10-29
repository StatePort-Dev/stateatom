import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {classifyReleaseConsole} from '../helpers/release-background-warnings.mjs';
const policy=JSON.parse(await readFile(new URL('../../docs/testing/release-background-warning-policy.json',import.meta.url)));
const appConsole=policy.application.headers.flatMap(h=>Array.from({length:h.maximumCount},()=>({method:policy.application.method,params:{type:'warning',args:[{type:'string',value:h.message}]}})));
const workbench={surface:'workbench',type:'error',message:policy.workbench.message};
const classify=(app=appConsole,console=[workbench],errors=[])=>classifyReleaseConsole({appConsole:app,console,errors},policy);
test('exact accepted24 app warnings and one workbench descriptor remain present',()=>{const raw={appConsole,console:[workbench],errors:[]},before=structuredClone(raw),r=classifyReleaseConsole(raw,policy);assert.equal(r.accepted.length,25);assert.deepEqual(r.rejected,[]);assert.deepEqual(raw,before);});
test('empty log needs no invented background warning',()=>{assert.deepEqual(classify([],[]).accepted,[]);assert.deepEqual(classify([],[]).rejected,[]);});
for(const [name,change]of [
 ['new translation',x=>x.params.args[0].value="[intlify] Not found 'tools.new.title' key in 'en' locale messages."],
 ['error level',x=>x.params.type='error'],
 ['execution exception',x=>x.method='Runtime.exceptionThrown'],
 ['different Vue prop',x=>x.params.args[0].value='[Vue warn]: Invalid prop: a new failure'],
 ['nonstring header',x=>{x.params.args[0]={type:'object',description:policy.application.headers[0].message};}]
])test(name+' is rejected',()=>{const x=structuredClone(appConsole[0]);change(x);assert.equal(classify([x],[]).rejected.length,1);});
test('an extra occurrence of a known warning is rejected',()=>{assert.equal(classify([...appConsole,appConsole[0]],[]).rejected.length,1);});
test('inspector cannot borrow workbench exception',()=>{assert.equal(classify([],[{...workbench,surface:'inspector'}]).rejected.length,1);});
test('additional or changed Copilot errors are rejected',()=>{assert.equal(classify([],[workbench,workbench]).rejected.length,1);assert.equal(classify([],[{...workbench,message:workbench.message+' new failure'}]).rejected.length,1);});
test('actual execution errors remain rejected even with accepted words',()=>{assert.equal(classify([],[],[{message:policy.workbench.message}]).rejected.length,1);});
const currentPolicy=JSON.parse(await readFile(new URL('../../docs/testing/current96-vue-warning-policy.json',import.meta.url)));
const currentLogs=currentPolicy.workbench.descriptors.map(({maximumCount,...event})=>event);
test('354 admits exactly two current Code startup descriptors without rewriting logs',()=>{const raw={appConsole,console:currentLogs,errors:[]},copy=structuredClone(raw),r=classifyReleaseConsole(raw,currentPolicy);assert.equal(r.accepted.length,26);assert.deepEqual(r.rejected,[]);assert.deepEqual(raw,copy);});
test('354 still rejects duplicates, changed descriptors, wrong surfaces and execution errors',()=>{for(const event of [currentLogs[0],{...currentLogs[1],message:currentLogs[1].message+' changed'},{...currentLogs[0],surface:'inspector'},{...currentLogs[0],type:'error'}])assert.equal(classifyReleaseConsole({console:[...currentLogs,event]},currentPolicy).rejected.length,1);assert.equal(classifyReleaseConsole({errors:[{message:currentLogs[0].message}]},currentPolicy).rejected.length,1);});
test('352 does not silently admit354 messages and354 does not borrow old descriptor',()=>{assert.equal(classifyReleaseConsole({console:currentLogs},policy).rejected.length,2);assert.equal(classifyReleaseConsole({console:[workbench]},currentPolicy).rejected.length,1);});
