// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,rm,appendFile} from 'node:fs/promises';
import {prepareSelectedListHeldOut,heldOutSource} from './helpers/selected-list-held-out.mjs';
import {buildListFieldCompilation} from '../src/engine/list-field-compilation.mjs';
import {establishListFieldEffects,listFieldEffectsView,validateListFieldEffects} from '../src/engine/list-field-effects.mjs';
test('fixed renamed and restructured original list graph gets its own finite source account and still revokes on drift',async()=>{
 const workspace=await mkdtemp('/tmp/stateatom-held-out-source-');
 try{
  await prepareSelectedListHeldOut('.runtime/todomvc/examples/react',workspace+'/app');
  const options={...heldOutSource,projectRoot:workspace,toolRoot:process.cwd()},compilation=await buildListFieldCompilation(options),proof=await establishListFieldEffects(compilation),view=listFieldEffectsView(proof);
  assert.equal(view.status,'Code-linked');assert.equal(view.fullPath,false);assert.match(view.profile,/caption/);
  assert(compilation.manifest.program.modules.some(m=>m.fieldRead?.parameterProp==='record'&&m.fieldRead?.field==='caption'));
  await appendFile(workspace+'/app/src/features/tasks/views/header.jsx','\ndocument.addEventListener("click", () => { globalThis.unknownWriter = true; });\n');
  assert.equal(await validateListFieldEffects(proof),false);
  const changed=await buildListFieldCompilation(options);assert.equal(listFieldEffectsView(await establishListFieldEffects(changed)).status,'Unknown/Unsupported');
 }finally{await rm(workspace,{recursive:true,force:true});}
});
