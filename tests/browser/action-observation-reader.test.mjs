// SPDX-License-Identifier: Apache-2.0
import test from'node:test';import assert from'node:assert/strict';
import{makeDiagnostic}from'../../core/diagnostic.mjs';import{actionObservationReportFixture}from'../helpers/action-observation-report-fixture.mjs';
test('passive reader presents saved body and exit as historical text with no action controls',async()=>{
 const previous=globalThis.document;function element(){return{textContent:'',children:[],append(...x){this.children.push(...x);},replaceChildren(...x){this.children=x;},addEventListener(type,fn){this.listener=fn;}};}
 const elements=Object.fromEntries(['diagnostic-file','reader-status','reader-summary','reader-payload'].map(id=>[id,element()]));globalThis.document={getElementById:id=>elements[id],createElement:element};
 const text=node=>[node.textContent,...node.children.map(text)].join(' ');
 try{await import('../../browser-extension/reader.mjs?a05-historical');const r=makeDiagnostic(actionObservationReportFixture().state);elements['diagnostic-file'].files=[new File([JSON.stringify(r)],'synthetic-history.json')];await elements['diagnostic-file'].listener();const summary=text(elements['reader-summary']);assert.match(summary,/Historical interaction observation/);assert.match(summary,/save.*returned.*src\/actions.js:3/);assert.match(summary,/not evidence for the selected property/);assert.match(summary,/Historical untrusted/);assert.match(summary,/execution not observed/);assert.doesNotMatch(summary,/source is current|collector resumed|full provenance verified/i);const all=[];function walk(n){all.push(n);n.children.forEach(walk);}walk(elements['reader-summary']);assert(all.every(n=>!n.onclick&&!n.href));}
 finally{if(previous===undefined)delete globalThis.document;else globalThis.document=previous;}
});
