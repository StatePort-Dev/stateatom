// SPDX-License-Identifier: Apache-2.0
// Closed portal-chooser/current82 preparation; no browser/model/profile writes.
import path from 'node:path';import {pathToFileURL} from 'node:url';
import {prepareComparisonEvaluation} from './prepare-comparison-evaluation.mjs';
import {comparisonDriverError} from './comparison-evaluation-case.mjs';
export function preparePortalComparisonEvaluation(args=process.argv.slice(2)){return prepareComparisonEvaluation(args,{candidateKey:'portal-chooser'});}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)preparePortalComparisonEvaluation().catch(e=>{console.error('PREPARE_PORTAL_COMPARISON_ERROR',comparisonDriverError(e));process.exitCode=1;});
