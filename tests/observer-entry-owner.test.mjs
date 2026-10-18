// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {assertEntryOwner} from '../stateatom-compiler-probe/references.mjs';
test('genuine foreign observer cannot borrow another page marker despite internally consistent event and node',()=>{assert.throws(()=>assertEntryOwner({marker:'page-A:scope12:1477',ownerPage:'page-B',eventPage:'page-B',nodeId:'page-B:74'}),/observer page/);});
test('foreign event cannot borrow a marker and owner page',()=>{assert.throws(()=>assertEntryOwner({marker:'page-A:scope12:1477',ownerPage:'page-A',eventPage:'page-B',nodeId:'page-B:74'}),/observer page/);});
test('missing or foreign node identity cannot borrow an otherwise matching owner',()=>{for(const nodeId of[null,'page-B:74'])assert.throws(()=>assertEntryOwner({marker:'page-A:scope12:1477',ownerPage:'page-A',eventPage:'page-A',nodeId}),/observer page/);});
test('matching marker, owner, event page and node remain eligible for scoped acquisition',()=>{assert.doesNotThrow(()=>assertEntryOwner({marker:'page-A:scope12:1477',ownerPage:'page-A',eventPage:'page-A',nodeId:'page-A:74'}));});
