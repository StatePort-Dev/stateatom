// SPDX-License-Identifier: Apache-2.0
import path from 'node:path';import {pathToFileURL} from 'node:url';
import {runRestoreAvailabilityNative,restoreAvailabilityDriverError} from './restore-availability-native.mjs';
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)runRestoreAvailabilityNative(process.argv.slice(2),'converged-external-aba').catch(e=>{console.error('CONVERGED_RESTORE_AVAILABILITY_ERROR',restoreAvailabilityDriverError(e));process.exitCode=1;});
