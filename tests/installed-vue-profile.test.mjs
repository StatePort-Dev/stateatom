// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {stateatomPlugin} from '../src/engine/vite-install.mjs';

test('installed profile rejects an unknown explicit profile instead of silently serving it', () => {
  assert.throws(() => stateatomPlugin({enabled:true,profile:'vue-three'}), /profile.*vue3/i);
});

for (const option of ['reactCommit','reactHostProps','fetchInitiators','reactStateHandoffs','sourceWrites','queryHandoffs','queryCallCensus','writeAccessGuards','queryWriteAccessGuards','reactWriteAccessGuards','actionTrace']) {
  test('installed Vue profile refuses mixed opt-in ' + option, () => {
    assert.throws(() => stateatomPlugin({enabled:true,profile:'vue3',[option]:true}), /Vue.*profile.*option|option.*Vue.*profile/i);
  });
}

test('installed Vue profile refuses a missing original Vue compiler plugin before metadata access', () => {
  const p=stateatomPlugin({enabled:true,profile:'vue3',root:'/missing-private-project'});
  assert.throws(() => p.configResolved({root:'/missing-private-project',plugins:[]}), /Vue.*plugin|plugin.*Vue/i);
});

test('disabled Vue profile is transparent to unadmitted versions and absent metadata', () => {
  const p=stateatomPlugin({enabled:false,profile:'vue3',root:'/missing-private-project'});
  assert.doesNotThrow(() => p.configResolved({root:'/missing-private-project',plugins:[]}));
  assert.equal(p.transform('const value=1;','/missing-private-project/app.js'),undefined);
  assert.equal(p.apply,'serve');
  assert.equal(p.enforce,'pre');
});

test('default classic React conflict and controlled first-read refusals remain exact', () => {
  const p=stateatomPlugin({enabled:true,reactHostProps:true});
  assert.throws(() => p.configResolved({plugins:[{name:'vite:react-babel'}],esbuild:{jsx:'automatic'}}), /React transform conflict/);
  assert.throws(() => stateatomPlugin({enabled:true,profile:'vue3',firstReadContracts:true}), /Controlled first-read/);
});

test('Vue environment admits only the declared exact Node/Vite/Vue tuple', async () => {
  const {assertVue3Profile}=await import('../src/engine/vite-install-profile.mjs');
  const exact={node:'18.18.2',vite:'4.4.9',vue:'3.3.4'};
  assert.doesNotThrow(() => assertVue3Profile(exact));
  for (const patch of [{node:'18.18.1'},{node:'18.20.8'},{node:'24.19.0'},{vite:'4.4.10'},{vite:'7.3.7'},{vue:'3.5.44'},{vue:'3.3.5'},{vite:undefined},{vue:null}]) {
    assert.throws(() => assertVue3Profile({...exact,...patch}), /Vue.*18\.18\.2.*4\.4\.9.*3\.3\.4/i);
  }
});
