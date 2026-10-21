// SPDX-License-Identifier: Apache-2.0
// Reviewed exact static Worker inputs. Never expands the ordinary browser whitelist.
import approved from './atom-source-analysis-inputs.json' with {type:'json'};
export function assertSourceAnalysisInputs(inputs){
 const actual=new Set(inputs),expected=new Set(approved);
 if(actual.size!==inputs.length||actual.size!==expected.size||[...actual].some(p=>!expected.has(p)||/node:|core\/(?:analyzer|action-analysis)\.mjs|core\/bridge|ide-extension|src\/engine\/plugin|compiler-sfc/.test(p)))throw Error('Forbidden or changed source-analysis worker inputs; review exact list');
}
