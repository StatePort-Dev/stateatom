// SPDX-License-Identifier: Apache-2.0
// New fixed external case only; importing this entry prepares nothing.
import path from 'node:path';import {pathToFileURL} from 'node:url';
import {prepareRestoreAvailabilityCase} from './prepare-restore-availability.mjs';
import {restoreAvailabilityDriverError} from '../tests/integration/restore-availability-native.mjs';
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)prepareRestoreAvailabilityCase(process.argv.slice(2),'external-aba').catch(e=>{console.error('PREPARE_EXTERNAL_RESTORE_AVAILABILITY_ERROR',restoreAvailabilityDriverError(e));process.exitCode=1;});
