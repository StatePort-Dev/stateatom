// SPDX-License-Identifier: Apache-2.0
// Closed native-chooser/current80 preparation; no browser/model/profile writes.
import path from 'node:path';import {pathToFileURL} from 'node:url';
import {prepareComparisonEvaluation} from './prepare-comparison-evaluation.mjs';
import {comparisonDriverError} from './comparison-evaluation-case.mjs';
export function prepareChooserComparisonEvaluation(args=process.argv.slice(2)){return prepareComparisonEvaluation(args,{candidateKey:'native-chooser'});}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)prepareChooserComparisonEvaluation().catch(e=>{console.error('PREPARE_CHOOSER_COMPARISON_ERROR',comparisonDriverError(e));process.exitCode=1;});
