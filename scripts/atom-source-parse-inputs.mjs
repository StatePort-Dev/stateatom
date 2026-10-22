// SPDX-License-Identifier: Apache-2.0
// Fixed source parser only. No widening of normal or Babel analysis input gates.
const approved=new Set(['node_modules/@jridgewell/sourcemap-codec/dist/sourcemap-codec.mjs','node_modules/@jridgewell/resolve-uri/dist/resolve-uri.umd.js','node_modules/@jridgewell/trace-mapping/dist/trace-mapping.mjs','core/source-map-archive.mjs','core/source-maps.mjs','core/source-parse-contract.mjs','core/source-parse-job.mjs','packages/atom/src/source-parse-worker.mjs']);
export function assertSourceParseInputs(inputs){const actual=new Set(inputs);if(actual.size!==inputs.length||actual.size!==approved.size||[...actual].some(p=>!approved.has(p)))throw Error('Forbidden or changed source-parse Worker inputs; review exact list');}
