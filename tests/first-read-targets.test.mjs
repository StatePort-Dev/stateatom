// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {createTargetHistory} from "../src/first-read/target-history.mjs";

const extension='a'.repeat(32),panelURL=`chrome-extension://${extension}/panel.html`,workerURL=`chrome-extension://${extension}/worker.js`;
const target=(targetId,type,url,extra={})=>({targetId,type,url,title:'',attached:false,canAccessOpener:false,...extra});
const initial=()=>[target('APP','page','about:blank'),target('PANEL','page',panelURL),target('WORKER','service_worker',workerURL),target('UI','browser_ui','chrome://omnibox-popup.top-chrome/')];
const make=(list=initial())=>createTargetHistory({appId:'APP',panelId:'PANEL',workerId:'WORKER',panelURL,workerURL,initial:list});
function replay(h,list=initial()){for(const info of list)assert.equal(h.observe('created',info),true);}

test('current inventory alone cannot replace discovery replay; exact known replay and app navigation remain consistent',()=>{
 const h=make();assert.equal(h.consistent(initial()),false); // not all initial IDs have been observed yet
 replay(h);assert.equal(h.consistent(initial()),true);
 for(const url of ['http://127.0.0.1:4173/__stateatom/first-read-start','http://127.0.0.1:4173/react/','about:blank']){
  const list=initial();list[0].url=url;assert.equal(h.observe('changed',list[0]),true);assert.equal(h.consistent(list),true);
 }
 assert.equal(h.observe('created',initial()[1]),true);assert.equal(h.consistent(initial()),true);
});

test('foreign producer creation remains terminal after foreign close and original app reload',()=>{
 for(const type of ['page','iframe','worker','shared_worker','service_worker','worklet','unknown','browser_ui']){
  const h=make();replay(h);assert.equal(h.observe('created',target('FOREIGN',type,'about:blank')),false);
  assert.equal(h.observe('destroyed',{targetId:'FOREIGN'}),false);
  assert.equal(h.observe('changed',target('APP','page','http://127.0.0.1:4173/react/')),false);
  assert.equal(h.consistent(initial()),false);
 }
});

test('ID reuse, metadata loss, non-profile navigation and known target loss deny history',()=>{
 for(const bad of [target('PANEL','page','about:blank'),target('WORKER','service_worker',workerURL+'?x'),target('APP','worker','about:blank'),target('APP','page','http://127.0.0.1:4173/react/?other'),target('APP','page','about:blank',{openerId:'OTHER'}),{targetId:'APP',type:'page',url:'about:blank'},target('APP','page','about:blank',{subtype:'prerender'})]){
  const h=make();replay(h);assert.equal(h.observe('changed',bad),false);assert.equal(h.consistent(initial()),false);
 }
 for(const event of ['destroyed','crashed','discoveryLost']){const h=make();replay(h);assert.equal(h.observe(event,{targetId:'APP'}),false);assert.equal(h.consistent(initial()),false);}
});

test('changed events cannot fill missing discovery replay and duplicate creation must be idempotent',()=>{
 const h=make();assert.equal(h.observe('changed',initial()[0]),false);assert.equal(h.consistent(initial()),false);
 const reused=make();replay(reused);assert.equal(reused.observe('created',target('APP','page','http://127.0.0.1:4173/react/')),false);
 const attached=make();replay(attached);assert.equal(attached.observe('changed',{...initial()[1],title:'StateAtom',attached:true}),true);assert.equal(attached.consistent(initial()),true);
});

test('inventory rejects omissions, duplicates, unknown IDs and disagreement with observed app document',()=>{
 for(const list of [initial().slice(1),[...initial(),initial()[0]],[...initial(),target('FOREIGN','page','about:blank')],initial().map(t=>t.targetId==='APP'?{...t,url:'http://127.0.0.1:4173/react/'}:t)]){
  const h=make();replay(h);assert.equal(h.consistent(list),false);assert.equal(h.consistent(initial()),false);
 }
});

test('initial inventory excludes missing identities and unbounded or foreign producers',()=>{
 for(const list of [initial().slice(1),[...initial(),target('FOREIGN','page','about:blank')],[...initial(),target('UI2','browser_ui','chrome://omnibox-popup.top-chrome/other')],Array.from({length:129},(_,i)=>target('UI'+i,'browser_ui','chrome://omnibox-popup.top-chrome/'))])assert.throws(()=>make(list));
});

test('event and target budgets stop further retention; close disposes retained state',()=>{
 const h=make();replay(h);
 let accepted=0;while(accepted<5000&&h.observe('changed',initial()[0]))accepted++;
 assert(accepted>0&&accepted<5000);for(let i=0;i<10000;i++)assert.equal(h.observe('created',target('LATE'+i,'page','about:blank')),false);
 assert.equal(h.consistent(initial()),false);h.close();assert.equal(h.consistent(initial()),false);
 const ids=make();replay(ids);let count=0;while(count<200&&ids.observe('created',target('UI'+count++,'browser_ui','chrome://omnibox-popup.top-chrome/omnibox_popup_aim.html'))){}
 assert(count<200);assert.equal(ids.consistent(initial()),false);
});

const guardianURL=panelURL.replace('panel.html','atom-guardian.html'),guardianWorkerURL=panelURL.replace('panel.html','atom-guardian-worker.js');
const guardian={documentId:'GUARDIAN',workerId:'GUARDIAN_WORKER',documentURL:guardianURL,workerURL:guardianWorkerURL};
const currentInitial=()=>[...initial(),target('GUARDIAN','background_page',guardianURL),target('GUARDIAN_WORKER','worker',guardianWorkerURL,{parentId:'GUARDIAN',parentFrameId:'GUARDIAN'})];
const currentHistory=(list=currentInitial())=>createTargetHistory({appId:'APP',panelId:'PANEL',workerId:'WORKER',panelURL,workerURL,initial:list,guardian,profile:'selected-list'});
test('pre-acquired exact guardian IDs and parent relation permit current list route only',()=>{const list=currentInitial(),h=currentHistory(list);replay(h,list);for(const url of['http://127.0.0.1:4173/__stateatom/list-start','http://127.0.0.1:4173/list/']){list[0].url=url;assert(h.observe('changed',list[0]));assert(h.consistent(list));}list[0].url='http://127.0.0.1:4173/react/';assert.equal(h.observe('changed',list[0]),false);});
test('guardian allowance never admits foreign, replaced, extra, wrong-parent or URL-less workers',()=>{for(const changed of[target('FOREIGN','worker',guardianWorkerURL,{parentId:'GUARDIAN',parentFrameId:'GUARDIAN'}),target('GUARDIAN_WORKER','worker',guardianWorkerURL,{parentId:'APP',parentFrameId:'APP'}),target('GUARDIAN_WORKER','worker','',{parentId:'GUARDIAN',parentFrameId:'GUARDIAN'}),target('GUARDIAN','background_page',guardianURL+'?changed')]){const h=currentHistory();replay(h,currentInitial());assert.equal(h.observe('created',changed),false);}for(const kind of['destroyed','crashed']){const h=currentHistory();replay(h,currentInitial());assert.equal(h.observe(kind,{targetId:'GUARDIAN_WORKER'}),false);}});
