// SPDX-License-Identifier: Apache-2.0
// A closed second entrypoint, not an arbitrary case/output/profile CLI.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {prepareComparisonEvaluation} from './prepare-comparison-evaluation.mjs';
import {comparisonDriverError} from './comparison-evaluation-case.mjs';
export function prepareShortComparisonEvaluation(args=process.argv.slice(2)){
 return prepareComparisonEvaluation(args,{candidateKey:'short-owned'});
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)prepareShortComparisonEvaluation().catch(e=>{console.error('PREPARE_SHORT_COMPARISON_ERROR',comparisonDriverError(e));process.exitCode=1;});
