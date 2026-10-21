// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
import {localDerivedInstructionControls} from './fixtures/local-derived-instruction-controls.mjs';
import {localDerivedCorpus} from './fixtures/local-derived-corpus.mjs';
import {projectDerivedAnnotation} from '../core/derived-annotations.mjs';
test('instruction controls retain ten existing genuine inputs with eight main/two positive body cases, never a renamed main corpus',()=>{const controls=localDerivedInstructionControls(),all=localDerivedCorpus();assert.equal(controls.length,10);assert.equal(new Set(controls.map(c=>c.id)).size,10);assert.equal(controls.filter(c=>c.originalCampaign==='main30').length,8);assert.equal(controls.filter(c=>c.originalCampaign==='body-supplement4').length,2);for(const c of controls){assert.equal(c.campaign,'instruction-controls10');assert.deepEqual(c.facts,all.find(x=>x.id===c.id).facts);assert(projectDerivedAnnotation(c.facts));if(c.originalCampaign==='body-supplement4')assert.equal(c.facts.observedBodies,1);}assert.equal(all.length,34);});
