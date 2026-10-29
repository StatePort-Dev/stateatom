import test from 'node:test';
import assert from 'node:assert/strict';
import {collectElementProperties,refreshElementProperties,refreshElementSnapshot,projectElementProperties} from '../../packages/atom/src/element-properties.mjs';
const identity=(property,value,node='n')=>({document:'d',node,property,value});
const selection={selector:'#b',tag:'button',property:'text',value:'Confirm',observedAt:1,domIdentity:identity('text','Confirm')};
function fixture(overrides={}){return {selection,analysis:{sources:[{file:'text.js'}]},identify:async p=>identity(p,p==='text'?'Confirm':true),observe:async p=>({property:p,value:true,trace:{target:p}}),resolve:async s=>({sources:[{file:s.property+'.js'}]}),isCurrent:()=>true,now:()=>2,...overrides};}
test('one element acquires independent results without changing primary property',async()=>{const bundle=await collectElementProperties(fixture());assert.deepEqual(bundle.properties.map(r=>r.property),['text','disabled']);assert.equal(bundle.properties[1].selection.value,true);assert.equal(bundle.properties[1].selection.observedAt,2);assert.equal(bundle.properties[1].analysis.sources[0].file,'disabled.js');assert.equal(selection.property,'text');});
test('inapplicable state is omitted; native unsupported is explicit and never false',async()=>{assert.equal((await collectElementProperties(fixture({selection:{...selection,tag:'p'}}))).properties.length,1);const b=await collectElementProperties(fixture({selection:{...selection,tag:'select'},identify:async p=>p==='text'?selection.domIdentity:null}));assert.equal(b.properties[1].status,'Unknown/Unsupported');assert.equal(b.properties[1].selection,undefined);});
test('replacement or primary change during acquisition fails the whole result',async()=>{await assert.rejects(collectElementProperties(fixture({identify:async p=>identity(p,true,'replacement')})),/changed/);await assert.rejects(collectElementProperties(fixture({isCurrent:()=>false})),/changed/);});
test('secondary change invalidates only that recorded result',async()=>{const b=await collectElementProperties(fixture());const next=await refreshElementProperties(b,async p=>identity(p,p==='text'?'Confirm':false),()=>true);assert.equal(next.properties[0].status,'Observed');assert.equal(next.properties[1].status,'Stale');assert.equal(next.properties[1].selection.value,true);assert.equal(next.properties[1].analysis,undefined);});
test('replacement invalidates all records; stale never regains authority',async()=>{const b=await collectElementProperties(fixture());const next=await refreshElementProperties(b,async p=>identity(p,p==='text'?'Confirm':true,'replacement'),()=>true);assert(next.properties.every(r=>r.status==='Stale'&&!r.analysis));});
test('input and source edits project historical results without mutating stored snapshot',async()=>{const b=await collectElementProperties(fixture());const s={selection,elementInspection:b,inspectionGeneration:3,inputEditedInspection:3};assert(projectElementProperties(s).properties.every(r=>r.status==='Stale'&&!r.analysis));assert.equal(b.properties[0].status,'Observed');});
test('unavailable secondary trace stays local and preserves primary observation',async()=>{const b=await collectElementProperties(fixture({observe:async()=>({property:'disabled',status:'Unknown/Unsupported',reason:'Trace helper unavailable'})}));assert.equal(b.properties[0].selection.value,'Confirm');assert.equal(b.properties[1].status,'Unknown/Unsupported');assert.equal(b.properties[1].selection,undefined);});
test('editor refresh keeps separately timed new DOM values without reviving old explanations',async()=>{const b=await collectElementProperties(fixture());const next=await refreshElementProperties(b,async p=>identity(p,p==='text'?'Ready':false),()=>true,{recordLatest:true,now:()=>10});const s=projectElementProperties({selection,elementInspection:next,inspectionGeneration:1,inputEditedInspection:1});assert(s.properties.every(r=>r.status==='Stale'&&!r.analysis));assert.deepEqual(s.properties.map(r=>r.latestObservation.value),['Ready',false]);assert.equal(s.properties[0].selection.value,'Confirm');assert.equal(s.properties[0].latestObservation.observedAt,10);const expired=projectElementProperties({...{elementInspection:next},selection:null,stale:{reason:'Detached'}});assert(expired.properties.every(r=>!r.latestObservation));});

test('latest native values are cleared on replacement, including replacement during the final guard',async()=>{const b=await collectElementProperties(fixture());const next=await refreshElementProperties(b,async p=>identity(p,p==='text'?'Ready':false),()=>true,{recordLatest:true});for(const delayed of [false,true]){let calls=0;const replaced=await refreshElementProperties(next,async p=>identity(p,p==='text'?'Ready':false,++calls>=(delayed?3:1)?'replacement':'n'),()=>true,{recordLatest:true});assert(replaced.properties.every(r=>r.status==='Stale'&&!r.analysis&&!r.latestObservation));}});

for(const outcome of ['newer-value','new-selection','native-failure'])test('snapshot commit guard preserves '+outcome,async()=>{
 const state={selection,elementInspection:await collectElementProperties(fixture()),inspectionGeneration:1,run:'run'};
 let release,entered;const paused=new Promise(r=>entered=r),gate=new Promise((resolve,reject)=>release={resolve,reject});
 let once=true;
 const older=refreshElementSnapshot(state,async(selector,p)=>{assert.equal(selector,'#b');if(once){once=false;entered();await gate;}return identity(p,p==='text'?'Confirm':true);},()=>true);
 const settled=older.then(()=>({}),error=>({error}));await paused;
 if(outcome==='new-selection'){state.selection={...selection,selector:'#new'};state.inspectionGeneration++;state.elementInspection={schemaVersion:1,properties:[]};}
 else await refreshElementSnapshot(state,async(_,p)=>identity(p,p==='text'?'Confirm':false),()=>true);
 const newer=state.elementInspection;
 if(outcome==='native-failure')release.reject(Error('native read failed'));else release.resolve();
 const result=await settled;
 if(outcome==='newer-value'){assert.ifError(result.error);assert.equal(state.elementInspection.properties[1].status,'Stale');}
 else if(outcome==='native-failure')assert.match(result.error?.message||'',/native read failed/);
 else assert.equal(result.error?.code,'STALE_ELEMENT_REFRESH');
 assert.equal(state.elementInspection,newer);
});
