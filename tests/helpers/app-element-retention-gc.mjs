// SPDX-License-Identifier: Apache-2.0
// Isolated owned-object lifetime control, NOT original App/browser/GC-cause evidence.
import assert from 'node:assert/strict';import {setImmediate as nextJob} from 'node:timers/promises';
import {createAppMainPropsObserver} from '../../experiments/react19-reducer/app-main-props-observer.mjs';
import {createAppElementRetainingObserver} from '../../experiments/react19-reducer/app-element-retaining-observer.mjs';
import {appElementRetentionPolicy,recordRetentionApp} from './app-element-retention-fixture.mjs';
assert.equal(typeof globalThis.gc,'function','Test child requires its own --expose-gc');
const policy=appElementRetentionPolicy(),plain=createAppMainPropsObserver({page:'gc-control',policy}),held=createAppElementRetainingObserver({page:'gc-retained',policy});
function feed(observer){const a=recordRetentionApp(observer,policy);return new WeakRef(a.element);}
const weakControl=feed(plain),retained=feed(held);
async function collect(){for(let i=0;i<10;i++){await nextJob();globalThis.gc();}}
await collect();assert.equal(weakControl.deref(),undefined,'Owned weak control must actually be collected');assert(retained.deref(),'Research pin must remain reachable');
held.stop();await collect();assert.equal(retained.deref(),undefined,'Stop must release the owned pin');
console.log(JSON.stringify({schema:'stateatom.owned-retention-gc-control/1',node:process.version,weakControlCollected:true,retainedDuringWindow:true,releasedAfterStop:true,maximumCyclesPerControl:10,originalApp:false,browser:false,historicalCauseProven:false}));
