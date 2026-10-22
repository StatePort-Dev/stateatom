// SPDX-License-Identifier: Apache-2.0
import {runGuardianDocument} from './guardian-document.mjs';
import {runSourceParseDocument} from './source-parse-document.mjs';
runGuardianDocument({runtime:chrome.runtime,WorkerCtor:Worker,documentURL:location.href});
runSourceParseDocument({runtime:chrome.runtime,WorkerCtor:Worker,documentURL:location.href});
