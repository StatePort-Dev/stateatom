// SPDX-License-Identifier: Apache-2.0
import path from 'node:path';import {pathToFileURL} from 'node:url';
import {prepareRestoreAvailabilityCase} from './prepare-restore-availability.mjs';
import {restoreAvailabilityDriverError} from '../tests/integration/restore-availability-native.mjs';
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)prepareRestoreAvailabilityCase(process.argv.slice(2),'converged-external-aba').catch(e=>{console.error('PREPARE_CONVERGED_RESTORE_AVAILABILITY_ERROR',restoreAvailabilityDriverError(e));process.exitCode=1;});
