// SPDX-License-Identifier: Apache-2.0
import path from'node:path';import{pathToFileURL}from'node:url';
import{prepareRestoreAvailabilityCase}from'./prepare-current-clean-editor.mjs';
import{restoreAvailabilityDriverError}from'../tests/integration/current-clean-editor-native.mjs';
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)prepareRestoreAvailabilityCase(process.argv.slice(2),'corrected-current-clean-external-aba').catch(e=>{console.error('PREPARE_CORRECTED_CURRENT_CLEAN_EDITOR_ERROR',restoreAvailabilityDriverError(e));process.exitCode=1;});
