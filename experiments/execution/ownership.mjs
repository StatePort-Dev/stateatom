// SPDX-License-Identifier: Apache-2.0
// Preregistered negative control, not a new ownership or field-provenance mechanism.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {startServer} from "../../scripts/inspection-server.mjs";
import {startBrowser,waitFor} from "../../scripts/harness.mjs";
import {fileDigests} from "../../scripts/short-loop-inputs.mjs";
import {root} from "../../scripts/vite-config.mjs";
const tag=process.env.OWNERSHIP_TAG||new Date().toISOString().replaceAll(/[:.]/g,'-');assert.match(tag,/^[a-zA-Z0-9_-]+$/);
const out=root+'/.runtime/ownership-probes/'+tag;await mkdir(root+'/.runtime/ownership-probes',{recursive:true});await mkdir(out);
const entries=['experiments/execution','src/engine','tests/fixtures/inspection',"scripts/inspection-server.mjs",'scripts/harness.mjs','package.json','package-lock.json'],before=await fileDigests(root,entries);
let revision=null;try{revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();}catch{}
const result={revision,startedAt:new Date().toISOString(),inputs:before,checks:[],errors:[],fullPath:false,configuration:{nativeNegativeControl:true,productUI:false,claim:'Exact committed host/state object identities do not exclude external same-value field writes'}};
let server,browser;
try{
 server=await startServer('B',{reactHostProps:true,reactStateHandoffs:true,sourceWrites:true});browser=await startBrowser(out,'ownership-control',false);result.browser=browser.context.browser()?.version();
 await browser.context.addInitScript(()=>{
  const own=Object.getOwnPropertyDescriptor,seen=new WeakSet();const get=(o,k)=>o&&typeof o==='object'?own(o,k)?.value:undefined;
  window.ownershipControl={writes:0,beforeVisible:false};
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__={supportsFiber:true,inject(){return 1;},onCommitFiberRoot(id,root){
   const todo=[get(root,'current')];let count=0;
   while(todo.length&&count++<256){const fiber=todo.pop();if(!fiber)continue;todo.push(get(fiber,'child'),get(fiber,'sibling'));let hook=get(fiber,'memoizedState');
    for(let i=0;hook&&i<32;i++,hook=get(hook,'next')){const state=get(hook,'memoizedState'),rules=get(state,'rules'),quota=rules&&own(rules,'quota');if(quota&&Object.hasOwn(quota,'value')&&quota.value===12&&!seen.has(rules)){seen.add(rules);rules.quota=12;window.ownershipControl.writes++;window.ownershipControl.beforeVisible=!document.getElementById('p1');}}
   }
  },onCommitFiberUnmount(){}};
 });
 const page=await browser.context.newPage();page.on('pageerror',e=>result.errors.push(String(e)));await page.goto('http://127.0.0.1:4173/react/');await page.locator('#p1').waitFor();
 result.control=await page.evaluate(()=>window.ownershipControl);assert.equal(result.control.writes,1);assert.equal(result.control.beforeVisible,true);result.checks.push({name:'declared devtools hook actually writes the same field value before final P2/P1 render',status:'PASS'});
 result.dom=await page.evaluate(()=>({p1:document.getElementById('p1').textContent,p2:document.getElementById('p2').disabled}));assert.deepEqual(result.dom,{p1:'13',p2:false});result.checks.push({name:'unchanged original P2/P1 output does not reveal the extra equal-value writer',status:'PASS'});
 for(const[selector,property]of[['#p1','text'],['#p2','disabled']]){
  const trace=await page.locator(selector).evaluate((e,p)=>window.__STATEATOM__.snapshot(e.getAttribute('data-stateatom'),p,e),property);await writeFile(out+'/'+selector.slice(1)+'.json',JSON.stringify(trace,null,2));
  assert.equal(trace.commit.status,'Observed');assert(trace.stateHandoffs.some(h=>h.status==='Observed'),JSON.stringify(trace.stateHandoffs));const nodes=trace.nodes.filter(n=>n.origin?.pointer==='/rules/quota');assert(nodes.length);assert(nodes.every(n=>n.valueOrigin==='Unknown/Unsupported'));result.checks.push({name:selector+' exact host/state identities coexist with writer; current-field ancestry remains Unknown',status:'PASS'});
 }
 result.status='PASS_OWNERSHIP_NEGATIVE_CONTROL';
}catch(e){result.status='FAIL';result.errors.push(String(e.stack||e));process.exitCode=1;}
finally{for(const[name,fn]of[['browser',()=>browser?.context.close()],['server',()=>server?.close()]])try{await fn();}catch(e){result.errors.push(name+': '+e);}result.inputsStable=JSON.stringify(before)===JSON.stringify(await fileDigests(root,entries));if(!result.inputsStable||result.errors.length){result.status='FAIL';process.exitCode=1;}result.completedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log(result.status,out,result.errors);}
