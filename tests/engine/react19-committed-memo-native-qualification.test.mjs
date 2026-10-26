// SPDX-License-Identifier: Apache-2.0
// OWNED real source factory results for serialized row-reader controls, NOT native proof.
import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';
import {committedMemoFactory} from '../../experiments/react19-reducer/committed-memo-bootstrap.mjs';
import {memoSourcePolicy,feedCommittedSource,attachMemoSource} from '../helpers/react19-memo-source-fixture.mjs';
const q=await import('../../experiments/react19-reducer/committed-memo-native-qualification.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return{};throw e;});
const U='Unknown/Unsupported';
function owned({phase='equal',enabled=true,stopped=false,missingOutcome=false}={}){
 const p=memoSourcePolicy(),make=vm.runInNewContext('('+committedMemoFactory(p)+')',{Array,WeakRef}),o=make({page:'owned-reader',enabled,policy:{app:p.app,main:p.main,configSite:p.configSite,native:p.native}});o.startWindow(phase);
 const source=feedCommittedSource(o,p),native=attachMemoSource(o,p,source,{kinds:['memo-bailout-return','memo-function-update-return'],usedProps:[{},null],emitOutcomes:missingOutcome?[false,true]:true});if(stopped)o.stop();const capture=JSON.parse(JSON.stringify(o.sealWindow())),selection=JSON.parse(JSON.stringify({rows:native.nodes.map((node,index)=>({index,lookup:o.lookupNode(node)})),detached:o.lookupNode({}),retention:o.referenceRetention(),hooks:{native:enabled,jsx:enabled,element:enabled,memo:enabled}}));
 return{p:{...p,page:'owned-reader'},phase:{id:phase,rowCount:2,texts:['SAME','SAME'],checked:[false,false]},capture,selection};
}
function guard(f,enabled=true){assert.equal(typeof q.guardCommittedMemoRows,'function');return q.guardCommittedMemoRows(f.capture,f.selection,f.phase,f.p,{enabled});}
test('owned equal mixed row proves one conditional positive plus one separate complete boundary',()=>{const f=owned(),r=guard(f);assert.equal(r.positive,1);assert.equal(r.boundaries,1);assert.equal(r.rows,2);assert.equal(f.selection.rows[0].lookup.status,U);assert.equal(f.selection.rows[0].lookup.links.length,0);assert.equal(f.selection.rows[1].lookup.status,'Observed');});
for(const kind of ['same','changed','toggle'])test('owned '+kind+' rows keep actual positive/boundary proof separate',()=>{const r=guard(owned({phase:kind}));assert.equal(r.positive,1);assert.equal(r.boundaries,1);});
for(const [name,mutate]of [
 ['missing selected row',f=>f.selection.rows.pop()],
 ['duplicate index',f=>f.selection.rows[1].index=0],
 ['swapped selected source proof',f=>{const a=f.selection.rows[0].lookup;f.selection.rows[0].lookup=f.selection.rows[1].lookup;f.selection.rows[1].lookup=a;}],
 ['positive source mismatch',f=>f.selection.rows[1].lookup.links[0].stateSource.callbackAssociationId='foreign'],
 ['boundary source mismatch',f=>f.selection.rows[0].lookup.memoBoundary.stateSource.callbackAssociationId='foreign'],
 ['positive commit mismatch',f=>f.selection.rows[1].lookup.links[0].nativeMemo.commitId='foreign'],
 ['boundary commit mismatch',f=>f.selection.rows[0].lookup.memoBoundary.nativeMemo.commitId='foreign'],
 ['positive fiber mismatch',f=>f.selection.rows[1].lookup.links[0].nativeMemo.fiberId='foreign'],
 ['positive native site mismatch',f=>f.selection.rows[1].lookup.links[0].nativeElement.siteId='f'.repeat(64)],
 ['positive memo site mismatch',f=>f.selection.rows[1].lookup.links[0].nativeMemo.siteId='f'.repeat(64)],
 ['boundary memo site mismatch',f=>f.selection.rows[0].lookup.memoBoundary.nativeMemo.siteId='f'.repeat(64)],
 ['boundary wrong kind',f=>f.selection.rows[0].lookup.memoBoundary.nativeMemo.kind='memo-function-update-return'],
 ['boundary counted positive',f=>f.selection.rows[0].lookup.status='Observed'],
 ['positive ref Different',f=>f.selection.rows[1].lookup.links[0].nativeMemo.propsReference='Different'],
 ['boundary ref Same',f=>f.selection.rows[0].lookup.memoBoundary.nativeMemo.propsReference='Same'],
 ['positive duplicate link',f=>f.selection.rows[1].lookup.links.push(f.selection.rows[1].lookup.links[0])],
 ['unexplained Unknown',f=>delete f.selection.rows[0].lookup.memoBoundary],
 ['boundary primary link leak',f=>f.selection.rows[0].lookup.links.push(f.selection.rows[1].lookup.links[0])],
 ['missing original complete source',f=>f.capture.stateSource.snapshot.status=U],
 ['missing original source row',f=>f.capture.stateSource.snapshot.links.pop()],
 ['source wrong window',f=>f.selection.rows[1].lookup.window++],
 ['selected wrong page',f=>f.selection.rows[1].lookup.page='foreign'],
 ['property-origin promotion',f=>f.selection.rows[1].lookup.selectedPropertyOrigin='Observed'],
 ['boundary association promotion',f=>f.selection.rows[0].lookup.selectedCommittedSourceAssociation='Observed'],
 ['full-path promotion',f=>f.selection.rows[1].lookup.fullPath=true],
 ['detached positive',f=>f.selection.detached=f.selection.rows[1].lookup],
 ['missing hook',f=>f.selection.hooks.memo=false],
 ['capped native collector',f=>f.selection.retention.nativeElement.capped=true],
 ['different current commit',f=>{f.selection.rows[1].lookup.links[0].nativeMemo.commitId='owned-reader:react19:commit:99';f.selection.rows[1].lookup.links[0].nativeElement.commitId='owned-reader:react19:commit:99';}],
 ['missing callback coverage',f=>f.selection.retention.callbacks=1],
 ['collecting source',f=>f.selection.retention.collecting=true],
 ['invalid reference source',f=>f.selection.retention.invalid=true]
])test('owned saved row guard refuses '+name,()=>{const f=owned();mutate(f);assert.equal(typeof q.guardCommittedMemoRows,'function');assert.throws(()=>guard(f));});
test('missing real owned memo outcome cannot qualify complete selected row matrix',()=>{assert.equal(typeof q.guardCommittedMemoRows,'function');assert.throws(()=>guard(owned({missingOutcome:true})));});
test('Off owned rows remain Unknown and empty, no events or hooks',()=>{const f=owned({enabled:false}),r=guard(f,false);assert.equal(r.positive,0);assert.equal(r.boundaries,0);assert.equal(f.selection.retention.callbacks,0);});
test('Stop owned rows remain Unknown, zero reference bindings, terminal collector',()=>{const f=owned({phase:'stopped',stopped:true}),r=guard(f);assert.equal(r.positive,0);assert.equal(r.boundaries,0);assert.equal(f.selection.retention.nativeElement.bindings,0);});
for(const name of ['native','jsx','element','memo'])test('Off cannot silently retain '+name+' hook',()=>{const f=owned({enabled:false});f.selection.hooks[name]=true;assert.equal(typeof q.guardCommittedMemoRows,'function');assert.throws(()=>guard(f,false));});
test('new classifier refuses source-control execution and old missing-header cases',()=>{assert.equal(typeof q.classifyCommittedMemoRun,'function');const r=q.classifyCommittedMemoRun({execution:'SOURCE_CONTROL_NOT_NATIVE_PROOF',runs:[]},{schema:'stateatom.retained-app-state-source-case/1'});assert.notEqual(r.status,'PASS_BOUNDED_COMMITTED_MEMO_REFERENCE_NOT_FULL_A02');assert.equal(r.fullA02,false);assert.equal(r.acceptedPositiveLinks,0);});
