// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {transform} from 'esbuild';
import {instrumentCallbackCopyIntervals} from '../../experiments/react19-reducer/callback-copy-transform.mjs';
import {instrumentJSXConfigInputs} from '../../experiments/react19-reducer/jsx-config-transform.mjs';
import {jsxConfigProfile,transformJSXConfigGrammar} from '../../experiments/react19-reducer/jsx-config-vendor.mjs';
import {transformPropCopyGrammar} from '../../experiments/react19-reducer/prop-copy-vendor.mjs';
import {syntheticJSXSource,syntheticReactCore} from '../helpers/react19-jsx-config-controls.mjs';
import {callbackJSXCases,expectedCallbackJSXLinks,prepareCallbackJSXCase,executeCallbackJSXCase,syntheticClassicCore} from '../helpers/react19-callback-jsx-controls.mjs';
const nativeJSX=transformJSXConfigGrammar(syntheticJSXSource,jsxConfigProfile.file).code;
const nativeClassic=transformPropCopyGrammar(syntheticClassicCore).code;
for(const id of callbackJSXCases)test('composed callback source preserves original/off/on semantics: '+id,async()=>{
 const runs={};for(const mode of ['original','off','on'])runs[mode]=executeCallbackJSXCase({reactSource:id==='classic-new'?(mode==='original'?syntheticClassicCore:nativeClassic):syntheticReactCore,jsxSource:mode==='original'?syntheticJSXSource:nativeJSX,prepared:await prepareCallbackJSXCase({caseName:id,mode})});
 const{original,off,on}=runs;assert.deepEqual(on.summary,original.summary);assert.deepEqual(off.summary,original.summary);assert.deepEqual(on.trace,original.trace);assert.deepEqual(off.trace,original.trace);assert.equal(on.warnings,original.warnings);assert.equal(off.warnings,original.warnings);
 for(const r of [original,off,on]){assert.equal(r.summary.helperFrame,false);assert.equal(r.summary.valueTraps,0);assert.equal(r.summary.iteratorCalls,0);assert.equal(r.summary.intrinsicCalls,0);assert.equal(r.summary.lexicalOK,true);assert.equal(r.hookGetterReads,0);assert.equal(r.sourceOnly,true);for(const k of ['propStorage','propTransfer','fieldOwnership','stateRevision','selectedPropertyOrigin'])assert.equal(r.snapshot[k],'Unknown/Unsupported');assert.equal(r.snapshot.fullPath,false);}
 assert.equal(on.snapshot.links.length,expectedCallbackJSXLinks[id]);assert.equal(original.snapshot.links.length,0);assert.equal(off.snapshot.links.length,0);
 for(const selected of on.selected)assert.equal(selected.status,expectedCallbackJSXLinks[id]?'Observed':'Unknown/Unsupported');
 if(expectedCallbackJSXLinks[id]){assert.equal(on.identityOracle.every(x=>x.valueIsOriginalCallbackItem&&x.configIsReturnedProps),true);assert.equal(on.identityOracle.length,expectedCallbackJSXLinks[id]);}
 if(id==='freeze-mutate'){assert.equal(on.summary.storedFirst,false);assert.equal(on.summary.storedSecond,true);assert.equal(on.snapshot.propStorage,'Unknown/Unsupported');}
 if(id==='key-getter')assert.equal(on.summary.keyReads,1);
 if(id==='expression-getter')assert.equal(on.summary.reads,1);
 if(id.startsWith('throw-')||id==='freeze-throw')assert.equal(on.summary.sameThrown,true);
 if(id==='foreign-map')assert.equal(on.summary.callbackLength,1);
 if(id==='classic-new'){assert.equal(on.snapshot.schema,'stateatom.callback-copy-interval/1');assert(on.snapshot.links[0].copyOccurrence);}else assert.equal(on.snapshot.schema,'stateatom.callback-jsx-config-interval/1');
 assert.doesNotMatch(JSON.stringify(on.snapshot),/private-owned/);
});
for(const hook of ['missing','accessor','throwing'])test('composed '+hook+' metadata cannot alter original callback result',async()=>{const original=executeCallbackJSXCase({reactSource:syntheticReactCore,jsxSource:syntheticJSXSource,prepared:await prepareCallbackJSXCase({caseName:'ordinary',mode:'original'})}),on=executeCallbackJSXCase({reactSource:syntheticReactCore,jsxSource:nativeJSX,prepared:await prepareCallbackJSXCase({caseName:'ordinary'}),hook});assert.deepEqual(on.summary,original.summary);assert.deepEqual(on.trace,original.trace);assert.equal(on.hookGetterReads,0);assert.equal(on.snapshot.links.length,0);});
test('actual Main interval plus automatic JSX admits both branch input sites without running body',async()=>{const file='.runtime/todomvc/examples/react/src/todo/components/main.jsx',s=await readFile(file,'utf8'),i=instrumentCallbackCopyIntervals(s,file,{enabled:true});assert.equal(i.skipped,false);for(const[text,count]of[[s,1],[i.code,2]]){const c=await transform(text,{loader:'jsx',jsx:'automatic',format:'esm',target:'es2022'}),r=instrumentJSXConfigInputs(c.code,'owned-compiled-main.js',{enabled:true});assert.equal(r.skipped,false);assert.equal(r.sites.length,count);}});
test('new zero-option source runner refuses arguments before registration or VM',async()=>{const{runCallbackJSXSourceQualification}=await import('../../experiments/react19-reducer/callback-jsx-source-run.mjs');await assert.rejects(runCallbackJSXSourceQualification(['--unknown']),e=>e.code==='INVALID_ARGUMENTS');});
