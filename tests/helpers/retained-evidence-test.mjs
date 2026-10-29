// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';

// These assertions inspect previously issued artifacts or historical Git blobs.
// Missing evidence must fail in the explicit retained-evidence run. A clean
// source checkout reports them as SKIP, never as newly passing release evidence.
export function retainedTest(name, fn) {
  return test('[retained evidence] ' + name, {
    skip: process.env.STATEATOM_RETAINED_EVIDENCE === '1'
      ? false
      : 'Requires original local archives/history; run npm run test:with-retained',
  }, fn);
}
