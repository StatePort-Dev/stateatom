// SPDX-License-Identifier: Apache-2.0
import path from 'node:path';
import * as registry from '../../scripts/comparison-evaluation-case.mjs';

// Synthetic guard input only. Never write this projection over a historical case
// or pass it to a native runner: source paths and UID are intentionally local.
export function comparisonCaseFixture(template, key) {
  const c = registry.comparisonCandidate(key);
  const s = structuredClone(template);
  Object.assign(s, {
    atomHandoff: c.handoff,
    packedAdmission: c.admission,
    packedTypes: path.dirname(c.handoff) + '/type-consumer-result.json',
  });
  Object.assign(s.profile, {
    path: registry.comparisonCacheProfile,
    previousResult: registry.comparisonPreviousResult,
    uid: process.getuid(),
  });
  s.launchArguments = registry.comparisonLaunchArguments(s.profile.path);
  return s;
}
