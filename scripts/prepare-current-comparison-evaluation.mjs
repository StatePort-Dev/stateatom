// SPDX-License-Identifier: Apache-2.0
// Closed current80 entrypoint; never accepts output/profile/retry options.
import path from 'node:path';import {pathToFileURL} from 'node:url';
import {prepareComparisonEvaluation} from './prepare-comparison-evaluation.mjs';
import {comparisonDriverError} from './comparison-evaluation-case.mjs';
export function prepareCurrentComparisonEvaluation(args=process.argv.slice(2)){
 return prepareComparisonEvaluation(args,{candidateKey:'current-owned'});
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)prepareCurrentComparisonEvaluation().catch(e=>{console.error('PREPARE_CURRENT_COMPARISON_ERROR',comparisonDriverError(e));process.exitCode=1;});
