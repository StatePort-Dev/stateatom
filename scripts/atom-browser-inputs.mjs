// SPDX-License-Identifier: Apache-2.0
// The source-map increment added only these three bundled browser entrypoints.
// All other npm inputs (including Babel/TypeScript/IDE tooling) stay forbidden.
const mapModules=new Set(['node_modules/@jridgewell/trace-mapping/dist/trace-mapping.mjs','node_modules/@jridgewell/resolve-uri/dist/resolve-uri.umd.js','node_modules/@jridgewell/sourcemap-codec/dist/sourcemap-codec.mjs']);
export function disallowedBrowserInputs(inputs){return inputs.filter(p=>/core\/analyzer|core\/bridge|src\/engine\/plugin|ide-extension|node:/.test(p)||p.includes('node_modules')&&!mapModules.has(p));}
