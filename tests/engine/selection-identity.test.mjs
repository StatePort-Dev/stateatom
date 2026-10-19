// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {createBrowserEngine,isSameSelection} from '../../src/engine/browser.mjs';

const text=value=>({nodeId:3,backendNodeId:103,nodeType:3,nodeName:'#text',localName:'',nodeValue:value});
const button=()=>({nodeId:2,backendNodeId:102,nodeType:1,nodeName:'BUTTON',localName:'button',nodeValue:'',attributes:[],childNodeCount:2,children:[text('  Confirm '),{nodeId:4,backendNodeId:104,nodeType:8,nodeName:'#comment',localName:'',nodeValue:'not text content'}]});
function nativeDOM({node=button(),afterQuery,documentId=101,whitespace=false}={}){
 let queries=0,allWhitespace=false;const methods=[];
 const chrome={scripting:{executeScript(){throw Error('DOM identity must not compile or execute a page script');}},debugger:{async sendCommand(target,method,params){assert.equal(target.tabId,9);methods.push(method);
  if(method==='DOM.enable'){allWhitespace=params.includeWhitespace==='all';return {}; }
  if(method==='DOM.getDocument')return {root:{nodeId:1,backendNodeId:documentId,nodeType:9,nodeName:'#document',localName:'',nodeValue:''}};
  if(method==='DOM.querySelector'){queries++;return {nodeId:afterQuery?.(queries)??node.nodeId};}
  if(method==='DOM.describeNode')return {node:whitespace&&!allWhitespace?{...node,children:node.children.filter(n=>n.nodeValue.trim()),childNodeCount:2}:node};
  throw Error('Unexpected identity command '+method);
 }}};
 return {...createBrowserEngine(chrome),methods,node};
}

test('DOM identity and native text stay stable without compiling an inspection script',async()=>{
 const dom=nativeDOM(),a=await dom.identifySelection(9,'#confirm','text'),b=await dom.identifySelection(9,'#confirm','text');
 assert.equal(a.value,'Confirm');assert.equal(a.property,'text');assert.equal(typeof a.document,'string');assert.equal(typeof a.node,'string');assert(isSameSelection(a,b));assert(dom.methods.every(m=>m.startsWith('DOM.')));
 dom.node.children[0].nodeValue='Other';assert(!isSameSelection(a,await dom.identifySelection(9,'#confirm','text')));
 const replaced=nativeDOM({node:{...button(),backendNodeId:202}});assert(!isSameSelection(b,await replaced.identifySelection(9,'#confirm','text')));
 assert(!isSameSelection(b,await nativeDOM({documentId:201}).identifySelection(9,'#confirm','text')));
});
test('disabled identity reads the native HTML button attribute, including an empty value',async()=>{
 const dom=nativeDOM();assert.equal((await dom.identifySelection(9,'#confirm','disabled')).value,false);
 dom.node.attributes=['disabled',''];assert.equal((await dom.identifySelection(9,'#confirm','disabled')).value,true);
 dom.node.nodeName='DIV';dom.node.localName='div';assert.equal(await dom.identifySelection(9,'#confirm','disabled'),null);
 dom.node.nodeName='BUTTON';dom.node.localName='BUTTON';assert.equal(await dom.identifySelection(9,'#confirm','disabled'),null);
});
test('a replacement during native DOM acquisition cannot become the selected identity',async()=>{
 const dom=nativeDOM({afterQuery:n=>n===1?2:22});assert.equal(await dom.identifySelection(9,'#confirm','text'),null);
});
test('missing, truncated and over-budget native text never become an empty known value',async()=>{
 for(const node of [{...button(),backendNodeId:0},{...button(),children:undefined},{...button(),childNodeCount:3},{...button(),children:[text('x'.repeat(128001))],childNodeCount:1}]){
  assert.equal(await nativeDOM({node}).identifySelection(9,'#confirm','text'),null);
 }
});

test('native text acquisition includes whitespace-only nodes between children',async()=>{
 const node={...button(),childNodeCount:3,children:[text('Alpha'),text(' '),text('Beta')]};
 assert.equal((await nativeDOM({node,whitespace:true}).identifySelection(9,'#confirm','text')).value,'Alpha Beta');
});
