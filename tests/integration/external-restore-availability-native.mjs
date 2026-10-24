// SPDX-License-Identifier: Apache-2.0
// Distinct fixed external-ABA case; cannot invoke the exhausted passive case.
import path from 'node:path';import {pathToFileURL} from 'node:url';
import {runRestoreAvailabilityNative,restoreAvailabilityDriverError} from './restore-availability-native.mjs';
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)runRestoreAvailabilityNative(process.argv.slice(2),'external-aba').catch(e=>{console.error('EXTERNAL_RESTORE_AVAILABILITY_ERROR',restoreAvailabilityDriverError(e));process.exitCode=1;});
